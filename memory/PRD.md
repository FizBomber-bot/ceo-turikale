# Andry Ridwan — Senior BD Portfolio

## Problem Statement
Professional, interactive portfolio for a senior Business Development specialist with work gallery, category filters, contact form, CV download — plus a self-serve admin panel.

## User Identity (live)
- Name: Andry Ridwan
- Title: Business Development & SME Growth Mentor
- Location: Maros · South Sulawesi, Indonesia
- Email: ndriyconnect@gmail.com  ·  Phone: +62 823 4657 3790
- Instagram: @andry_ridwan  ·  Company: turikaleprint.space  ·  Google Maps: live
- Programmes & partners (marquee): Kemenkop RI, Ministry of Manpower, Kominfo, Google Gapura Digital, Bukalapak, GrabFood, Bank Indonesia (Bootcamp), NextDev Academy by Telkomsel (Bootcamp), AIDU EdTech (Co-founded), Turikale Print (Owner)

## Architecture
- **Backend** (FastAPI + MongoDB): MongoDB-backed profile + 7 case studies (seeded on startup, idempotent). Auth via JWT in httpOnly cookies (secure + samesite=none). Bcrypt password hashing. Brute-force lockout keyed on email (defends against rotating ingress IPs) with per-IP defense-in-depth.
- **Frontend** (React + Tailwind + shadcn/ui + lenis + react-query): editorial luxury-minimal single-page portfolio at `/`. Admin SPA at `/admin/login` and `/admin` (protected).
- **Uploads** mounted at `/api/uploads/*` (StaticFiles). CV PDF served at `/api/cv`.

## Public Endpoints (unchanged contract)
GET /api/profile · /api/categories · /api/case-studies?category= · /api/case-studies/{id} · /api/cv · POST /api/contact

## Admin Endpoints (cookie auth)
POST /api/auth/login · POST /api/auth/logout · GET /api/auth/me · POST /api/auth/refresh
GET/PUT /api/admin/profile
GET/POST /api/admin/case-studies · PUT/DELETE /api/admin/case-studies/{id}
POST /api/admin/upload/image (multipart) · POST /api/admin/upload/cv (multipart)
GET/DELETE /api/admin/contacts[/{id}]

## Admin Dashboard (`/admin`)
Four tabs:
1. Photos & CV — hero portrait upload, CV PDF upload, per-case-study cover image upload
2. Profile — name/title/location/email/phone/socials/intro, bio paragraphs, headline stats
3. Case Studies — list/edit/create/delete; full field editor (title, subtitle, summary, challenge, approach[], outcomes[], metrics[], tags[], year, client, category, sort_order, cover_image)
4. Messages — inbound contact submissions with delete

## Tests
- /app/backend/tests/test_portfolio_api.py — 28 tests, 28/28 passing after lockout fix
- /app/test_reports/iteration_2.json — full report

## Backlog / Next
- P1: Email notifications on new contact submission (Resend / SendGrid)
- P1: Admin editing for Services / Experience / Testimonials (still defaults in data/site.js)
- P2: Per-case-study deep-link URLs (/work/:id) + SEO meta
- P2: Password change UI for admin (currently env-driven)
- P2: Analytics + lead-source capture on contact form
