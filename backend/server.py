from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
STATIC_DIR = ROOT_DIR / "static"
UPLOADS_DIR = STATIC_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import secrets
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------------- Config ----------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
JWT_ALGORITHM = "HS256"
ACCESS_TTL_MIN = 60 * 8  # 8h — admin convenience
REFRESH_TTL_DAYS = 14

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


# ---------------- App ----------------
app = FastAPI(title="Andry Ridwan Portfolio API")
api_router = APIRouter(prefix="/api")


# Mount uploaded images at /api/uploads/<file>
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# ---------------- Helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TTL_MIN),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TTL_DAYS),
        "type": "refresh",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        "access_token", access_token,
        httponly=True, secure=True, samesite="none",
        max_age=ACCESS_TTL_MIN * 60, path="/",
    )
    response.set_cookie(
        "refresh_token", refresh_token,
        httponly=True, secure=True, samesite="none",
        max_age=REFRESH_TTL_DAYS * 24 * 3600, path="/",
    )


def clear_auth_cookies(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Brute force ----------------
LOCKOUT_AFTER = 5
LOCKOUT_MINUTES = 15


async def check_lockout(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if rec and rec.get("locked_until"):
        try:
            locked_until = datetime.fromisoformat(rec["locked_until"])
        except Exception:
            locked_until = None
        if locked_until and locked_until > datetime.now(timezone.utc):
            mins = int((locked_until - datetime.now(timezone.utc)).total_seconds() // 60) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Too many failed attempts. Try again in {mins} minute(s).",
            )


async def record_failure(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    attempts = (rec or {}).get("attempts", 0) + 1
    update = {"identifier": identifier, "attempts": attempts}
    if attempts >= LOCKOUT_AFTER:
        update["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
        update["attempts"] = 0
    await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)


async def clear_failures(identifier: str):
    await db.login_attempts.delete_one({"identifier": identifier})


# ---------------- Models ----------------
class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: Optional[str] = None
    role: str


class ContactSubmissionCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default=None, max_length=120)
    subject: Optional[str] = Field(default=None, max_length=160)
    message: str = Field(min_length=10, max_length=4000)


class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: Optional[str] = None
    subject: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Stat(BaseModel):
    label: str
    value: str


class Profile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    title: str
    location: str
    email: str
    phone: str
    intro: str
    bio: List[str] = []
    stats: List[Stat] = []
    portrait: str = ""
    instagram: str = ""
    company_site: str = ""
    company_maps: str = ""


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    intro: Optional[str] = None
    bio: Optional[List[str]] = None
    stats: Optional[List[Stat]] = None
    portrait: Optional[str] = None
    instagram: Optional[str] = None
    company_site: Optional[str] = None
    company_maps: Optional[str] = None


class Metric(BaseModel):
    label: str
    value: str


class CaseStudy(BaseModel):
    id: str
    title: str
    subtitle: str
    category: str
    year: str
    cover_image: str
    summary: str
    challenge: str
    approach: List[str]
    outcomes: List[str]
    metrics: List[Metric]
    client: str
    tags: List[str]
    sort_order: int = 0


class CaseStudyUpsert(BaseModel):
    title: str
    subtitle: str = ""
    category: str
    year: str = ""
    cover_image: str = ""
    summary: str = ""
    challenge: str = ""
    approach: List[str] = []
    outcomes: List[str] = []
    metrics: List[Metric] = []
    client: str = ""
    tags: List[str] = []
    sort_order: int = 0


class Category(BaseModel):
    id: str
    label: str
    count: int


CATEGORIES = [
    {"id": "all", "label": "All Work"},
    {"id": "strategic-partnerships", "label": "Strategic Partnerships"},
    {"id": "enterprise-sales", "label": "Enterprise Sales"},
    {"id": "market-expansion", "label": "Market Expansion"},
    {"id": "client-success", "label": "Client Success"},
    {"id": "gtm-strategy", "label": "GTM Strategy"},
]


# ---------------- Seed data ----------------
DEFAULT_PROFILE = {
    "name": "Andry Ridwan",
    "title": "Business Development & SME Growth Mentor",
    "location": "Maros · South Sulawesi, Indonesia",
    "email": "ndriyconnect@gmail.com",
    "phone": "+62 823 4657 3790",
    "intro": "I help SMEs, EdTech founders and government-backed programmes turn early traction into measurable, fundable businesses across Indonesia.",
    "bio": [
        "I have spent the last decade building and mentoring small businesses, EdTech startups and merchant communities — moving from co-founder seats inside early-stage ventures like AIDU to lead-mentor roles in national programmes run by Kemenkop RI, the Ministry of Manpower and Kominfo. I have also sharpened that craft inside bootcamps at Bank Indonesia and NextDev Academy by Telkomsel.",
        "Today I run Turikale Print — a local business in Maros, South Sulawesi, with a 5-star Google rating — while continuing to mentor SMEs, cohorts and founders across the region. Whatever the brief, my job is the same: write the playbook, sit beside the founder, and make the numbers move.",
    ],
    "stats": [
        {"label": "Years building businesses", "value": "10+"},
        {"label": "SMEs scaled to ready", "value": "20+"},
        {"label": "Merchants onboarded (5 days)", "value": "121"},
        {"label": "EdTech users led", "value": "714+"},
    ],
    "portrait": "https://customer-assets.emergentagent.com/job_biz-dev-portfolio-3/artifacts/xxmlyyw0_Andry%20Ridwan.JPG",
    "instagram": "https://instagram.com/andry_ridwan",
    "company_site": "https://turikaleprint.space",
    "company_maps": "https://www.google.com/maps/place/Turikale+Print/data=!4m2!3m1!1s0x0:0xf34aa0af5aa85dd9?sa=X&ved=1t:2428&ictx=111",
}


DEFAULT_CASE_STUDIES = [
    {
        "id": "turikale-print",
        "title": "Turikale Print — building a 5-star local business",
        "subtitle": "Owner of a print and creative service business in Maros, South Sulawesi.",
        "category": "market-expansion",
        "year": "2019 — Present",
        "cover_image": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1400&q=80",
        "client": "Turikale Print · CV. OPU BARAKATI JAYA (findable on Google Maps)",
        "summary": "Founded and still running a community-anchored print business with a 5-star Google rating and 3,715+ profile views.",
        "challenge": "A small local print business in Maros faced the same problem most regional SMEs do: heavy reliance on walk-ins, no online presence, and no easy way for new customers to find or trust the service before visiting.",
        "approach": [
            "Stood up a Google Business Profile and kept it active with photos, hours and responsive replies.",
            "Built repeat-customer loops around clear pricing, fast turnaround and friendly service so positive reviews stacked up.",
            "Used the same digital-marketing playbook I teach SMEs in mentoring programmes — applied to my own shop.",
        ],
        "outcomes": [
            "Sustained 5-star average rating from real customers on Google Maps.",
            "3,715+ profile views and steady inbound enquiries from the local area.",
            "A working real-world case study I bring into every SME mentoring session.",
        ],
        "metrics": [
            {"label": "Rating", "value": "5★"},
            {"label": "Profile views", "value": "3,715+"},
            {"label": "Since", "value": "2019"},
        ],
        "tags": ["Local business", "Owner", "Digital marketing"],
        "sort_order": 10,
    },
    {
        "id": "koperasi-merah-putih",
        "title": "Turning village cooperatives into real businesses",
        "subtitle": "Embedded as Business Assistant for Indonesia's Koperasi Desa Merah Putih programme.",
        "category": "strategic-partnerships",
        "year": "2025",
        "cover_image": "https://images.pexels.com/photos/7698712/pexels-photo-7698712.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "client": "Kemenkop RI · Koperasi Desa Merah Putih",
        "summary": "Helping village cooperatives operate as functioning business units that stimulate the local economy.",
        "challenge": "Many village cooperatives existed on paper but did not run as businesses — no bookkeeping, no clear products, no member-facing services. The national programme needed hands-on assistants who could turn that around at the village level.",
        "approach": [
            "Diagnosed each cooperative's revenue model, governance gaps and member needs in the first 30 days.",
            "Co-built a simple monthly operating cadence — books, stock, member services, and a single growth experiment per quarter.",
            "Connected cooperatives to local merchants and SMEs so the cooperative became a useful trading node, not just an administrative entity.",
        ],
        "outcomes": [
            "Cooperatives now run regular monthly closings and member reporting.",
            "Local merchants routed through the cooperative for shared procurement.",
            "Visible uplift in member participation and recurring transactions.",
        ],
        "metrics": [
            {"label": "Programme", "value": "Kemenkop RI"},
            {"label": "Role", "value": "Business Assistant"},
            {"label": "Cadence", "value": "Monthly ops"},
        ],
        "tags": ["Cooperatives", "Government programme", "Local economy"],
        "sort_order": 20,
    },
    {
        "id": "tkmp-2024",
        "title": "TKMP 2024 — funding & mentoring first-time founders",
        "subtitle": "Cohort mentor for the Ministry of Manpower's Tenaga Kerja Mandiri Pemula programme.",
        "category": "client-success",
        "year": "2024",
        "cover_image": "https://images.unsplash.com/photo-1758518727613-00192aed759b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1lZXRpbmclMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MHx8fHwxNzgwODk2NjA4fDA&ixlib=rb-4.1.0&q=85",
        "client": "Ministry of Manpower × Politeknik STIA LAN Bandung",
        "summary": "Upgraded 20 SMEs to ready-to-fund status with a real business plan, legality and branding.",
        "challenge": "The cohort was first-time entrepreneurs with funding allocated but no operating discipline. Without structured mentorship the grant risked becoming working capital rather than a launching pad.",
        "approach": [
            "Ran weekly 1:1 mentoring across legality, bookkeeping, pricing and basic branding.",
            "Worked through each founder's first sales channel — offline and digital — to validate willingness to pay.",
            "Documented every business plan to a single, comparable template the ministry could audit.",
        ],
        "outcomes": [
            "20 SMEs upgraded to having a measurable business plan, legality, financial report and branding.",
            "Founders graduated with a clear next-quarter revenue plan.",
            "Mentorship model reused for subsequent programme cohorts.",
        ],
        "metrics": [
            {"label": "SMEs upgraded", "value": "20"},
            {"label": "Programme", "value": "TKMP 2024"},
            {"label": "Cadence", "value": "Weekly 1:1"},
        ],
        "tags": ["SME", "Mentoring", "Government programme"],
        "sort_order": 30,
    },
    {
        "id": "aidu-edtech",
        "title": "AIDU — co-founding Makassar's first exam-management EdTech",
        "subtitle": "Co-founded and led an early-stage EdTech that reached 714+ registered users.",
        "category": "gtm-strategy",
        "year": "2018 — 2020",
        "cover_image": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1lZXRpbmclMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MHx8fHwxNzgwODk2NjA4fDA&ixlib=rb-4.1.0&q=85",
        "client": "AIDU (EdTech startup, Makassar)",
        "summary": "Co-founded and led the first dedicated exam-management EdTech in Makassar, growing it to 714+ users.",
        "challenge": "Makassar had no localised EdTech focused on exam preparation and management. Our small founding team had to build the product, the brand, and the trust of schools and parents from zero — in a market where most education spend still flowed offline.",
        "approach": [
            "With the co-founding team, defined the product wedge — exam management for tutoring centres — and shipped an MVP with the first three schools.",
            "Built a founder-led sales motion across schools and tutoring centres, walking owners through the product personally.",
            "Codified onboarding so each new school could be live within a single week.",
        ],
        "outcomes": [
            "714+ registered users on the platform.",
            "First exam-management EdTech operating in the region.",
            "Founder playbook reusable for future EdTech ventures.",
        ],
        "metrics": [
            {"label": "Registered users", "value": "714+"},
            {"label": "Role", "value": "Co-founder & CEO"},
            {"label": "Region", "value": "Makassar"},
        ],
        "tags": ["EdTech", "Co-founded", "Founder-led sales"],
        "sort_order": 40,
    },
    {
        "id": "gapura-digital",
        "title": "Google Gapura Digital — bringing SMEs online",
        "subtitle": "Local facilitator for Google's national SME digital-marketing programme.",
        "category": "market-expansion",
        "year": "2017",
        "cover_image": "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1400&q=80",
        "client": "Google Gapura Digital",
        "summary": "Delivered hands-on training so traditional SMEs could grow through digital marketing.",
        "challenge": "Most local SMEs were still entirely offline. Awareness of basic digital marketing — Google profiles, paid ads, social — was low and the gap to taking a first online order was wider than it looked.",
        "approach": [
            "Ran in-person workshops localised to the participants' industries and average ticket sizes.",
            "Helped each SME stand up the basics: Google Business Profile, a working WhatsApp catalogue and one paid experiment.",
            "Coached owners through their first 30 days of running the channel themselves.",
        ],
        "outcomes": [
            "SMEs leaving the programme with a live digital storefront.",
            "Owners equipped to keep running the channel without external help.",
            "Local case studies used to recruit subsequent cohorts.",
        ],
        "metrics": [
            {"label": "Role", "value": "Facilitator"},
            {"label": "Format", "value": "Workshop + 1:1"},
            {"label": "Outcome", "value": "Live storefronts"},
        ],
        "tags": ["Digital marketing", "SME", "Training"],
        "sort_order": 50,
    },
    {
        "id": "umkm-jualan-online",
        "title": "121 merchants live in five days",
        "subtitle": "Local volunteer coordinator for the national UMKM Jualan Online sprint.",
        "category": "enterprise-sales",
        "year": "2018",
        "cover_image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
        "client": "Kominfo × Bukalapak × GrabFood",
        "summary": "Onboarded 121 local merchants onto Bukalapak and GrabFood inside a five-day programme window.",
        "challenge": "The national sprint allocated only five days to add merchants in each region. Most local sellers had never used an e-commerce or food platform, and many didn't trust the process.",
        "approach": [
            "Recruited and trained a small local volunteer team before the sprint week opened.",
            "Set up a kiosk-style onboarding flow so a merchant could be live within 20 minutes.",
            "Followed up with merchants the week after to make sure their first orders actually flowed.",
        ],
        "outcomes": [
            "121 merchants registered and live across both platforms.",
            "Onboarding flow replicated in subsequent regional waves.",
            "Local community of sellers stayed active after the programme ended.",
        ],
        "metrics": [
            {"label": "Merchants live", "value": "121"},
            {"label": "Sprint length", "value": "5 days"},
            {"label": "Platforms", "value": "2"},
        ],
        "tags": ["Merchant onboarding", "Channel", "E-commerce"],
        "sort_order": 60,
    },
    {
        "id": "1000-startup-digital",
        "title": "Gerakan Nasional 1000 Startup Digital",
        "subtitle": "National mentor for Indonesia's flagship startup programme.",
        "category": "strategic-partnerships",
        "year": "2019 — 2020",
        "cover_image": "https://images.unsplash.com/photo-1573164574511-73c773193279?auto=format&fit=crop&w=1400&q=80",
        "client": "Ministry of Communication and Informatics",
        "summary": "Mentored aspiring digital founders through validated business plans and first-customer milestones.",
        "challenge": "Most participants arrived with ideas and energy but no operating template — no ICP, no validated problem and no realistic plan for the first ten customers.",
        "approach": [
            "Walked founders through a compressed discovery-to-MVP loop with a real customer in the room.",
            "Coached on positioning, pricing and the first-customer playbook before any code was written.",
            "Connected promising teams to the wider Indonesian startup ecosystem for follow-on support.",
        ],
        "outcomes": [
            "Cohorts shipped first MVPs with paying or committed customers.",
            "Several teams continued into accelerator and grant pipelines after the programme.",
            "Mentorship template reused across multiple regional sessions.",
        ],
        "metrics": [
            {"label": "Programme", "value": "1000 Startup"},
            {"label": "Role", "value": "Mentor"},
            {"label": "Scope", "value": "National"},
        ],
        "tags": ["Startup", "Mentoring", "National programme"],
        "sort_order": 70,
    },
]


# ---------------- Startup: seed admin, profile, case studies, indexes ----------------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.case_studies.create_index("id", unique=True)

    # Admin seeding (idempotent — keep hash in sync with .env)
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Andry Ridwan",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    else:
        if not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            await db.users.update_one(
                {"email": ADMIN_EMAIL},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )

    # Profile seeding
    if await db.profile.find_one({"_id": "site"}) is None:
        await db.profile.insert_one({"_id": "site", **DEFAULT_PROFILE})

    # Case study seeding
    if await db.case_studies.count_documents({}) == 0:
        await db.case_studies.insert_many([dict(cs) for cs in DEFAULT_CASE_STUDIES])


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ---------------- Auth routes ----------------
@api_router.post("/auth/login", response_model=UserOut)
async def login(payload: LoginIn, request: Request, response: Response):
    email = payload.email.lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"

    await check_lockout(identifier)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await record_failure(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await clear_failures(identifier)
    access = create_access_token(user["id"], email)
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return {"id": user["id"], "email": email, "name": user.get("name"), "role": user["role"]}


@api_router.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"], "name": user.get("name"), "role": user["role"]}


@api_router.post("/auth/refresh")
async def refresh_token_endpoint(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        new_access = create_access_token(user["id"], user["email"])
        response.set_cookie(
            "access_token", new_access,
            httponly=True, secure=True, samesite="none",
            max_age=ACCESS_TTL_MIN * 60, path="/",
        )
        return {"ok": True}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------------- Public routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Andry Ridwan portfolio API", "version": "2.0"}


@api_router.get("/profile", response_model=Profile)
async def get_profile_public():
    doc = await db.profile.find_one({"_id": "site"}, {"_id": 0})
    if not doc:
        return DEFAULT_PROFILE
    return doc


@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    out = []
    for c in CATEGORIES:
        if c["id"] == "all":
            count = await db.case_studies.count_documents({})
        else:
            count = await db.case_studies.count_documents({"category": c["id"]})
        out.append({"id": c["id"], "label": c["label"], "count": count})
    return out


@api_router.get("/case-studies", response_model=List[CaseStudy])
async def list_case_studies(category: Optional[str] = None):
    q = {} if not category or category == "all" else {"category": category}
    cursor = db.case_studies.find(q, {"_id": 0}).sort([("sort_order", 1)])
    return await cursor.to_list(200)


@api_router.get("/case-studies/{case_id}", response_model=CaseStudy)
async def get_case_study(case_id: str):
    cs = await db.case_studies.find_one({"id": case_id}, {"_id": 0})
    if not cs:
        raise HTTPException(status_code=404, detail="Case study not found")
    return cs


@api_router.post("/contact", response_model=ContactSubmission, status_code=201)
async def submit_contact(payload: ContactSubmissionCreate):
    submission = ContactSubmission(**payload.model_dump())
    doc = submission.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["email"] = str(doc["email"])
    await db.contact_submissions.insert_one(doc)
    return submission


@api_router.get("/contact", response_model=List[ContactSubmission])
async def list_contacts_legacy():
    items = await db.contact_submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for it in items:
        if isinstance(it.get("created_at"), str):
            try:
                it["created_at"] = datetime.fromisoformat(it["created_at"])
            except Exception:
                pass
    return items


@api_router.get("/cv")
async def download_cv():
    pdf_path = STATIC_DIR / "cv_alex_morgan.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="CV not available yet")
    return FileResponse(pdf_path, media_type="application/pdf", filename="Andry_Ridwan_CV.pdf")


# ---------------- Admin routes ----------------
admin_router = APIRouter(prefix="/api/admin")


@admin_router.get("/profile", response_model=Profile)
async def admin_get_profile(_: dict = Depends(get_current_user)):
    doc = await db.profile.find_one({"_id": "site"}, {"_id": 0})
    if not doc:
        return DEFAULT_PROFILE
    return doc


@admin_router.put("/profile", response_model=Profile)
async def admin_update_profile(update: ProfileUpdate, _: dict = Depends(get_current_user)):
    data = {k: v for k, v in update.model_dump().items() if v is not None}
    if "stats" in data:
        data["stats"] = [s if isinstance(s, dict) else s.model_dump() for s in data["stats"]]
    await db.profile.update_one({"_id": "site"}, {"$set": data}, upsert=True)
    doc = await db.profile.find_one({"_id": "site"}, {"_id": 0})
    return doc


@admin_router.get("/case-studies", response_model=List[CaseStudy])
async def admin_list_case_studies(_: dict = Depends(get_current_user)):
    return await db.case_studies.find({}, {"_id": 0}).sort([("sort_order", 1)]).to_list(200)


@admin_router.post("/case-studies", response_model=CaseStudy, status_code=201)
async def admin_create_case_study(payload: CaseStudyUpsert, _: dict = Depends(get_current_user)):
    new_id = str(uuid.uuid4())[:8]
    doc = payload.model_dump()
    doc["metrics"] = [m if isinstance(m, dict) else m.model_dump() for m in doc.get("metrics", [])]
    doc["id"] = new_id
    if not doc.get("sort_order"):
        last = await db.case_studies.find_one({}, sort=[("sort_order", -1)])
        doc["sort_order"] = ((last or {}).get("sort_order", 0)) + 10
    await db.case_studies.insert_one(doc)
    saved = await db.case_studies.find_one({"id": new_id}, {"_id": 0})
    return saved


@admin_router.put("/case-studies/{case_id}", response_model=CaseStudy)
async def admin_update_case_study(case_id: str, payload: CaseStudyUpsert, _: dict = Depends(get_current_user)):
    existing = await db.case_studies.find_one({"id": case_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Case study not found")
    data = payload.model_dump()
    data["metrics"] = [m if isinstance(m, dict) else m.model_dump() for m in data.get("metrics", [])]
    await db.case_studies.update_one({"id": case_id}, {"$set": data})
    saved = await db.case_studies.find_one({"id": case_id}, {"_id": 0})
    return saved


@admin_router.delete("/case-studies/{case_id}")
async def admin_delete_case_study(case_id: str, _: dict = Depends(get_current_user)):
    res = await db.case_studies.delete_one({"id": case_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Case study not found")
    return {"ok": True}


@admin_router.post("/upload/image")
async def admin_upload_image(file: UploadFile = File(...), _: dict = Depends(get_current_user)):
    ct = (file.content_type or "").lower()
    if not ct.startswith("image/"):
        raise HTTPException(status_code=415, detail="Only image uploads are allowed")
    ext_map = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
    ext = ext_map.get(ct, ".jpg")
    name = f"{secrets.token_hex(8)}{ext}"
    dest = UPLOADS_DIR / name
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 8 MB)")
    dest.write_bytes(data)
    return {"url": f"/api/uploads/{name}", "filename": name, "size": len(data)}


@admin_router.post("/upload/cv")
async def admin_upload_cv(file: UploadFile = File(...), _: dict = Depends(get_current_user)):
    ct = (file.content_type or "").lower()
    if ct not in ("application/pdf", "application/octet-stream") and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Only PDF uploads are allowed")
    data = await file.read()
    if len(data) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="PDF too large (max 12 MB)")
    dest = STATIC_DIR / "cv_alex_morgan.pdf"
    dest.write_bytes(data)
    return {"ok": True, "size": len(data)}


@admin_router.get("/contacts", response_model=List[ContactSubmission])
async def admin_list_contacts(_: dict = Depends(get_current_user)):
    items = await db.contact_submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for it in items:
        if isinstance(it.get("created_at"), str):
            try:
                it["created_at"] = datetime.fromisoformat(it["created_at"])
            except Exception:
                pass
    return items


@admin_router.delete("/contacts/{cid}")
async def admin_delete_contact(cid: str, _: dict = Depends(get_current_user)):
    res = await db.contact_submissions.delete_one({"id": cid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True}


# ---------------- App wire-up ----------------
app.include_router(api_router)
app.include_router(admin_router)

origins = [FRONTEND_URL]
if FRONTEND_URL != "http://localhost:3000":
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
