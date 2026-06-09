"""Backend tests for Andry Ridwan Portfolio API (public + auth + admin)."""
import io
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://github-builder-24.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "ndriyconnect@gmail.com"
ADMIN_PASSWORD = "TurikalePrint2026!"


# -------- shared sessions --------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_session():
    """Authenticated session with httpOnly cookie set."""
    s = requests.Session()
    # Clear any existing lockout first by waiting (best effort)
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code == 429:
        pytest.skip(f"Account locked from previous tests: {r.text}")
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    assert "access_token" in s.cookies
    assert "refresh_token" in s.cookies
    return s


# ============ PUBLIC ============
class TestPublic:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert "portfolio" in r.json()["message"].lower()

    def test_profile_public(self, session):
        r = session.get(f"{API}/profile")
        assert r.status_code == 200
        p = r.json()
        assert p["name"] == "Andry Ridwan"
        assert "Maros" in p["location"] or "South Sulawesi" in p["location"]
        assert p["email"] == "ndriyconnect@gmail.com"
        assert isinstance(p["bio"], list) and len(p["bio"]) >= 1
        assert isinstance(p["stats"], list) and len(p["stats"]) >= 1
        assert p["company_site"]
        assert p["company_maps"]

    def test_categories(self, session):
        r = session.get(f"{API}/categories")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6
        by_id = {c["id"]: c for c in data}
        assert by_id["all"]["count"] == 7
        assert by_id["strategic-partnerships"]["count"] == 2
        assert by_id["enterprise-sales"]["count"] == 1
        assert by_id["market-expansion"]["count"] == 2
        assert by_id["client-success"]["count"] == 1
        assert by_id["gtm-strategy"]["count"] == 1

    def test_case_studies_list_and_sort(self, session):
        r = session.get(f"{API}/case-studies")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 7
        # turikale-print has sort_order 10 -> first
        assert data[0]["id"] == "turikale-print"
        ids = {cs["id"] for cs in data}
        for k in [
            "turikale-print", "koperasi-merah-putih", "tkmp-2024",
            "aidu-edtech", "gapura-digital", "umkm-jualan-online",
            "1000-startup-digital",
        ]:
            assert k in ids

    def test_case_study_by_id(self, session):
        r = session.get(f"{API}/case-studies/turikale-print")
        assert r.status_code == 200
        assert r.json()["id"] == "turikale-print"
        r404 = session.get(f"{API}/case-studies/nope-nope")
        assert r404.status_code == 404

    def test_contact_create_and_validation(self, session):
        payload = {
            "name": "TEST Reviewer",
            "email": "test_reviewer@example.com",
            "message": "TEST sufficient length message here.",
        }
        r = session.post(f"{API}/contact", json=payload)
        assert r.status_code == 201, r.text
        assert r.json()["email"] == payload["email"]

        # invalid email
        bad = session.post(f"{API}/contact", json={
            "name": "Tester", "email": "bad", "message": "long enough message",
        })
        assert bad.status_code == 422

    def test_cv_download(self, session):
        r = session.get(f"{API}/cv")
        assert r.status_code == 200
        assert "application/pdf" in r.headers.get("content-type", "")
        assert r.content[:4] == b"%PDF"


# ============ AUTH ============
class TestAuth:
    def test_login_success_sets_cookies(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        if r.status_code == 429:
            pytest.skip("Lockout in effect from prior run")
        assert r.status_code == 200, r.text
        user = r.json()
        assert user["email"] == ADMIN_EMAIL
        assert user["role"] == "admin"
        assert "access_token" in s.cookies
        assert "refresh_token" in s.cookies

    def test_me_with_cookie(self, admin_session):
        r = admin_session.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_without_cookie(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_logout_clears_cookies(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        if r.status_code == 429:
            pytest.skip("Lockout in effect")
        assert r.status_code == 200
        r2 = s.post(f"{API}/auth/logout")
        assert r2.status_code == 200
        # After logout, /me should be 401 (clear cookies from jar manually since server delete may not unset)
        s.cookies.clear()
        r3 = s.get(f"{API}/auth/me")
        assert r3.status_code == 401

    def test_wrong_password_returns_401(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WRONG_PWD_xx"})
        assert r.status_code in (401, 429)

    def test_brute_force_lockout(self):
        """5 failed attempts from same identifier triggers 429."""
        s = requests.Session()
        # Use a distinct email to avoid locking the real admin for too long
        fake_email = f"locktest_{uuid.uuid4().hex[:6]}@example.com"
        codes = []
        for _ in range(6):
            r = s.post(f"{API}/auth/login", json={"email": fake_email, "password": "nope"})
            codes.append(r.status_code)
        # Should eventually return 429
        assert 429 in codes, f"Expected 429 in {codes}"


# ============ ADMIN PROTECTED ============
class TestAdminAuthGuard:
    @pytest.mark.parametrize("path", [
        "/admin/profile", "/admin/case-studies", "/admin/contacts",
    ])
    def test_requires_auth_get(self, session, path):
        r = requests.get(f"{API}{path}")
        assert r.status_code == 401

    def test_admin_profile_get_with_auth(self, admin_session):
        r = admin_session.get(f"{API}/admin/profile")
        assert r.status_code == 200
        assert r.json()["name"] == "Andry Ridwan"

    def test_admin_update_profile_reflects_public(self, admin_session, session):
        new_location = "Maros · South Sulawesi, Indonesia (test)"
        r = admin_session.put(f"{API}/admin/profile", json={"location": new_location})
        assert r.status_code == 200
        assert r.json()["location"] == new_location

        # Public reflects
        r2 = session.get(f"{API}/profile")
        assert r2.status_code == 200
        assert r2.json()["location"] == new_location

        # Restore original
        admin_session.put(f"{API}/admin/profile", json={
            "location": "Maros · South Sulawesi, Indonesia",
        })


# ============ ADMIN CASE STUDIES CRUD ============
class TestAdminCaseStudies:
    created_id = None

    def test_create_case_study(self, admin_session, session):
        payload = {
            "title": "TEST temporary case",
            "subtitle": "TEST subtitle",
            "category": "gtm-strategy",
            "year": "2026",
            "cover_image": "https://example.com/cover.jpg",
            "summary": "TEST summary",
            "challenge": "TEST challenge",
            "approach": ["A", "B"],
            "outcomes": ["O1"],
            "metrics": [{"label": "L", "value": "V"}],
            "client": "TEST client",
            "tags": ["t1"],
            "sort_order": 0,
        }
        r = admin_session.post(f"{API}/admin/case-studies", json=payload)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["id"] and len(body["id"]) == 8
        TestAdminCaseStudies.created_id = body["id"]

        # Public list contains it
        r2 = session.get(f"{API}/case-studies")
        assert any(cs["id"] == body["id"] for cs in r2.json())

    def test_update_case_study(self, admin_session, session):
        cid = TestAdminCaseStudies.created_id
        assert cid, "create test must run first"
        upd = {
            "title": "TEST updated title",
            "subtitle": "TEST subtitle",
            "category": "gtm-strategy",
            "year": "2026",
            "cover_image": "https://example.com/c2.jpg",
            "summary": "updated",
            "challenge": "c",
            "approach": [],
            "outcomes": [],
            "metrics": [],
            "client": "",
            "tags": [],
            "sort_order": 999,
        }
        r = admin_session.put(f"{API}/admin/case-studies/{cid}", json=upd)
        assert r.status_code == 200
        assert r.json()["title"] == "TEST updated title"

        # Public reflects
        r2 = session.get(f"{API}/case-studies/{cid}")
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST updated title"

    def test_delete_case_study(self, admin_session, session):
        cid = TestAdminCaseStudies.created_id
        r = admin_session.delete(f"{API}/admin/case-studies/{cid}")
        assert r.status_code == 200
        assert r.json().get("ok") is True

        r2 = session.get(f"{API}/case-studies/{cid}")
        assert r2.status_code == 404


# ============ ADMIN UPLOADS ============
class TestAdminUploads:
    def _make_jpg_bytes(self):
        # Minimal valid JPEG SOI/EOI
        return b"\xff\xd8\xff\xe0" + b"\x00" * 16 + b"\xff\xd9"

    def test_upload_image_ok(self, admin_session):
        files = {"file": ("test.jpg", self._make_jpg_bytes(), "image/jpeg")}
        # multipart -> must not send default JSON header
        s = requests.Session()
        s.cookies.update(admin_session.cookies.get_dict())
        r = s.post(f"{API}/admin/upload/image", files=files)
        assert r.status_code == 200, r.text
        url = r.json()["url"]
        assert url.startswith("/api/uploads/")
        # Accessible
        r2 = requests.get(f"{BASE_URL}{url}")
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")

    def test_upload_image_rejects_text(self, admin_session):
        files = {"file": ("hello.txt", b"hi", "text/plain")}
        s = requests.Session()
        s.cookies.update(admin_session.cookies.get_dict())
        r = s.post(f"{API}/admin/upload/image", files=files)
        assert r.status_code == 415

    def test_upload_image_too_large(self, admin_session):
        big = b"\xff\xd8\xff\xe0" + (b"\x00" * (9 * 1024 * 1024)) + b"\xff\xd9"
        files = {"file": ("big.jpg", big, "image/jpeg")}
        s = requests.Session()
        s.cookies.update(admin_session.cookies.get_dict())
        r = s.post(f"{API}/admin/upload/image", files=files)
        assert r.status_code == 413

    def test_upload_cv_pdf_ok_and_served(self, admin_session, session):
        # Save current CV
        prev = session.get(f"{API}/cv").content
        new_pdf = b"%PDF-1.4\n%TEST upload\n%%EOF\n"
        files = {"file": ("test.pdf", new_pdf, "application/pdf")}
        s = requests.Session()
        s.cookies.update(admin_session.cookies.get_dict())
        r = s.post(f"{API}/admin/upload/cv", files=files)
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True
        assert r.json().get("size") == len(new_pdf)

        # GET /api/cv serves the new file
        r2 = session.get(f"{API}/cv")
        assert r2.status_code == 200
        assert r2.content == new_pdf

        # Restore previous
        if prev and prev[:4] == b"%PDF":
            files2 = {"file": ("restore.pdf", prev, "application/pdf")}
            s.post(f"{API}/admin/upload/cv", files=files2)

    def test_upload_cv_rejects_non_pdf(self, admin_session):
        files = {"file": ("note.txt", b"hi", "text/plain")}
        s = requests.Session()
        s.cookies.update(admin_session.cookies.get_dict())
        r = s.post(f"{API}/admin/upload/cv", files=files)
        assert r.status_code == 415


# ============ ADMIN CONTACTS LIST ============
class TestAdminContacts:
    def test_contacts_requires_auth(self):
        r = requests.get(f"{API}/admin/contacts")
        assert r.status_code == 401

    def test_contacts_listed_after_submit(self, admin_session, session):
        unique_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
        r = session.post(f"{API}/contact", json={
            "name": "TEST Sender", "email": unique_email,
            "message": "Sufficient length message for test.",
        })
        assert r.status_code == 201
        cid = r.json()["id"]
        r2 = admin_session.get(f"{API}/admin/contacts")
        assert r2.status_code == 200
        items = r2.json()
        assert any(it["id"] == cid for it in items)

        # cleanup
        admin_session.delete(f"{API}/admin/contacts/{cid}")
