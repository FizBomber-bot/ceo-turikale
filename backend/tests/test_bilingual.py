"""Bilingual (EN/ID) field tests for Profile and Case Studies — iteration 3."""
import os
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://github-builder-24.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "ndriyconnect@gmail.com"
ADMIN_PASSWORD = "TurikalePrint2026!"

SEEDED_CASES = [
    "turikale-print",
    "koperasi-merah-putih",
    "tkmp-2024",
    "aidu-edtech",
    "gapura-digital",
    "umkm-jualan-online",
    "1000-startup-digital",
]


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code == 429:
        pytest.skip("locked out")
    assert r.status_code == 200, r.text
    return s


# ---------------- Profile bilingual ----------------
class TestProfileBilingual:
    def test_public_profile_has_id_fields(self):
        r = requests.get(f"{API}/profile")
        assert r.status_code == 200
        p = r.json()
        assert p.get("title_id"), "title_id missing"
        assert p.get("location_id"), "location_id missing"
        assert p.get("intro_id"), "intro_id missing"
        bio_id = p.get("bio_id") or []
        assert isinstance(bio_id, list) and len(bio_id) >= 2, f"bio_id should have >=2 paragraphs, got {len(bio_id)}"
        # All stats have label_id
        for st in p.get("stats", []):
            assert st.get("label_id"), f"stat missing label_id: {st}"

    def test_admin_profile_round_trip_preserves_bilingual(self, admin_session):
        # GET current
        r = admin_session.get(f"{API}/admin/profile")
        assert r.status_code == 200
        original = r.json()
        # Build update payload preserving both EN + ID
        payload = {
            "name": original["name"],
            "title": original["title"],
            "title_id": original.get("title_id", ""),
            "location": original["location"],
            "location_id": original.get("location_id", ""),
            "intro": original.get("intro", ""),
            "intro_id": original.get("intro_id", ""),
            "bio": original.get("bio", []),
            "bio_id": original.get("bio_id", []),
            "email": original["email"],
            "stats": original.get("stats", []),
            "company_site": original.get("company_site", ""),
            "company_maps": original.get("company_maps", ""),
        }
        # Mutate ID field
        payload["title_id"] = payload["title_id"] + " (TEST)"
        r2 = admin_session.put(f"{API}/admin/profile", json=payload)
        assert r2.status_code == 200, r2.text
        assert r2.json()["title_id"].endswith(" (TEST)")
        # Public reflects
        r3 = requests.get(f"{API}/profile")
        assert r3.json()["title_id"].endswith(" (TEST)")
        # EN preserved
        assert r3.json()["title"] == original["title"]
        # bio_id preserved with right length
        assert len(r3.json().get("bio_id", [])) == len(original.get("bio_id", []))
        # Restore
        payload["title_id"] = original.get("title_id", "")
        admin_session.put(f"{API}/admin/profile", json=payload)


# ---------------- Case Studies bilingual ----------------
class TestCaseStudiesBilingual:
    @pytest.mark.parametrize("cid", SEEDED_CASES)
    def test_each_seeded_case_has_bilingual(self, cid):
        r = requests.get(f"{API}/case-studies/{cid}")
        assert r.status_code == 200, f"{cid}: {r.status_code}"
        d = r.json()
        for f in ["title_id", "subtitle_id", "summary_id", "challenge_id"]:
            assert d.get(f), f"{cid} missing {f}"
        # approach_id and outcomes_id should be lists with content
        assert isinstance(d.get("approach_id"), list) and len(d["approach_id"]) >= 1, f"{cid} approach_id empty"
        assert isinstance(d.get("outcomes_id"), list) and len(d["outcomes_id"]) >= 1, f"{cid} outcomes_id empty"

    def test_turikale_specific_id_content(self):
        r = requests.get(f"{API}/case-studies/turikale-print")
        d = r.json()
        # Sanity: Indonesian content is distinct from English
        assert d["title"] != d["title_id"]
        assert len(d["approach_id"]) == 3
        assert len(d["outcomes_id"]) == 3

    def test_admin_case_study_round_trip_preserves_bilingual(self, admin_session):
        # GET existing
        r = admin_session.get(f"{API}/admin/case-studies")
        assert r.status_code == 200
        cs_list = r.json()
        target = next((c for c in cs_list if c["id"] == "aidu-edtech"), None)
        assert target, "aidu-edtech missing"
        original = dict(target)

        # PUT with explicit ID + EN fields, mutate one ID field
        payload = {k: v for k, v in target.items() if k != "id"}
        payload["summary_id"] = (payload.get("summary_id") or "") + " [TEST]"
        r2 = admin_session.put(f"{API}/admin/case-studies/aidu-edtech", json=payload)
        assert r2.status_code == 200, r2.text
        body = r2.json()
        assert body["summary_id"].endswith(" [TEST]")
        # EN preserved
        assert body["summary"] == original["summary"]
        # approach_id list preserved
        assert body.get("approach_id") == original.get("approach_id")

        # Restore
        payload["summary_id"] = original.get("summary_id", "")
        admin_session.put(f"{API}/admin/case-studies/aidu-edtech", json=payload)
