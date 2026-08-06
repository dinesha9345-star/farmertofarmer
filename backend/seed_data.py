"""Seed initial products, categories and demo farmer/customer users."""
import uuid
import bcrypt
from datetime import datetime, timezone


def _hash(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def _now():
    return datetime.now(timezone.utc).isoformat()


CATEGORIES = [
    {"name": "Fruits", "icon": "🍎", "image": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=400", "count": 142},
    {"name": "Vegetables", "icon": "🥕", "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400", "count": 215},
    {"name": "Rice", "icon": "🌾", "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400", "count": 64},
    {"name": "Grains", "icon": "🌽", "image": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400", "count": 88},
    {"name": "Millets", "icon": "🌱", "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400", "count": 45},
    {"name": "Spices", "icon": "🌶️", "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400", "count": 96},
    {"name": "Dairy Products", "icon": "🥛", "image": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=400", "count": 72},
    {"name": "Honey", "icon": "🍯", "image": "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=400", "count": 32},
    {"name": "Eggs", "icon": "🥚", "image": "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&q=80&w=400", "count": 24},
    {"name": "Leafy Vegetables", "icon": "🥬", "image": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=400", "count": 68},
    {"name": "Dry Fruits", "icon": "🌰", "image": "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&q=80&w=400", "count": 54},
    {"name": "Organic Products", "icon": "🌿", "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400", "count": 310},
]

FARMERS = [
    {"id": "farmer-ramesh", "email": "ramesh@farm2home.com", "name": "Ramesh Patil", "farmName": "GreenValley Agro Farms", "location": "Ratnagiri, Maharashtra", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"},
    {"id": "farmer-anjali", "email": "anjali@farm2home.com", "name": "Anjali Deshmukh", "farmName": "Sahyadri Organic Produce", "location": "Nashik, Maharashtra", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"},
    {"id": "farmer-gurpreet", "email": "gurpreet@farm2home.com", "name": "Gurpreet Singh", "farmName": "Punjab Golden Harvest", "location": "Karnal, Haryana", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"},
    {"id": "farmer-krishnan", "email": "krishnan@farm2home.com", "name": "Krishnan Nair", "farmName": "Wayanad Forest Apiary", "location": "Wayanad, Kerala", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"},
    {"id": "farmer-mansukh", "email": "mansukh@farm2home.com", "name": "Mansukhbhai Patel", "farmName": "Gir Cow Dairy Trust", "location": "Anand, Gujarat", "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"},
    {"id": "farmer-altaf", "email": "altaf@farm2home.com", "name": "Mohd. Altaf Mir", "farmName": "Pampore Saffron Estate", "location": "Pampore, Jammu & Kashmir", "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200"},
]

PRODUCTS = [
    {"id": "p1", "name": "Organic Alphonso Mangoes", "images": ["https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800"], "category": "Fruits", "subcategory": "Seasonal Fruits", "description": "Hand-picked, carbide-free organic Alphonso mangoes from Devgad orchards. Naturally ripened with rich sweetness and aroma.", "price": 180, "originalPrice": 220, "discount": 18, "stock": 250, "unit": "Kg", "harvestDate": "2026-06-15", "expiryDate": "2026-06-30", "freshnessLevel": "99% Ultra Fresh", "isOrganic": True, "location": "Ratnagiri, Maharashtra", "deliveryRadius": "50 km", "minOrderQty": 1, "farmerId": "farmer-ramesh", "farmerName": "Ramesh Patil", "farmerAvatar": FARMERS[0]["avatar"], "rating": 4.9, "reviewsCount": 124, "salesCount": 1420},
    {"id": "p2", "name": "Fresh Heirloom Red Tomatoes", "images": ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800"], "category": "Vegetables", "subcategory": "Root & Vine", "description": "Juicy, vine-ripened heirloom tomatoes grown in mineral-rich soil without chemical fertilizers. Perfect for salads and curries.", "price": 40, "originalPrice": 55, "discount": 27, "stock": 500, "unit": "Kg", "harvestDate": "2026-06-18", "expiryDate": "2026-06-25", "freshnessLevel": "100% Farm Fresh", "isOrganic": True, "location": "Nashik, Maharashtra", "deliveryRadius": "30 km", "minOrderQty": 1, "farmerId": "farmer-anjali", "farmerName": "Anjali Deshmukh", "farmerAvatar": FARMERS[1]["avatar"], "rating": 4.8, "reviewsCount": 98, "salesCount": 890},
    {"id": "p3", "name": "Premium Basmati Aged Rice", "images": ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800"], "category": "Rice", "subcategory": "Aged Basmati", "description": "2-year aged traditional long-grain organic Basmati rice with exquisite aroma and fluffy texture upon cooking.", "price": 120, "originalPrice": 150, "discount": 20, "stock": 1200, "unit": "Kg", "harvestDate": "2025-11-10", "expiryDate": "2027-11-10", "freshnessLevel": "Aged & Sealed", "isOrganic": True, "location": "Karnal, Haryana", "deliveryRadius": "100 km", "minOrderQty": 5, "farmerId": "farmer-gurpreet", "farmerName": "Gurpreet Singh", "farmerAvatar": FARMERS[2]["avatar"], "rating": 4.9, "reviewsCount": 215, "salesCount": 3400},
    {"id": "p4", "name": "Wild Organic Forest Honey", "images": ["https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=800"], "category": "Honey", "subcategory": "Raw Wild Honey", "description": "Multiflora raw wild honey harvested sustainably from deep Nilgiri forest bee colonies. Unprocessed and unfiltered.", "price": 450, "originalPrice": 550, "discount": 18, "stock": 150, "unit": "Piece", "harvestDate": "2026-05-01", "expiryDate": "2028-05-01", "freshnessLevel": "Raw & Pure", "isOrganic": True, "location": "Wayanad, Kerala", "deliveryRadius": "200 km", "minOrderQty": 1, "farmerId": "farmer-krishnan", "farmerName": "Krishnan Nair", "farmerAvatar": FARMERS[3]["avatar"], "rating": 5.0, "reviewsCount": 310, "salesCount": 1100},
    {"id": "p5", "name": "Organic Farm Fresh Brown Eggs", "images": ["https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&q=80&w=800"], "category": "Eggs", "subcategory": "Free Range Eggs", "description": "Nutritious free-range brown eggs from pasture-raised hens fed on organic grains and greens. High omega-3 content.", "price": 90, "originalPrice": 110, "discount": 18, "stock": 300, "unit": "Bundle", "harvestDate": "2026-06-19", "expiryDate": "2026-07-03", "freshnessLevel": "Gathered Today", "isOrganic": True, "location": "Pune, Maharashtra", "deliveryRadius": "25 km", "minOrderQty": 1, "farmerId": "farmer-ramesh", "farmerName": "Ramesh Patil", "farmerAvatar": FARMERS[0]["avatar"], "rating": 4.7, "reviewsCount": 76, "salesCount": 650},
    {"id": "p6", "name": "Handcrafted Organic Cow Ghee", "images": ["https://images.unsplash.com/photo-1631379578550-7038263db699?auto=format&fit=crop&q=80&w=800"], "category": "Dairy Products", "subcategory": "Pure Ghee", "description": "Bilona churned A2 desi cow ghee made from grass-fed Gir cow milk using traditional Vedic wooden churner method.", "price": 850, "originalPrice": 1000, "discount": 15, "stock": 80, "unit": "Kg", "harvestDate": "2026-06-01", "expiryDate": "2027-06-01", "freshnessLevel": "Traditional Bilona", "isOrganic": True, "location": "Anand, Gujarat", "deliveryRadius": "150 km", "minOrderQty": 1, "farmerId": "farmer-mansukh", "farmerName": "Mansukhbhai Patel", "farmerAvatar": FARMERS[4]["avatar"], "rating": 4.9, "reviewsCount": 180, "salesCount": 920},
    {"id": "p7", "name": "Organic Fresh Spinach & Greens", "images": ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800"], "category": "Leafy Vegetables", "subcategory": "Green Leafy", "description": "Crisp, tender baby spinach leaves harvested at dawn in hydroponic and organic compost beds.", "price": 30, "originalPrice": 40, "discount": 25, "stock": 200, "unit": "Bundle", "harvestDate": "2026-06-20", "expiryDate": "2026-06-24", "freshnessLevel": "Harvested at Dawn", "isOrganic": True, "location": "Satara, Maharashtra", "deliveryRadius": "30 km", "minOrderQty": 2, "farmerId": "farmer-anjali", "farmerName": "Anjali Deshmukh", "farmerAvatar": FARMERS[1]["avatar"], "rating": 4.6, "reviewsCount": 54, "salesCount": 430},
    {"id": "p8", "name": "Organic Kashmiri Saffron (Kesar)", "images": ["https://images.unsplash.com/photo-1615485500704-8e990f9900f1?auto=format&fit=crop&q=80&w=800"], "category": "Spices", "subcategory": "Premium Spices", "description": "Grade-A Mongra saffron stigmas handpicked from Pampore valleys. Exceptional coloring and therapeutic aroma.", "price": 650, "originalPrice": 800, "discount": 18, "stock": 50, "unit": "Gram", "harvestDate": "2025-10-20", "expiryDate": "2027-10-20", "freshnessLevel": "Export Quality", "isOrganic": True, "location": "Pampore, Jammu & Kashmir", "deliveryRadius": "500 km", "minOrderQty": 1, "farmerId": "farmer-altaf", "farmerName": "Mohd. Altaf Mir", "farmerAvatar": FARMERS[5]["avatar"], "rating": 5.0, "reviewsCount": 142, "salesCount": 510},
]


async def seed_products_and_categories(db):
    # Seed categories (idempotent)
    if await db.categories.count_documents({}) == 0:
        await db.categories.insert_many(CATEGORIES)

    # Seed farmer users (idempotent by email)
    for f in FARMERS:
        exists = await db.users.find_one({"email": f["email"]})
        if not exists:
            await db.users.insert_one({
                "id": f["id"],
                "email": f["email"],
                "name": f["name"],
                "role": "farmer",
                "farmName": f["farmName"],
                "location": f["location"],
                "avatar": f["avatar"],
                "verified": True,
                "phone": "",
                "password_hash": _hash("farmer123"),
                "created_at": _now(),
            })

    # Seed demo customer
    if not await db.users.find_one({"email": "customer@farm2home.com"}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": "customer@farm2home.com",
            "name": "Siddharth Sharma",
            "role": "customer",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            "phone": "+91 98765 43210",
            "location": "Pune, Maharashtra",
            "verified": True,
            "password_hash": _hash("customer123"),
            "created_at": _now(),
        })

    # Seed products (idempotent by id)
    for p in PRODUCTS:
        if not await db.products.find_one({"id": p["id"]}):
            await db.products.insert_one({**p, "created_at": _now()})
