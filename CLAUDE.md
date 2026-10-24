# Euro Elite Auto Works — project context

Independent **German car specialist** workshop, known for **DSG / dual-clutch transmission** repair.
Makes: Volkswagen, Audi, Škoda, Porsche, BMW, Mercedes-Benz, MINI. This repo holds the business notes
and the software. Read this file first in every session.

Sister project with the same stack and conventions: `../stream_car_wash/` (Steam Car Wash Pro). Copy
patterns from there (logins, team portal, PWA, AWS Lambda deploy) when this project needs them.

## Folder rules

```
euro_elite_auto_works/
├── CLAUDE.md          # this file
├── business_plan/     # requirements & business docs (non-technical, Markdown)
└── code/              # all technical work
    ├── backend/       # FastAPI API, also serves the built landing page at /
    └── frontend/      # React landing page
```

## Stack (same as Steam Car Wash Pro)

- **Backend** `code/backend/`: FastAPI + SQLModel + SQLite, Python 3.9 venv in `.venv`
  (system Python is 3.9 → use `Optional[...]`, not `X | None`). Details in `code/backend/README.md`.
- **Frontend** `code/frontend/`: React 18 + Vite 5, plain JavaScript and plain CSS, no UI library.
  Node is 18.9 on this machine → don't upgrade to Vite 6+ / React Router 7 (need Node 20).
- One process: uvicorn serves `frontend/dist` at `/` and the API at `/api` (catch-all route registered
  last in `app/main.py`; unknown `/api/...` → JSON 404).
- Dev: backend on :8000, `npm run dev` on :5173 proxies `/api` to `127.0.0.1:8000` (127.0.0.1 on purpose:
  Node resolves `localhost` to IPv6).
- Write React effects with braces, not one-line arrow returns (crashed the sister project once).

## Landing page (built 2026-10-23)

Sections in order: header → hero (headline + dual-clutch line diagram) → brand strip → 01 DSG
(symptoms, what we do, gearbox table) → 02 services (8 tiles) → 03 how we work → [04 gallery
"Inside the workshop"] → process (5 steps) → FAQ → booking form + contact → footer.
The gallery and its "Workshop" menu link only show once something is published from `/admin`;
the numbers of the sections after it are worked out in `App.jsx` (04–06 without it, 05–07 with it).

- **Design: simple, no gradients** (user's request). Flat colours, no shadows, 1px hairlines,
  square corners (2px), numbered sections with a red rule. **Colours follow the logo / business card**
  (2026-10-23): white `#FFFFFF`, paper-2 `#F2F2F2`, ink `#111111`, logo red `#EC1F23` (`--accent`:
  fills, bars, big type, primary buttons `.btn--primary`), deeper red `#C8161B` (`--accent-text`: small
  red text on white, for contrast). Fonts: Oswald (headings; h1/h2 in capitals like the logo), Inter
  (body), IBM Plex Mono (gearbox codes).
- Logo = the user's artwork (original in `business_plan/brand/logo-original.png`):
  `public/logo.png`, `public/logo-inverse.png` (white text, for the dark footer), icons `favicon.png`,
  `apple-touch-icon.png`, `icon-512.png` (the mark on white).
- All copy lives in `src/content.js`; business details in `src/config.js` (empty values are hidden).
  From the business card: **Chandu 93919 41493, Arun 94898 40206** (`contacts`), address
  "Huda Layout, Nallagandla, Hyderabad, Telangana", Google Maps link + pin (map embedded next to the
  booking form). WhatsApp = **Arun's number** (`919489840206`). Email, hours and warranty are
  **empty until the user supplies them**.
- Booking form POSTs to `/api/public/enquiries`; if `CONFIG.whatsapp` is set it also opens WhatsApp
  with the details filled in.
- Brands are text only (no manufacturer logos); footer has an "independent, not affiliated" line.
- Content reference: https://metrepersecond.com (Hyderabad luxury-car workshop). Took the structure
  (DSG/gearbox focus, symptoms, trust points, FAQ, WhatsApp booking). **Did not copy** their ratings,
  counts, "#1"/"30–50% cheaper" claims or testimonials: do not add numbers, statistics, reviews or
  named dealer tools unless the user gives real ones.
- Responsive breakpoints 1024 / 900 / 640 px; gearbox table stacks into rows on phones;
  inputs are 16px on touch (no iOS zoom). Checked at 1440px and 390px: no sideways scroll.

## Backend (built 2026-10-23)

- Table `enquiry` (name, phone, email, car brand/model/year, service, message, preferred date,
  status new → contacted → booked → closed, created_at).
- Public: `POST /api/public/enquiries`. Office: `GET /api/enquiries`, `PATCH /api/enquiries/{id}`
  behind header `X-Admin-Key` = env `ADMIN_KEY` (empty → 503). A stop-gap until real logins
  (copy JWT + roles from the sister project when a team portal is needed).
- Gallery (2026-10-23): table `media` (key `media/<uuid>.<ext>`, kind photo/video, caption, published).
  Office page **`/admin`** (`src/admin/Admin.jsx`, lazy-loaded; sign in with `ADMIN_KEY`, kept in
  sessionStorage) uploads photos (JPG/PNG/WebP ≤15 MB) and videos (MP4/WebM/MOV ≤300 MB), edits
  captions, hides/shows and deletes. `app/storage.py`: with `S3_BUCKET` set the browser uploads
  **straight to S3** with a signed form (big videos never pass through the API, so it also works on
  Lambda), the bucket stays private and `/media/<name>` redirects to a 1-hour signed link. Without
  it files go to `code/backend/uploads/` (git-ignored). Bucket CORS + IAM steps: backend README.
- Tests: `cd code/backend && .venv/bin/python -m pytest -q` (12 tests, all passing).

## Open questions (ask the user; do not assume)

1. Opening hours, email.
   The business card also shows Hyundai and Mahindra logos: add them to the makes or not?
2. Warranty terms; pickup & drop service and area.
3. Prices (diagnosis fee, DSG oil service, clutch, mechatronic) — show on the site or not?
4. Real photos of workshop / team / work (upload them at `/admin`).
5. Bare `euroeliteautoworks.in` → forward to www in OVI's panel (user to do / confirm).
6. Next software: admin page for enquiries, job cards, customer database?

## AWS (live since 2026-10-23)

**https://www.euroeliteautoworks.in** (office `/admin`; also https://d1rlybstyzla4q.cloudfront.net).
Domain bought at OVI Hosting, DNS in their panel; ACM certificate in us-east-1 (details and DNS records
in `code/deploy/README.md`). Sydney `ap-southeast-2`, account 659791935879.
Lambda `euroeliteautoworks` (Python 3.12 arm64, role `PowerUserRole`, public function URL) behind
CloudFront `E1VM6S0IRRR800`; bucket `euroeliteautoworks-media` (private, CORS for the site + localhost);
database `euroeliteautoworks` **inside Steam Car Wash Pro's Aurora cluster** `database-steamcarwashpro`
(user's choice: shared server, own database; IAM login). Deploy: `code/deploy/deploy.sh [--env]`;
secrets in `code/deploy/lambda.env` (git-ignored, has the live `ADMIN_KEY`). Guide: `code/deploy/README.md`.
Local `.venv` boto3 can't use `aws login` credentials (needs botocore[crt]): use the aws CLI for tokens.

## Decision log

- 2026-10-23 — Project created. Same stack as Steam Car Wash Pro (FastAPI + React/Vite).
  Landing page built in React (not plain HTML) because the user asked for "python, react".
  Git repo initialised locally, nothing committed, no remote yet.
- 2026-10-23 — Gallery of photos and videos + `/admin` upload page. S3 via browser-direct signed
  uploads, local folder as fallback (same storage idea as the sister project's job photos).
- 2026-10-23 — Logo, colours (white / black / logo red) and contacts from the business card;
  WhatsApp = Arun. Deployed to AWS like the sister project; database shares its Aurora cluster.
