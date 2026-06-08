# Alex Morgan — Senior BD Portfolio

## Problem Statement
Create a professional and interactive portfolio website for a senior Business Development specialist, complete with work gallery, category filters, a contact form and CV download button.

## User Choices (locked at MVP)
- Subject: placeholder "Alex Morgan, Senior BD Specialist"
- User will supply own gallery projects later; rich BD case-study placeholders shipped meanwhile
- Contact form stores submissions in MongoDB and shows success state (no email)
- User will upload own CV PDF later (placeholder PDF currently served at `/api/cv`)
- Design: editorial / luxury minimal — designer-led decisions

## Architecture
- **Backend**: FastAPI (`/api`) with MongoDB
  - `GET /api/categories` — filter chips with counts
  - `GET /api/case-studies?category=` — case studies (seed data in `server.py`)
  - `GET /api/case-studies/{id}` — single case study
  - `POST /api/contact` — store contact submission
  - `GET /api/contact` — list submissions (admin/debug)
  - `GET /api/cv` — placeholder PDF (replace `backend/static/cv_alex_morgan.pdf`)
- **Frontend**: React + Tailwind + shadcn/ui + lenis smooth scroll
  - Single-page portfolio at `/` with sections: Hero, ClientMarquee, About+Stats, Gallery+Filters, Services, Experience, Testimonials, Contact, Footer
  - Case study details rendered in shadcn `Dialog`
  - Sonner toaster for success/error feedback
  - Cormorant Garamond serif + Manrope sans (Google Fonts)
- Single-page Single-page; routes via react-router

## Implemented (Dec 2025)
- Editorial Hero with portrait + CV/View-Work CTAs and availability tag
- Animated client marquee
- About section with asymmetric stats grid
- Work gallery with 6 seed case studies, masonry-style spans, hover scale
- Category filter row (All / Strategic Partnerships / Enterprise Sales / Market Expansion / Client Success / GTM)
- Rich case-study dialog (challenge, approach, outcomes, metrics, tags)
- Services bento (4 capabilities) with hover dark-card transition
- Experience timeline
- Testimonials carousel with prev/next controls
- Contact form with client + server validation, success state, sonner toast
- CV download button (linked in nav, hero, contact, mobile menu)
- Lenis smooth scrolling, grain overlay, animated underline links
- React Query for data fetching

## Backlog / Next
- P0: Replace placeholder CV at `backend/static/cv_alex_morgan.pdf` with real PDF
- P0: Swap seed case studies for real client work (edit `CASE_STUDIES` in `backend/server.py`)
- P1: Admin/auth + dashboard to manage case studies & view submissions
- P1: Email notifications (Resend) on new contact submission
- P2: Per-case-study deep-link URLs (`/work/:id`) + SEO meta tags
- P2: Analytics / lead source tracking
