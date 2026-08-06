from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import json
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
import razorpay
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File, Form, Header, Query
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

from ai_service import stream_chat, price_predict, product_recommendations
from storage_service import init_storage, put_object, get_object
from seed_data import seed_products_and_categories

# ---------- Setup ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
APP_NAME = os.environ.get('APP_NAME', 'farm2home')

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '').strip()
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '').strip()
rzp_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

app = FastAPI(title="Farm2Home API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("farm2home")


# ---------- Utilities ----------
def now_utc():
    return datetime.now(timezone.utc)


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {"sub": user_id, "email": email, "role": role,
               "exp": now_utc() + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _clean(obj):
    if isinstance(obj, dict):
        obj.pop('_id', None)
        obj.pop('password_hash', None)
        return obj
    return obj


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"password_hash": 0, "_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_role(*roles):
    async def _dep(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return _dep


# ---------- Pydantic Models ----------
class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: Literal["customer", "farmer"] = "customer"
    phone: Optional[str] = ""
    location: Optional[str] = ""
    farmName: Optional[str] = ""


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ProductInput(BaseModel):
    name: str
    category: str
    subcategory: Optional[str] = ""
    description: str = ""
    price: float
    originalPrice: Optional[float] = None
    discount: Optional[int] = 0
    stock: int = 0
    unit: str = "Kg"
    harvestDate: Optional[str] = ""
    expiryDate: Optional[str] = ""
    freshnessLevel: Optional[str] = "Farm Fresh"
    isOrganic: Optional[bool] = False
    location: Optional[str] = ""
    deliveryRadius: Optional[str] = "50 km"
    minOrderQty: Optional[int] = 1
    images: List[str] = []


class CartItemInput(BaseModel):
    productId: str
    quantity: int = 1


class CartUpdate(BaseModel):
    productId: str
    quantity: int


class Address(BaseModel):
    fullName: str
    phone: str
    street: str
    city: str
    state: str
    pincode: str


class OrderCreateInput(BaseModel):
    address: Address
    paymentMethod: Literal["upi", "razorpay", "cod", "card"]
    couponCode: Optional[str] = ""


class RazorpayVerifyInput(BaseModel):
    orderId: str  # internal order id
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class ChatInput(BaseModel):
    message: str
    sessionId: Optional[str] = None
    context: Optional[str] = "general"  # general, farmer_support


class RecommendInput(BaseModel):
    preferences: Optional[str] = ""


class PricePredictInput(BaseModel):
    crop: str
    location: Optional[str] = ""
    currentPrice: Optional[float] = None


# ---------- AUTH ROUTES ----------
def _set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=7*24*3600, path="/"
    )


@api.post("/auth/register")
async def register(payload: RegisterInput, response: Response):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "email": email,
        "name": payload.name,
        "role": payload.role,
        "phone": payload.phone,
        "location": payload.location,
        "farmName": payload.farmName if payload.role == "farmer" else "",
        "avatar": f"https://api.dicebear.com/7.x/thumbs/svg?seed={uid}",
        "verified": False,
        "password_hash": hash_password(payload.password),
        "created_at": now_utc().isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(uid, email, payload.role)
    _set_auth_cookie(response, token)
    return {"user": _clean({**doc}), "token": token}


@api.post("/auth/login")
async def login(payload: LoginInput, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], email, user["role"])
    _set_auth_cookie(response, token)
    user.pop("_id", None); user.pop("password_hash", None)
    return {"user": user, "token": token}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": user}


# ---------- CATEGORY ROUTES ----------
@api.get("/categories")
async def list_categories():
    cats = await db.categories.find({}, {"_id": 0}).to_list(1000)
    return cats


# ---------- PRODUCT ROUTES ----------
@api.get("/products")
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    organic: Optional[bool] = None,
    maxPrice: Optional[float] = None,
    sort: Optional[str] = "popular",
    farmerId: Optional[str] = None,
    limit: int = 100,
):
    q = {}
    if category and category != "All":
        q["category"] = category
    if organic is True:
        q["isOrganic"] = True
    if maxPrice is not None:
        q["price"] = {"$lte": maxPrice}
    if farmerId:
        q["farmerId"] = farmerId
    if search:
        q["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
            {"farmerName": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]
    sort_map = {
        "price-low": [("price", 1)],
        "price-high": [("price", -1)],
        "rating": [("rating", -1)],
        "popular": [("salesCount", -1)],
        "newest": [("created_at", -1)],
    }
    cursor = db.products.find(q, {"_id": 0}).sort(sort_map.get(sort or "popular", sort_map["popular"])).limit(limit)
    return await cursor.to_list(limit)


@api.get("/products/{pid}")
async def get_product(pid: str):
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@api.post("/products")
async def create_product(payload: ProductInput, user: dict = Depends(require_role("farmer", "admin"))):
    pid = f"p-{uuid.uuid4().hex[:10]}"
    orig = payload.originalPrice if payload.originalPrice else payload.price
    doc = {
        **payload.model_dump(),
        "id": pid,
        "originalPrice": orig,
        "farmerId": user["id"],
        "farmerName": user.get("name", ""),
        "farmerAvatar": user.get("avatar", ""),
        "rating": 5.0,
        "reviewsCount": 0,
        "salesCount": 0,
        "created_at": now_utc().isoformat(),
    }
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/products/{pid}")
async def update_product(pid: str, payload: ProductInput, user: dict = Depends(require_role("farmer", "admin"))):
    p = await db.products.find_one({"id": pid})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    if user["role"] != "admin" and p.get("farmerId") != user["id"]:
        raise HTTPException(status_code=403, detail="Not your product")
    await db.products.update_one({"id": pid}, {"$set": {**payload.model_dump(), "updated_at": now_utc().isoformat()}})
    updated = await db.products.find_one({"id": pid}, {"_id": 0})
    return updated


@api.delete("/products/{pid}")
async def delete_product(pid: str, user: dict = Depends(require_role("farmer", "admin"))):
    p = await db.products.find_one({"id": pid})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    if user["role"] != "admin" and p.get("farmerId") != user["id"]:
        raise HTTPException(status_code=403, detail="Not your product")
    await db.products.delete_one({"id": pid})
    return {"ok": True}


# ---------- IMAGE UPLOAD ----------
@api.post("/upload/image")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = (file.filename or "img.jpg").rsplit(".", 1)[-1].lower()
    if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        raise HTTPException(status_code=400, detail="Unsupported image format")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 5MB)")
    path = f"{APP_NAME}/uploads/{user['id']}/{uuid.uuid4().hex}.{ext}"
    mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
            "webp": "image/webp", "gif": "image/gif"}[ext]
    try:
        result = put_object(path, data, mime)
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "user_id": user["id"],
        "size": result.get("size", 0),
        "content_type": mime,
        "created_at": now_utc().isoformat(),
    })
    backend = os.environ.get("REACT_APP_BACKEND_URL", "")
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}


@api.get("/files/{path:path}")
async def serve_file(path: str):
    try:
        data, ct = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
    return Response(content=data, media_type=ct)


# ---------- CART ROUTES ----------
async def _get_or_create_cart(user_id: str) -> dict:
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        cart = {"id": str(uuid.uuid4()), "user_id": user_id, "items": [], "updated_at": now_utc().isoformat()}
        await db.carts.insert_one(cart)
    return cart


async def _hydrate_cart(cart: dict) -> dict:
    items = []
    for it in cart.get("items", []):
        p = await db.products.find_one({"id": it["productId"]}, {"_id": 0})
        if p:
            items.append({"product": p, "quantity": it["quantity"]})
    return {"id": cart["id"], "items": items}


@api.get("/cart")
async def get_cart(user: dict = Depends(get_current_user)):
    cart = await _get_or_create_cart(user["id"])
    return await _hydrate_cart(cart)


@api.post("/cart/add")
async def add_to_cart(payload: CartItemInput, user: dict = Depends(get_current_user)):
    cart = await _get_or_create_cart(user["id"])
    items = cart.get("items", [])
    found = False
    for it in items:
        if it["productId"] == payload.productId:
            it["quantity"] += payload.quantity
            found = True
            break
    if not found:
        items.append({"productId": payload.productId, "quantity": payload.quantity})
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": items, "updated_at": now_utc().isoformat()}})
    cart["items"] = items
    return await _hydrate_cart(cart)


@api.post("/cart/update")
async def update_cart(payload: CartUpdate, user: dict = Depends(get_current_user)):
    cart = await _get_or_create_cart(user["id"])
    items = cart.get("items", [])
    if payload.quantity <= 0:
        items = [it for it in items if it["productId"] != payload.productId]
    else:
        for it in items:
            if it["productId"] == payload.productId:
                it["quantity"] = payload.quantity
                break
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": items, "updated_at": now_utc().isoformat()}})
    cart["items"] = items
    return await _hydrate_cart(cart)


@api.post("/cart/clear")
async def clear_cart(user: dict = Depends(get_current_user)):
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": [], "updated_at": now_utc().isoformat()}})
    return {"ok": True}


# ---------- WISHLIST ----------
@api.get("/wishlist")
async def get_wishlist(user: dict = Depends(get_current_user)):
    doc = await db.wishlists.find_one({"user_id": user["id"]}) or {"items": []}
    return {"items": doc.get("items", [])}


@api.post("/wishlist/toggle")
async def toggle_wishlist(body: dict, user: dict = Depends(get_current_user)):
    pid = body.get("productId")
    if not pid:
        raise HTTPException(status_code=400, detail="productId required")
    doc = await db.wishlists.find_one({"user_id": user["id"]}) or {"user_id": user["id"], "items": []}
    items = doc.get("items", [])
    if pid in items:
        items.remove(pid)
    else:
        items.append(pid)
    await db.wishlists.update_one({"user_id": user["id"]}, {"$set": {"items": items}}, upsert=True)
    return {"items": items}


# ---------- ORDERS ----------
def _calc_totals(items: list, coupon: str):
    subtotal = sum(i["price"] * i["quantity"] for i in items)
    gst = round(subtotal * 0.05)
    delivery = 0 if subtotal > 500 else 49
    discount = 0
    if coupon.upper() in {"FARM20", "ORGANIC100"}:
        discount = round(subtotal * 0.15)
    total = subtotal + gst + delivery - discount
    return {"subtotal": subtotal, "gst": gst, "delivery": delivery, "discount": discount, "total": total}


@api.post("/orders")
async def create_order(payload: OrderCreateInput, user: dict = Depends(get_current_user)):
    cart = await _get_or_create_cart(user["id"])
    if not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    items = []
    farmer_names = set()
    for it in cart["items"]:
        p = await db.products.find_one({"id": it["productId"]}, {"_id": 0})
        if not p:
            continue
        items.append({
            "productId": p["id"],
            "name": p["name"],
            "price": p["price"],
            "quantity": it["quantity"],
            "farmerId": p.get("farmerId"),
            "farmerName": p.get("farmerName"),
            "image": (p.get("images") or [""])[0],
        })
        if p.get("farmerName"):
            farmer_names.add(p["farmerName"])
    if not items:
        raise HTTPException(status_code=400, detail="No valid items in cart")
    totals = _calc_totals(items, payload.couponCode or "")
    oid = f"ord-{uuid.uuid4().hex[:8]}"
    order = {
        "id": oid,
        "user_id": user["id"],
        "userName": user.get("name", ""),
        "items": items,
        "totals": totals,
        "totalAmount": totals["total"],
        "address": payload.address.model_dump(),
        "deliveryAddress": f"{payload.address.street}, {payload.address.city}, {payload.address.state} - {payload.address.pincode}",
        "paymentMethod": payload.paymentMethod,
        "paymentStatus": "pending" if payload.paymentMethod != "cod" else "cod",
        "status": "Pending",
        "farmerName": ", ".join(farmer_names) if farmer_names else "Direct Farmers",
        "estimatedArrival": "Tomorrow, by 1:00 PM",
        "date": now_utc().isoformat()[:16].replace("T", " "),
        "created_at": now_utc().isoformat(),
    }

    # Razorpay integration
    if payload.paymentMethod == "razorpay":
        if not rzp_client:
            raise HTTPException(status_code=400, detail="Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env")
        rzp_order = rzp_client.order.create({
            "amount": int(totals["total"] * 100),
            "currency": "INR",
            "receipt": oid[:40],
            "payment_capture": 1,
        })
        order["razorpay_order_id"] = rzp_order["id"]

    await db.orders.insert_one(order)
    # decrement stock
    for it in items:
        await db.products.update_one({"id": it["productId"]}, {"$inc": {"stock": -it["quantity"], "salesCount": it["quantity"]}})
    # clear cart
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": []}})
    order.pop("_id", None)
    return {"order": order, "razorpayKeyId": RAZORPAY_KEY_ID if payload.paymentMethod == "razorpay" else None}


@api.post("/orders/razorpay/verify")
async def verify_razorpay(payload: RazorpayVerifyInput, user: dict = Depends(get_current_user)):
    if not rzp_client:
        raise HTTPException(status_code=400, detail="Razorpay not configured")
    order = await db.orders.find_one({"id": payload.orderId})
    if not order or order.get("user_id") != user["id"]:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        rzp_client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Signature verification failed")
    await db.orders.update_one({"id": payload.orderId}, {"$set": {
        "paymentStatus": "paid",
        "status": "Accepted",
        "razorpay_payment_id": payload.razorpay_payment_id,
    }})
    return {"ok": True}


@api.get("/orders")
async def list_orders(user: dict = Depends(get_current_user)):
    if user["role"] == "admin":
        q = {}
    elif user["role"] == "farmer":
        q = {"items.farmerId": user["id"]}
    else:
        q = {"user_id": user["id"]}
    cursor = db.orders.find(q, {"_id": 0}).sort("created_at", -1).limit(200)
    return await cursor.to_list(200)


@api.post("/orders/{oid}/status")
async def update_order_status(oid: str, body: dict, user: dict = Depends(require_role("farmer", "admin"))):
    status = body.get("status")
    valid = {"Pending", "Accepted", "Preparing", "Packed", "Out for Delivery", "Delivered", "Cancelled", "Refunded"}
    if status not in valid:
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.orders.update_one({"id": oid}, {"$set": {"status": status, "updated_at": now_utc().isoformat()}})
    o = await db.orders.find_one({"id": oid}, {"_id": 0})
    return o


@api.post("/orders/{oid}/cancel")
async def cancel_order(oid: str, user: dict = Depends(get_current_user)):
    o = await db.orders.find_one({"id": oid})
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    if o.get("user_id") != user["id"] and user["role"] not in {"admin", "farmer"}:
        raise HTTPException(status_code=403, detail="Not allowed")
    await db.orders.update_one({"id": oid}, {"$set": {"status": "Cancelled"}})
    return {"ok": True}


# ---------- AI ROUTES ----------
@api.post("/ai/chat")
async def ai_chat_stream(payload: ChatInput):
    """SSE streaming chat. Publicly accessible."""
    session_id = payload.sessionId or f"anon-{uuid.uuid4().hex[:8]}"

    async def event_gen():
        try:
            async for chunk in stream_chat(session_id, payload.message, payload.context):
                yield f"data: {json.dumps({'delta': chunk})}\n\n"
            yield "data: {\"done\": true}\n\n"
        except Exception as e:
            logger.error(f"AI chat error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@api.post("/ai/price-predict")
async def ai_price_predict(payload: PricePredictInput):
    result = await price_predict(payload.crop, payload.location or "", payload.currentPrice)
    return result


@api.post("/ai/recommend")
async def ai_recommend(payload: RecommendInput, user: dict = Depends(get_current_user)):
    # gather user context
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).limit(5).to_list(5)
    products = await db.products.find({}, {"_id": 0, "id": 1, "name": 1, "category": 1, "isOrganic": 1, "location": 1, "price": 1}).limit(50).to_list(50)
    result = await product_recommendations(user.get("name", ""), payload.preferences or "", orders, products)
    return result


# ---------- ADMIN / ANALYTICS ----------
@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_role("admin"))):
    total_users = await db.users.count_documents({})
    farmers = await db.users.count_documents({"role": "farmer"})
    customers = await db.users.count_documents({"role": "customer"})
    products = await db.products.count_documents({})
    orders = await db.orders.count_documents({})
    revenue_agg = await db.orders.aggregate([{"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}}]).to_list(1)
    revenue = revenue_agg[0]["total"] if revenue_agg else 0
    return {
        "totalUsers": total_users,
        "farmers": farmers,
        "customers": customers,
        "products": products,
        "orders": orders,
        "revenue": revenue,
    }


@api.get("/admin/farmers")
async def list_farmers(user: dict = Depends(require_role("admin"))):
    farmers = await db.users.find({"role": "farmer"}, {"_id": 0, "password_hash": 0}).to_list(500)
    return farmers


@api.post("/admin/verify-farmer/{fid}")
async def verify_farmer(fid: str, user: dict = Depends(require_role("admin"))):
    await db.users.update_one({"id": fid, "role": "farmer"}, {"$set": {"verified": True}})
    return {"ok": True}


@api.get("/farmer/stats")
async def farmer_stats(user: dict = Depends(require_role("farmer", "admin"))):
    my_products = await db.products.count_documents({"farmerId": user["id"]})
    my_orders_cursor = db.orders.find({"items.farmerId": user["id"]}, {"_id": 0})
    orders = await my_orders_cursor.to_list(500)
    earnings = 0
    for o in orders:
        for it in o.get("items", []):
            if it.get("farmerId") == user["id"]:
                earnings += it["price"] * it["quantity"]
    return {"products": my_products, "orders": len(orders), "earnings": earnings, "rating": 4.9}


# ---------- REGISTER ROUTER ----------
@api.get("/")
async def api_root():
    return {"service": "Farm2Home API", "status": "ok"}


app.include_router(api)

# CORS
_frontend = os.environ.get("FRONTEND_URL", "*")
_allow = ["*"] if _frontend == "*" else [_frontend, "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Startup ----------
@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.products.create_index("id", unique=True)
    await db.products.create_index("category")
    await db.orders.create_index("id", unique=True)
    await db.orders.create_index("user_id")
    await db.carts.create_index("user_id", unique=True)

    # Admin seed
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Farm2Home Admin",
            "role": "admin",
            "avatar": "https://api.dicebear.com/7.x/thumbs/svg?seed=admin",
            "verified": True,
            "password_hash": hash_password(admin_password),
            "created_at": now_utc().isoformat(),
        })
        logger.info(f"Seeded admin: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # Seed catalog
    await seed_products_and_categories(db)

    # Init storage
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.warning(f"Storage init failed (will retry on upload): {e}")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


@app.get("/")
async def root():
    return {"service": "Farm2Home API", "status": "ok"}
