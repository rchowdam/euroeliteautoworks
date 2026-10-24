# Backend — FastAPI

Stores booking enquiries and the photo / video gallery, and serves the built landing page at `/`
(and the office page at `/admin`).
FastAPI + SQLModel + SQLite. Python 3.9+ (use `Optional[...]`, not `X | None`).

## Run

```bash
cd code/backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env          # set ADMIN_KEY
.venv/bin/uvicorn app.main:app --reload --env-file .env
```

- http://localhost:8000 → landing page (after `npm run build` in `code/frontend`)
- http://localhost:8000/admin → office page: upload gallery photos and videos (sign in with `ADMIN_KEY`)
- http://localhost:8000/docs → API docs

## Endpoints

| Method | Path | Access | What |
|---|---|---|---|
| GET | `/health` | public | `{"status": "ok"}` |
| POST | `/api/public/enquiries` | public | Booking form → new enquiry (201) |
| GET | `/api/enquiries?status=new` | `X-Admin-Key` | List enquiries, newest first |
| PATCH | `/api/enquiries/{id}` | `X-Admin-Key` | `{"status": "contacted"}` (new / contacted / booked / closed) |
| GET | `/api/public/media` | public | Published gallery photos and videos, newest first |
| GET | `/media/{name}` | public | The file itself (local file, or redirect to a signed S3 link) |
| POST | `/api/media/uploads` | `X-Admin-Key` | `{"content_type", "size"}` → where to upload: `{key, url, fields}` |
| POST | `/api/media/local-upload` | `X-Admin-Key` | Form `key` + `file`; only when there is no S3 bucket |
| POST | `/api/media` | `X-Admin-Key` | `{"key", "caption"?, "published"?}` after the upload → adds it to the gallery |
| GET | `/api/media` | `X-Admin-Key` | All photos and videos, hidden ones too |
| PATCH | `/api/media/{id}` | `X-Admin-Key` | `{"caption"?, "published"?}` |
| DELETE | `/api/media/{id}` | `X-Admin-Key` | Removes the row and the file |

```bash
curl -H "X-Admin-Key: $ADMIN_KEY" http://localhost:8000/api/enquiries
```

## Photos & videos in S3

Without `S3_BUCKET` uploads are saved in `UPLOAD_DIR` (`./uploads`), which is what local development uses.
With it, the browser uploads **straight to S3** using a signed form from `POST /api/media/uploads`
(15 minutes valid, type and size limits built in), so large videos never pass through the API.
The bucket stays **private**: `/media/<name>` answers with a 1-hour signed link.

1. Create the bucket (Block all public access: **on**). Files go under `media/`.
2. Bucket → Permissions → **CORS** (put in the real site address; keep localhost for testing):
   ```json
   [{
     "AllowedOrigins": ["https://YOUR-DOMAIN", "http://localhost:5173", "http://127.0.0.1:5173"],
     "AllowedMethods": ["POST"],
     "AllowedHeaders": ["*"],
     "MaxAgeSeconds": 3000
   }]
   ```
3. The AWS user or role the API runs as needs:
   ```json
   {
     "Effect": "Allow",
     "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
     "Resource": "arn:aws:s3:::YOUR-BUCKET/media/*"
   }
   ```
4. In `.env`: `S3_BUCKET=YOUR-BUCKET`, `AWS_REGION=...`, plus credentials
   (`AWS_PROFILE=...`, or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`; on Lambda the role is used).

Switching from local files to S3 doesn't copy the files in `./uploads`: upload those again from `/admin`.

## Tests

```bash
.venv/bin/python -m pytest -q
```
