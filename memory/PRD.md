# Andry Ridwan Portfolio — PRD

## Original Problem Statement
> Continue building my website from GitHub; focus on the admin page. Make the testimonial/endorsement section editable by the admin.

Source code pulled from `https://github.com/FizBomber-bot/Porto-Biz-Dev.git`. The empty repo at `BizDevPortoAndry` was a red herring; the actual code lives in `Porto-Biz-Dev`.

## Stack & Architecture
- **Backend**: FastAPI + Motor (MongoDB) — bilingual content, cookie-based JWT (httpOnly access + refresh), bcrypt, brute-force lockout, image/CV uploads.
- **Frontend**: React 19 + Tailwind + react-query + sonner + lucide-react. Auth via `withCredentials: true` (cookies); no localStorage tokens.
- **Bilingual (EN / ID)** content across profile, case studies, and now testimonials.

## What's Implemented (incremental — 2026-06-12)
### Existing on GitHub (ported in)
- Public site: Hero, ClientMarquee, NowRunning, About, Services, Gallery, Experience, **Testimonials**, Contact, Footer
- Admin dashboard tabs: Photos & CV, Profile, Case Studies, Messages
- Auth: `POST /api/auth/login`, `/logout`, `/me`, `/refresh`
- CV download endpoint, image uploads

### NEW in this session
- **Testimonials are now admin-editable end-to-end**:
  - Backend models `TestimonialBase/Create/Update/Testimonial` with bilingual fields (`quote/quote_id`, `name/name_id`, `role/role_id`, `avatar`, `sort_order`).
  - Public route: `GET /api/testimonials` (sorted by `sort_order`).
  - Admin routes: `GET/POST/PUT/DELETE /api/admin/testimonials(/{id})`.
  - Startup seed of 3 bilingual testimonials only when the collection is empty.
  - Mongo index on `testimonials.id`.
- **Admin UI**: new "Testimonials" tab in `AdminDashboard.jsx` with list cards, full bilingual form dialog (EN + ID for quote/name/role), avatar URL + upload, sort_order, delete confirmation modal.
- **Public Testimonials component** now fetches from `GET /api/testimonials` and falls back to the static `@/data/site` array. Avatar frame doubled from `h-14 w-14` (56 px) to `h-28 w-28` (**112 px** — the user-requested 2× size). Verified via bounding box in the testing agent.

## Test Results (iteration_4)
- Backend: **16/16 PASS** — `/app/backend/tests/test_testimonials.py` covers auth, public list, admin CRUD, 401 guards, 404 paths, regression.
- Frontend: **12/12 PASS** — public site, 112 × 112 avatar assertion, carousel cycling, full admin login → tab → create → edit → delete → logout.

## Test Credentials
- Email: `admin@example.com`
- Password: `admin123`
(seeded from `/app/backend/.env`; documented in `/app/memory/test_credentials.md`).

## Known / Backlog
- **P2 (non-blocking)**: A few components (Hero portrait, case study cover image, etc.) render `<img src={maybeEmpty} />` unconditionally, producing an `An empty string ('') was passed to the src attribute` warning when content is missing. Pre-existing in the imported repo; not introduced by this session's work.
- **P2**: Older test files (`test_portfolio_api.py`, `test_bilingual.py`) reference an obsolete admin credential pair (`ndriyconnect@gmail.com / TurikalePrint2026!`) from a different deployment. Update their constants before reusing them.
- **P3**: Two harmless 401 console errors on first paint of `/admin/login` come from the `/api/auth/me` probe — could be silenced by skipping the probe on the login route.

## File Map (key edits this session)
- `/app/backend/server.py` — Testimonial models, default data, startup seed, public + admin routes.
- `/app/frontend/src/lib/api.js` — `fetchTestimonials`, `adminListTestimonials`, `adminCreateTestimonial`, `adminUpdateTestimonial`, `adminDeleteTestimonial`.
- `/app/frontend/src/components/site/Testimonials.jsx` — API-backed, 2× avatar.
- `/app/frontend/src/pages/admin/AdminDashboard.jsx` — new `TestimonialsTab` + `TestimonialFormDialog` + `ConfirmDialog`, tab added to `TABS`.

## Next Action Items
- (Optional) Quick guard on `<img src>` empty strings across imported components.
- (Optional) Auto-translate untouched ID fields when EN is updated, to keep the bilingual UX in sync.
