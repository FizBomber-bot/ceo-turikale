"""Backend tests for Testimonials feature (public + admin CRUD) and light regression."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code == 429:
        pytest.skip(f"Account locked from previous tests: {r.text}")
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    assert "access_token" in s.cookies
    assert "refresh_token" in s.cookies
    return s


# ---------- Auth ----------
class TestAuth:
    def test_login_sets_cookies_and_returns_user(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        if r.status_code == 429:
            pytest.skip("Lockout from prior run")
        assert r.status_code == 200, r.text
        u = r.json()
        assert u["email"] == ADMIN_EMAIL
        assert u["role"] == "admin"
        assert "access_token" in s.cookies
        assert "refresh_token" in s.cookies

    def test_me_requires_cookies(self, admin_session):
        r = admin_session.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL
        # without cookies
        r2 = requests.get(f"{API}/auth/me")
        assert r2.status_code == 401


# ---------- Public Testimonials ----------
class TestPublicTestimonials:
    def test_list_public(self, session):
        r = session.get(f"{API}/testimonials")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # At least seeded 3 (may be more if previous test runs added)
        assert len(data) >= 3
        # Sorted ascending by sort_order
        orders = [t.get("sort_order", 0) for t in data]
        assert orders == sorted(orders), f"Not sorted: {orders}"
        # Bilingual + id fields present
        for t in data:
            for k in ("id", "quote", "quote_id", "name", "name_id", "role", "role_id", "avatar", "sort_order"):
                assert k in t, f"missing {k} in {t}"
        # First (sort_order=10) should be the SME Owner seed
        first = data[0]
        assert first["sort_order"] == 10
        assert "SME Owner" in first["name"] or first["name"]  # may have been edited but seed default is SME Owner
        # _id not leaked
        assert "_id" not in first


# ---------- Admin Testimonials Guard ----------
class TestAdminTestimonialsGuard:
    def test_list_requires_auth(self):
        r = requests.get(f"{API}/admin/testimonials")
        assert r.status_code == 401

    def test_create_requires_auth(self):
        r = requests.post(f"{API}/admin/testimonials", json={"quote": "x", "name": "x"})
        assert r.status_code == 401

    def test_update_requires_auth(self):
        r = requests.put(f"{API}/admin/testimonials/anyid", json={"quote": "y"})
        assert r.status_code == 401

    def test_delete_requires_auth(self):
        r = requests.delete(f"{API}/admin/testimonials/anyid")
        assert r.status_code == 401


# ---------- Admin Testimonials CRUD ----------
class TestAdminTestimonialsCRUD:
    created_id = None

    def test_admin_list(self, admin_session):
        r = admin_session.get(f"{API}/admin/testimonials")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 3

    def test_create_auto_bumps_sort_order(self, admin_session, session):
        payload = {
            "quote": "TEST quote from automated test",
            "quote_id": "TEST kutipan otomatis",
            "name": "TEST Name",
            "name_id": "TEST Nama",
            "role": "TEST role",
            "role_id": "TEST peran",
            "avatar": "https://example.com/a.jpg",
            "sort_order": 0,  # should auto-bump
        }
        r = admin_session.post(f"{API}/admin/testimonials", json=payload)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["id"] and isinstance(body["id"], str)
        assert body["quote"] == payload["quote"]
        assert body["name"] == payload["name"]
        assert body["sort_order"] > 0, "sort_order should auto-bump when 0"
        TestAdminTestimonialsCRUD.created_id = body["id"]

        # Public list reflects it
        r2 = session.get(f"{API}/testimonials")
        assert any(t["id"] == body["id"] for t in r2.json())

    def test_update_partial(self, admin_session, session):
        tid = TestAdminTestimonialsCRUD.created_id
        assert tid, "create must run first"
        r = admin_session.put(
            f"{API}/admin/testimonials/{tid}",
            json={"quote": "TEST updated quote ONLY", "role_id": "TEST peran baru"},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["quote"] == "TEST updated quote ONLY"
        assert body["role_id"] == "TEST peran baru"
        # Untouched fields preserved
        assert body["name"] == "TEST Name"

        # Public reflects
        r2 = session.get(f"{API}/testimonials")
        match = [t for t in r2.json() if t["id"] == tid]
        assert match and match[0]["quote"] == "TEST updated quote ONLY"

    def test_update_unknown_404(self, admin_session):
        r = admin_session.put(
            f"{API}/admin/testimonials/__nope__", json={"quote": "x"}
        )
        assert r.status_code == 404

    def test_delete(self, admin_session, session):
        tid = TestAdminTestimonialsCRUD.created_id
        r = admin_session.delete(f"{API}/admin/testimonials/{tid}")
        assert r.status_code == 200
        # Removed from public
        r2 = session.get(f"{API}/testimonials")
        assert all(t["id"] != tid for t in r2.json())

    def test_delete_unknown_404(self, admin_session):
        r = admin_session.delete(f"{API}/admin/testimonials/__nope__")
        assert r.status_code == 404


# ---------- Light regression on existing admin endpoints ----------
class TestRegressionAdmin:
    def test_profile_get(self, admin_session):
        r = admin_session.get(f"{API}/admin/profile")
        assert r.status_code == 200
        assert r.json()["name"]

    def test_case_studies_get(self, admin_session):
        r = admin_session.get(f"{API}/admin/case-studies")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_contacts_get(self, admin_session):
        r = admin_session.get(f"{API}/admin/contacts")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
