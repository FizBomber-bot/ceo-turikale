from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
STATIC_DIR = ROOT_DIR / "static"
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Alex Morgan Portfolio API")
api_router = APIRouter(prefix="/api")


# ------------- Models -------------
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
    metrics: List[dict]
    client: str
    tags: List[str]


class Category(BaseModel):
    id: str
    label: str
    count: int


# ------------- Seed data -------------
CASE_STUDIES: List[dict] = [
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
            "Connected cooperatives to local merchants and SMEs so the cooperative became a useful trading node, not just an administrative entity."
        ],
        "outcomes": [
            "Cooperatives now run regular monthly closings and member reporting.",
            "Local merchants routed through the cooperative for shared procurement.",
            "Visible uplift in member participation and recurring transactions."
        ],
        "metrics": [
            {"label": "Programme", "value": "Kemenkop RI"},
            {"label": "Role", "value": "Business Assistant"},
            {"label": "Cadence", "value": "Monthly ops"}
        ],
        "tags": ["Cooperatives", "Government programme", "Local economy"]
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
            "Documented every business plan to a single, comparable template the ministry could audit."
        ],
        "outcomes": [
            "20 SMEs upgraded to having a measurable business plan, legality, financial report and branding.",
            "Founders graduated with a clear next-quarter revenue plan.",
            "Mentorship model reused for subsequent programme cohorts."
        ],
        "metrics": [
            {"label": "SMEs upgraded", "value": "20"},
            {"label": "Programme", "value": "TKMP 2024"},
            {"label": "Cadence", "value": "Weekly 1:1"}
        ],
        "tags": ["SME", "Mentoring", "Government programme"]
    },
    {
        "id": "aidu-edtech",
        "title": "AIDU — building Makassar's first exam-management EdTech",
        "subtitle": "CEO of an early-stage EdTech that reached 714+ registered users.",
        "category": "gtm-strategy",
        "year": "2018 — 2020",
        "cover_image": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1lZXRpbmclMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MHx8fHwxNzgwODk2NjA4fDA&ixlib=rb-4.1.0&q=85",
        "client": "AIDU (EdTech startup, Makassar)",
        "summary": "Founded and led the first dedicated exam-management EdTech in Makassar, growing it to 714+ users.",
        "challenge": "Makassar had no localised EdTech focused on exam preparation and management. We had to build the product, the brand, and the trust of schools and parents from zero — in a market where most education spend still flowed offline.",
        "approach": [
            "Defined the product wedge — exam management for tutoring centres — and shipped an MVP with the first three schools.",
            "Built a founder-led sales motion across schools and tutoring centres, walking owners through the product personally.",
            "Codified onboarding so each new school could be live within a single week."
        ],
        "outcomes": [
            "714+ registered users on the platform.",
            "First exam-management EdTech operating in the region.",
            "Founder playbook reusable for future EdTech ventures."
        ],
        "metrics": [
            {"label": "Registered users", "value": "714+"},
            {"label": "Role", "value": "CEO"},
            {"label": "Region", "value": "Makassar"}
        ],
        "tags": ["EdTech", "Founder-led sales", "Launch"]
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
            "Coached owners through their first 30 days of running the channel themselves."
        ],
        "outcomes": [
            "SMEs leaving the programme with a live digital storefront.",
            "Owners equipped to keep running the channel without external help.",
            "Local case studies used to recruit subsequent cohorts."
        ],
        "metrics": [
            {"label": "Role", "value": "Facilitator"},
            {"label": "Format", "value": "Workshop + 1:1"},
            {"label": "Outcome", "value": "Live storefronts"}
        ],
        "tags": ["Digital marketing", "SME", "Training"]
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
            "Followed up with merchants the week after to make sure their first orders actually flowed."
        ],
        "outcomes": [
            "121 merchants registered and live across both platforms.",
            "Onboarding flow replicated in subsequent regional waves.",
            "Local community of sellers stayed active after the programme ended."
        ],
        "metrics": [
            {"label": "Merchants live", "value": "121"},
            {"label": "Sprint length", "value": "5 days"},
            {"label": "Platforms", "value": "2"}
        ],
        "tags": ["Merchant onboarding", "Channel", "E-commerce"]
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
            "Connected promising teams to the wider Indonesian startup ecosystem for follow-on support."
        ],
        "outcomes": [
            "Cohorts shipped first MVPs with paying or committed customers.",
            "Several teams continued into accelerator and grant pipelines after the programme.",
            "Mentorship template reused across multiple regional sessions."
        ],
        "metrics": [
            {"label": "Programme", "value": "1000 Startup"},
            {"label": "Role", "value": "Mentor"},
            {"label": "Scope", "value": "National"}
        ],
        "tags": ["Startup", "Mentoring", "National programme"]
    }
]

CATEGORIES = [
    {"id": "all", "label": "All Work"},
    {"id": "strategic-partnerships", "label": "Strategic Partnerships"},
    {"id": "enterprise-sales", "label": "Enterprise Sales"},
    {"id": "market-expansion", "label": "Market Expansion"},
    {"id": "client-success", "label": "Client Success"},
    {"id": "gtm-strategy", "label": "GTM Strategy"},
]


# ------------- Routes -------------
@api_router.get("/")
async def root():
    return {"message": "Alex Morgan portfolio API", "version": "1.0"}


@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    out = []
    for c in CATEGORIES:
        if c["id"] == "all":
            count = len(CASE_STUDIES)
        else:
            count = sum(1 for cs in CASE_STUDIES if cs["category"] == c["id"])
        out.append({"id": c["id"], "label": c["label"], "count": count})
    return out


@api_router.get("/case-studies", response_model=List[CaseStudy])
async def list_case_studies(category: Optional[str] = None):
    if category and category != "all":
        items = [cs for cs in CASE_STUDIES if cs["category"] == category]
    else:
        items = CASE_STUDIES
    return items


@api_router.get("/case-studies/{case_id}", response_model=CaseStudy)
async def get_case_study(case_id: str):
    for cs in CASE_STUDIES:
        if cs["id"] == case_id:
            return cs
    raise HTTPException(status_code=404, detail="Case study not found")


@api_router.post("/contact", response_model=ContactSubmission, status_code=201)
async def submit_contact(payload: ContactSubmissionCreate):
    submission = ContactSubmission(**payload.model_dump())
    doc = submission.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["email"] = str(doc["email"])
    await db.contact_submissions.insert_one(doc)
    return submission


@api_router.get("/contact", response_model=List[ContactSubmission])
async def list_contacts():
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
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="Alex_Morgan_CV.pdf",
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
