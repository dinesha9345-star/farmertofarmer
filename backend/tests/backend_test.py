"""Farm2Home Backend API tests (pytest)."""
import os
import io
import json
import time
import uuid
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://field2table-1.preview.emergentagent.com"
# Prefer frontend .env value
try:
    fe_env = Path("/app/frontend/.env").read_text()
    for line in fe_env.splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
except Exception:
    pass

API = f"{BASE_URL}/api"

ADMIN = {"email": "admin@farm2home.com", "password": "Farm2Home@2026"}
CUSTOMER = {"email": "customer@farm2home.com", "password": "customer123"}
RAMESH = {"email": "ramesh@farm2home.com", "password": "farmer123"}
ANJALI = {"email": "anjali@farm2home.com", "password": "farmer123"}


def _login(session, creds):
    r = session.post(f"{API}/auth/login", json=creds, timeout=30)
    assert r.status_code == 200, f"Login failed for {creds['email']}: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    session.headers.update({"Authorization": f"Bearer {data['token']}"})
    return data


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    _login(s, ADMIN)
    return s


@pytest.fixture(scope="session")
def customer_session():
    s = requests.Session()
    _login(s, CUSTOMER)
    return s


@pytest.fixture(scope="session")
def ramesh_session():
    s = requests.Session()
    _login(s, RAMESH)
    return s


@pytest.fixture(scope="session")
def anjali_session():
    s = requests.Session()
    _login(s, ANJALI)
    return s


# ---------- HEALTH / CATEGORIES / PRODUCTS ----------
class TestPublic:
    def test_api_root(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_categories_seeded(self):
        r = requests.get(f"{API}/categories", timeout=15)
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list)
        assert len(cats) >= 12, f"Expected 12+ categories, got {len(cats)}"

    def test_products_list_seeded(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        prods = r.json()
        assert isinstance(prods, list)
        assert len(prods) >= 8, f"Expected 8+ products, got {len(prods)}"
        ids = {p["id"] for p in prods}
        for pid in ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"]:
            assert pid in ids, f"missing seeded {pid}"

    def test_product_detail(self):
        r = requests.get(f"{API}/products/p1", timeout=15)
        assert r.status_code == 200
        p = r.json()
        assert p["id"] == "p1"
        assert "name" in p and "price" in p

    def test_product_detail_404(self):
        r = requests.get(f"{API}/products/does-not-exist", timeout=15)
        assert r.status_code == 404

    @pytest.mark.parametrize("sort", ["popular", "price-low", "price-high", "rating", "newest"])
    def test_products_sort(self, sort):
        r = requests.get(f"{API}/products", params={"sort": sort}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0
        if sort == "price-low":
            prices = [p["price"] for p in data]
            assert prices == sorted(prices)
        if sort == "price-high":
            prices = [p["price"] for p in data]
            assert prices == sorted(prices, reverse=True)

    def test_products_filter_organic(self):
        r = requests.get(f"{API}/products", params={"organic": "true"}, timeout=15)
        assert r.status_code == 200
        for p in r.json():
            assert p.get("isOrganic") is True

    def test_products_filter_maxprice(self):
        r = requests.get(f"{API}/products", params={"maxPrice": 100}, timeout=15)
        assert r.status_code == 200
        for p in r.json():
            assert p["price"] <= 100

    def test_products_filter_category(self):
        r = requests.get(f"{API}/products", params={"category": "Fruits"}, timeout=15)
        assert r.status_code == 200
        for p in r.json():
            assert p["category"] == "Fruits"

    def test_products_search(self):
        r = requests.get(f"{API}/products", params={"search": "mango"}, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 1


# ---------- AUTH ----------
class TestAuth:
    def test_login_admin(self):
        r = requests.post(f"{API}/auth/login", json=ADMIN, timeout=15)
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "admin"
        # httpOnly cookie
        assert "access_token" in r.cookies

    def test_login_customer(self):
        r = requests.post(f"{API}/auth/login", json=CUSTOMER, timeout=15)
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "customer"

    def test_login_farmer(self):
        r = requests.post(f"{API}/auth/login", json=RAMESH, timeout=15)
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "farmer"

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": CUSTOMER["email"], "password": "wrong-pass"}, timeout=15)
        assert r.status_code == 401

    def test_register_and_me_and_duplicate(self):
        email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com".lower()
        payload = {"name": "TEST User", "email": email, "password": "pass1234", "role": "customer"}
        r = requests.post(f"{API}/auth/register", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["email"] == email
        assert "token" in data
        token = data["token"]

        # /auth/me with bearer
        r2 = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["user"]["email"] == email

        # duplicate register
        r3 = requests.post(f"{API}/auth/register", json=payload, timeout=15)
        assert r3.status_code == 400

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_logout(self):
        s = requests.Session()
        s.post(f"{API}/auth/login", json=CUSTOMER, timeout=15)
        r = s.post(f"{API}/auth/logout", timeout=15)
        assert r.status_code == 200

    def test_bcrypt_hash_format(self):
        # login works -> bcrypt is functional; also verify via /auth/me contains no password_hash
        s = requests.Session()
        _login(s, CUSTOMER)
        r = s.get(f"{API}/auth/me", timeout=15)
        assert "password_hash" not in r.json()["user"]


# ---------- CART & WISHLIST ----------
class TestCart:
    def test_cart_flow(self, customer_session):
        # clear first
        customer_session.post(f"{API}/cart/clear", timeout=15)
        r = customer_session.post(f"{API}/cart/add", json={"productId": "p1", "quantity": 2}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["product"]["id"] == "p1"
        assert data["items"][0]["quantity"] == 2

        # update
        r = customer_session.post(f"{API}/cart/update", json={"productId": "p1", "quantity": 5}, timeout=15)
        assert r.status_code == 200
        assert r.json()["items"][0]["quantity"] == 5

        # get
        r = customer_session.get(f"{API}/cart", timeout=15)
        assert r.status_code == 200
        assert r.json()["items"][0]["quantity"] == 5

        # clear
        r = customer_session.post(f"{API}/cart/clear", timeout=15)
        assert r.status_code == 200
        r = customer_session.get(f"{API}/cart", timeout=15)
        assert r.json()["items"] == []

    def test_wishlist_toggle(self, customer_session):
        r = customer_session.post(f"{API}/wishlist/toggle", json={"productId": "p2"}, timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        assert "p2" in items
        # toggle off
        r = customer_session.post(f"{API}/wishlist/toggle", json={"productId": "p2"}, timeout=15)
        assert "p2" not in r.json()["items"]
        r = customer_session.get(f"{API}/wishlist", timeout=15)
        assert r.status_code == 200


# ---------- FARMER PRODUCT CRUD ----------
class TestFarmerProducts:
    created_pid = None

    def test_customer_cannot_create(self, customer_session):
        r = customer_session.post(f"{API}/products", json={"name": "X", "category": "Fruits", "price": 10}, timeout=15)
        assert r.status_code == 403

    def test_farmer_create_and_list(self, ramesh_session):
        payload = {"name": "TEST_Green Apple", "category": "Fruits", "description": "test", "price": 99.0, "stock": 20, "unit": "Kg", "isOrganic": True}
        r = ramesh_session.post(f"{API}/products", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        p = r.json()
        assert p["farmerId"] and p["name"] == "TEST_Green Apple"
        TestFarmerProducts.created_pid = p["id"]

        # get me to fetch ramesh id
        me = ramesh_session.get(f"{API}/auth/me", timeout=15).json()["user"]
        r = requests.get(f"{API}/products", params={"farmerId": me["id"]}, timeout=15)
        assert r.status_code == 200
        assert any(x["id"] == TestFarmerProducts.created_pid for x in r.json())

    def test_other_farmer_cannot_update_or_delete(self, anjali_session):
        pid = TestFarmerProducts.created_pid
        assert pid, "create test must run first"
        r = anjali_session.put(f"{API}/products/{pid}", json={"name": "Hijack", "category": "Fruits", "price": 1}, timeout=15)
        assert r.status_code == 403
        r = anjali_session.delete(f"{API}/products/{pid}", timeout=15)
        assert r.status_code == 403

    def test_customer_cannot_delete(self, customer_session):
        pid = TestFarmerProducts.created_pid
        r = customer_session.delete(f"{API}/products/{pid}", timeout=15)
        assert r.status_code == 403

    def test_owner_update_and_delete(self, ramesh_session):
        pid = TestFarmerProducts.created_pid
        r = ramesh_session.put(f"{API}/products/{pid}", json={"name": "TEST_Green Apple Updated", "category": "Fruits", "price": 110.0, "stock": 15, "unit": "Kg"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Green Apple Updated"
        # verify persistence
        r2 = requests.get(f"{API}/products/{pid}", timeout=15)
        assert r2.status_code == 200 and r2.json()["name"] == "TEST_Green Apple Updated"

        r = ramesh_session.delete(f"{API}/products/{pid}", timeout=15)
        assert r.status_code == 200
        r2 = requests.get(f"{API}/products/{pid}", timeout=15)
        assert r2.status_code == 404


# ---------- ORDERS ----------
class TestOrders:
    def _seed_cart(self, session):
        session.post(f"{API}/cart/clear", timeout=15)
        session.post(f"{API}/cart/add", json={"productId": "p1", "quantity": 1}, timeout=15)
        session.post(f"{API}/cart/add", json={"productId": "p2", "quantity": 2}, timeout=15)

    def _address(self):
        return {"fullName": "Test User", "phone": "9999999999", "street": "1 Test St", "city": "Mumbai", "state": "MH", "pincode": "400001"}

    def test_create_order_cod(self, customer_session):
        self._seed_cart(customer_session)
        r = customer_session.post(f"{API}/orders", json={"address": self._address(), "paymentMethod": "cod"}, timeout=30)
        assert r.status_code == 200, r.text
        order = r.json()["order"]
        assert order["paymentMethod"] == "cod"
        assert order["paymentStatus"] == "cod"
        assert order["totalAmount"] > 0
        # cart cleared
        c = customer_session.get(f"{API}/cart", timeout=15).json()
        assert c["items"] == []
        # order appears in list
        r2 = customer_session.get(f"{API}/orders", timeout=15)
        assert r2.status_code == 200
        assert any(o["id"] == order["id"] for o in r2.json())

    def test_create_order_upi(self, customer_session):
        self._seed_cart(customer_session)
        r = customer_session.post(f"{API}/orders", json={"address": self._address(), "paymentMethod": "upi"}, timeout=30)
        assert r.status_code == 200, r.text

    def test_create_order_razorpay_disabled(self, customer_session):
        self._seed_cart(customer_session)
        r = customer_session.post(f"{API}/orders", json={"address": self._address(), "paymentMethod": "razorpay"}, timeout=30)
        assert r.status_code == 400
        assert "razorpay" in r.text.lower() or "not configured" in r.text.lower()

    def test_order_cancel_owner(self, customer_session):
        self._seed_cart(customer_session)
        r = customer_session.post(f"{API}/orders", json={"address": self._address(), "paymentMethod": "cod"}, timeout=30)
        oid = r.json()["order"]["id"]
        r2 = customer_session.post(f"{API}/orders/{oid}/cancel", timeout=15)
        assert r2.status_code == 200

    def test_order_status_by_farmer(self, customer_session, ramesh_session):
        self._seed_cart(customer_session)
        r = customer_session.post(f"{API}/orders", json={"address": self._address(), "paymentMethod": "cod"}, timeout=30)
        oid = r.json()["order"]["id"]
        r2 = ramesh_session.post(f"{API}/orders/{oid}/status", json={"status": "Accepted"}, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["status"] == "Accepted"
        # invalid status
        r3 = ramesh_session.post(f"{API}/orders/{oid}/status", json={"status": "Invalid"}, timeout=15)
        assert r3.status_code == 400

    def test_empty_cart_order_fails(self, customer_session):
        customer_session.post(f"{API}/cart/clear", timeout=15)
        r = customer_session.post(f"{API}/orders", json={"address": self._address(), "paymentMethod": "cod"}, timeout=30)
        assert r.status_code == 400


# ---------- AI ----------
class TestAI:
    def test_price_predict(self):
        r = requests.post(f"{API}/ai/price-predict", json={"crop": "Alphonso Mangoes", "currentPrice": 180}, timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        for key in ["currentPrice", "predictedPriceNextMonth", "demandTrend", "recommendation", "confidence"]:
            assert key in data, f"missing {key} in {data}"

    def test_chat_stream(self):
        r = requests.post(f"{API}/ai/chat", json={"message": "Hello, one short line please.", "sessionId": f"test-{uuid.uuid4().hex[:6]}"}, timeout=90, stream=True)
        assert r.status_code == 200
        got_delta = False
        got_done = False
        for line in r.iter_lines(decode_unicode=True):
            if not line:
                continue
            if line.startswith("data: "):
                payload = line[6:]
                if '"delta"' in payload:
                    got_delta = True
                if '"done": true' in payload or '"done":true' in payload:
                    got_done = True
                    break
        assert got_delta, "No delta chunks received"
        assert got_done, "No done event"

    def test_recommend(self, customer_session):
        r = customer_session.post(f"{API}/ai/recommend", json={"preferences": "organic fruits"}, timeout=120)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "message" in data
        assert "picks" in data
        assert isinstance(data["picks"], list)
        assert len(data["picks"]) == 4, f"expected 4 picks, got {len(data['picks'])}"
        for pick in data["picks"]:
            assert "product" in pick and "reason" in pick


# ---------- ADMIN / FARMER ANALYTICS ----------
class TestAdmin:
    def test_admin_stats(self, admin_session):
        r = admin_session.get(f"{API}/admin/stats", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ["totalUsers", "farmers", "customers", "products", "orders", "revenue"]:
            assert k in d

    def test_admin_stats_forbidden_for_customer(self, customer_session):
        r = customer_session.get(f"{API}/admin/stats", timeout=15)
        assert r.status_code == 403

    def test_admin_farmers_and_verify(self, admin_session):
        r = admin_session.get(f"{API}/admin/farmers", timeout=15)
        assert r.status_code == 200
        farmers = r.json()
        assert len(farmers) >= 6
        fid = farmers[0]["id"]
        r2 = admin_session.post(f"{API}/admin/verify-farmer/{fid}", timeout=15)
        assert r2.status_code == 200

    def test_farmer_stats(self, ramesh_session):
        r = ramesh_session.get(f"{API}/farmer/stats", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ["products", "orders", "earnings", "rating"]:
            assert k in d


# ---------- IMAGE UPLOAD ----------
class TestUpload:
    def test_upload_requires_auth(self):
        # 1x1 png
        png = bytes.fromhex("89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082")
        files = {"file": ("t.png", png, "image/png")}
        r = requests.post(f"{API}/upload/image", files=files, timeout=30)
        assert r.status_code == 401

    def test_upload_and_fetch(self, customer_session):
        png = bytes.fromhex("89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082")
        files = {"file": ("t.png", png, "image/png")}
        # requests uses session headers; but files upload sets multipart automatically
        r = customer_session.post(f"{API}/upload/image", files=files, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "path" in data and "url" in data
        # Fetch back
        r2 = requests.get(f"{BASE_URL}{data['url']}", timeout=30)
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")


# ---------- CORS ----------
class TestCORS:
    def test_cors_allows_frontend_origin(self):
        origin = BASE_URL
        r = requests.options(f"{API}/auth/login", headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        }, timeout=15)
        # Preflight should be 200/204
        assert r.status_code in (200, 204)
        allow_origin = r.headers.get("access-control-allow-origin", "")
        allow_creds = r.headers.get("access-control-allow-credentials", "")
        assert allow_origin in (origin, "*")
        assert allow_creds.lower() == "true"
