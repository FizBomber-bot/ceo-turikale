"""Backend tests for Alex Morgan Portfolio API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://biz-dev-portfolio-3.preview.emergentagent.com").rstrip("/")
# Fall back: read frontend env if not in env
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Health / root ---
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert "portfolio" in data["message"].lower()


# --- Categories ---
def test_categories(session):
    r = session.get(f"{API}/categories")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 6
    ids = [c["id"] for c in data]
    for expected in [
        "all",
        "strategic-partnerships",
        "enterprise-sales",
        "market-expansion",
        "client-success",
        "gtm-strategy",
    ]:
        assert expected in ids
    by_id = {c["id"]: c for c in data}
    assert by_id["all"]["count"] == 6
    assert by_id["strategic-partnerships"]["count"] == 2
    assert by_id["enterprise-sales"]["count"] == 1
    assert by_id["market-expansion"]["count"] == 1
    assert by_id["client-success"]["count"] == 1
    assert by_id["gtm-strategy"]["count"] == 1


# --- Case studies ---
def test_list_case_studies(session):
    r = session.get(f"{API}/case-studies")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 6
    ids = {cs["id"] for cs in data}
    assert {"northwind-channel", "lumen-enterprise", "vector-emea", "forge-retention", "halo-gtm", "atlas-alliance"} <= ids


def test_list_case_studies_filter_all(session):
    r = session.get(f"{API}/case-studies", params={"category": "all"})
    assert r.status_code == 200
    assert len(r.json()) == 6


def test_list_case_studies_filter_partnerships(session):
    r = session.get(f"{API}/case-studies", params={"category": "strategic-partnerships"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 2
    for cs in data:
        assert cs["category"] == "strategic-partnerships"


def test_get_case_study_by_id(session):
    r = session.get(f"{API}/case-studies/northwind-channel")
    assert r.status_code == 200
    cs = r.json()
    assert cs["id"] == "northwind-channel"
    assert cs["category"] == "strategic-partnerships"
    assert isinstance(cs["approach"], list) and len(cs["approach"]) > 0
    assert isinstance(cs["metrics"], list) and len(cs["metrics"]) > 0


def test_get_case_study_not_found(session):
    r = session.get(f"{API}/case-studies/does-not-exist")
    assert r.status_code == 404


# --- Contact ---
def test_contact_create_and_persist(session):
    payload = {
        "name": "TEST Reviewer",
        "email": "test_reviewer@example.com",
        "company": "TEST Co",
        "subject": "TEST subject",
        "message": "This is a TEST message of sufficient length.",
    }
    r = session.post(f"{API}/contact", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert "id" in data
    assert "created_at" in data
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]

    # Verify persistence by listing
    r2 = session.get(f"{API}/contact")
    assert r2.status_code == 200
    items = r2.json()
    assert any(it["id"] == data["id"] for it in items)


def test_contact_missing_fields(session):
    r = session.post(f"{API}/contact", json={"name": "X"})
    assert r.status_code == 422


def test_contact_invalid_email(session):
    r = session.post(f"{API}/contact", json={
        "name": "Tester",
        "email": "not-an-email",
        "message": "A long enough message here",
    })
    assert r.status_code == 422


def test_contact_short_name(session):
    r = session.post(f"{API}/contact", json={
        "name": "A",
        "email": "ok@example.com",
        "message": "A long enough message here",
    })
    assert r.status_code == 422


def test_contact_short_message(session):
    r = session.post(f"{API}/contact", json={
        "name": "Tester",
        "email": "ok@example.com",
        "message": "short",
    })
    assert r.status_code == 422


# --- CV ---
def test_cv_download(session):
    r = session.get(f"{API}/cv")
    assert r.status_code == 200
    ct = r.headers.get("content-type", "")
    assert "application/pdf" in ct
    assert len(r.content) > 100
    assert r.content[:4] == b"%PDF"
