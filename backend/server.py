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
        "id": "northwind-channel",
        "title": "Architecting a $42M global channel program",
        "subtitle": "From cold partnerships to a thriving reseller ecosystem in 14 months.",
        "category": "strategic-partnerships",
        "year": "2024",
        "cover_image": "https://images.pexels.com/photos/7698712/pexels-photo-7698712.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "client": "Northwind Labs (Series C SaaS)",
        "summary": "Designed and launched a tiered partner program that scaled indirect revenue from 6% to 31% of ARR.",
        "challenge": "Northwind had strong direct sales but no repeatable partner motion. Competitors were locking up systems integrators and the board wanted indirect revenue to hit 30% of ARR within 18 months.",
        "approach": [
            "Mapped the partner landscape across NA and EMEA, ranking 240 targets by ICP fit and influence.",
            "Co-authored a three-tier partner framework (Referral, Build, Strategic) with margin economics and a self-serve enablement portal.",
            "Personally closed the first six lighthouse partners to prove the motion before scaling the team."
        ],
        "outcomes": [
            "Indirect revenue grew from 6% to 31% of ARR in 14 months.",
            "42 active partners contributing pipeline, with a 3.2x payback on partner CAC.",
            "Two strategic OEM deals signed with category leaders."
        ],
        "metrics": [
            {"label": "Channel ARR", "value": "$42M"},
            {"label": "Active partners", "value": "42"},
            {"label": "Indirect ARR mix", "value": "31%"}
        ],
        "tags": ["Partnerships", "GTM", "Channel"]
    },
    {
        "id": "lumen-enterprise",
        "title": "Landing the largest deal in Lumen's history",
        "subtitle": "A multi-thread, 11-month pursuit ending in a $17.4M, three-year contract.",
        "category": "enterprise-sales",
        "year": "2023",
        "cover_image": "https://images.unsplash.com/photo-1758518727613-00192aed759b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1lZXRpbmclMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MHx8fHwxNzgwODk2NjA4fDA&ixlib=rb-4.1.0&q=85",
        "client": "Fortune 100 financial services group",
        "summary": "Navigated a complex 23-stakeholder buying committee to land Lumen's largest enterprise contract.",
        "challenge": "The prospect had standardized on an incumbent for 9 years. Procurement was hostile, security review was a 400-question gauntlet, and budget for net-new tooling had been frozen twice.",
        "approach": [
            "Built a stakeholder map of 23 buyers; ran champion-building 1:1s with the four most influential.",
            "Engineered a value hypothesis tied to a specific board-level KPI (cost-to-serve) and validated it in two paid pilots.",
            "Negotiated a multi-year ramp deal that displaced 60% of the incumbent's footprint."
        ],
        "outcomes": [
            "$17.4M TCV across three years, with $5.1M booked in year one.",
            "Reference-grade case study unlocking three further F500 opportunities.",
            "Procurement cycle compressed from a projected 14 months to 11."
        ],
        "metrics": [
            {"label": "TCV", "value": "$17.4M"},
            {"label": "Buying committee", "value": "23"},
            {"label": "Cycle compression", "value": "−3 mo"}
        ],
        "tags": ["Enterprise", "Complex sales", "Negotiation"]
    },
    {
        "id": "vector-emea",
        "title": "Standing up EMEA from a single laptop",
        "subtitle": "Built a four-country go-to-market motion that hit $12M ARR in year two.",
        "category": "market-expansion",
        "year": "2022",
        "cover_image": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1lZXRpbmclMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MHx8fHwxNzgwODk2NjA4fDA&ixlib=rb-4.1.0&q=85",
        "client": "Vector Analytics (PE-backed)",
        "summary": "Founded the EMEA region for Vector, hiring local AEs and signing the first 38 logos personally.",
        "challenge": "Vector was a US-centric brand with zero EMEA presence, no localized pricing, and a product that needed GDPR rework before it could be sold in regulated industries.",
        "approach": [
            "Sequenced market entry: UK and Netherlands first as English-language beachheads, DACH and France in year two.",
            "Partnered with product to ship a GDPR-compliant data residency option in 90 days.",
            "Hired three founding AEs and an SDR pod, codifying a regional playbook within 5 months."
        ],
        "outcomes": [
            "$12M ARR by month 24, 4 countries live.",
            "38 logos personally sourced and closed during the founder-led sales phase.",
            "EMEA contribution grew to 27% of total ARR by exit."
        ],
        "metrics": [
            {"label": "ARR in 24 mo", "value": "$12M"},
            {"label": "Countries live", "value": "4"},
            {"label": "Logos signed", "value": "38"}
        ],
        "tags": ["Expansion", "Hiring", "Localization"]
    },
    {
        "id": "forge-retention",
        "title": "Turning churn into a retention engine",
        "subtitle": "Rebuilt the post-sales motion and recovered $6.8M of at-risk ARR.",
        "category": "client-success",
        "year": "2023",
        "cover_image": "https://images.unsplash.com/photo-1573164574511-73c773193279?auto=format&fit=crop&w=1400&q=80",
        "client": "Forge SaaS (Series B)",
        "summary": "Built a tiered customer success motion that lifted gross retention from 84% to 96%.",
        "challenge": "Forge's growth was masking a churn problem. Net revenue retention had quietly dropped to 91% and three flagship accounts were threatening to leave at renewal.",
        "approach": [
            "Segmented the book into Strategic, Growth and Long-Tail with distinct coverage models.",
            "Personally led the recovery of the three flagship accounts via executive sponsorship and a structured value review.",
            "Stood up a quarterly business review program with a shared scorecard between CS, product and finance."
        ],
        "outcomes": [
            "Gross retention 84% → 96% in 9 months.",
            "$6.8M ARR recovered from at-risk accounts.",
            "NPS lifted from 28 to 51 across the strategic segment."
        ],
        "metrics": [
            {"label": "Gross retention", "value": "96%"},
            {"label": "ARR recovered", "value": "$6.8M"},
            {"label": "NPS lift", "value": "+23"}
        ],
        "tags": ["Retention", "Customer Success", "Executive sponsorship"]
    },
    {
        "id": "halo-gtm",
        "title": "Launching a new product category, end-to-end",
        "subtitle": "From positioning to first ten reference customers in under six months.",
        "category": "gtm-strategy",
        "year": "2024",
        "cover_image": "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1400&q=80",
        "client": "Halo (Stealth Fintech)",
        "summary": "Designed the GTM, pricing and first 10 design partners for a brand-new product category.",
        "challenge": "Halo was about to launch a category-defining product with no comparable competitors, no pricing benchmark and a founding team that had never sold to CFOs.",
        "approach": [
            "Ran 41 customer discovery interviews to triangulate a defensible category narrative and ICP.",
            "Designed a tiered, outcome-based pricing model validated in willingness-to-pay tests.",
            "Personally recruited 10 design partners across mid-market and enterprise."
        ],
        "outcomes": [
            "$3.4M in committed ARR from design partners at launch.",
            "Category name and positioning adopted by two top-tier industry analysts.",
            "60% of design partners converted to full contracts within 90 days."
        ],
        "metrics": [
            {"label": "Design partners", "value": "10"},
            {"label": "Launch ARR", "value": "$3.4M"},
            {"label": "Conversion", "value": "60%"}
        ],
        "tags": ["Launch", "Positioning", "Pricing"]
    },
    {
        "id": "atlas-alliance",
        "title": "A category-defining alliance with a hyperscaler",
        "subtitle": "Negotiated a co-sell and marketplace deal with a top-three cloud provider.",
        "category": "strategic-partnerships",
        "year": "2024",
        "cover_image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
        "client": "Atlas Data (growth-stage)",
        "summary": "Closed a multi-year strategic alliance unlocking marketplace distribution and co-sell.",
        "challenge": "Atlas needed enterprise distribution but lacked the brand to land it. The window to sign a strategic alliance with a hyperscaler was closing as competitors negotiated their own.",
        "approach": [
            "Built a joint value hypothesis with a specific revenue commit for both parties.",
            "Engineered a 7-step executive sponsorship plan reaching the partner's GM in 5 weeks.",
            "Negotiated a marketplace listing with private offer support and a co-sell incentive."
        ],
        "outcomes": [
            "Multi-year alliance with $9M of joint pipeline in quarter one.",
            "Atlas listed as a launch partner at the hyperscaler's flagship conference.",
            "Co-sell motion reduced average sales cycle by 28%."
        ],
        "metrics": [
            {"label": "Joint pipeline (Q1)", "value": "$9M"},
            {"label": "Sales cycle", "value": "−28%"},
            {"label": "Alliance length", "value": "3 yrs"}
        ],
        "tags": ["Alliance", "Marketplace", "Co-sell"]
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
