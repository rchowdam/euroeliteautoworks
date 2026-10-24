# Deploy on AWS

Same setup as Steam Car Wash Pro (`../stream_car_wash/code/deploy/`), in **Sydney `ap-southeast-2`**:

```
Browser ──► CloudFront ──► Lambda Function URL (euroeliteautoworks)
              ├─ /            landing page   (code/frontend build, packed in the zip as site/)
              ├─ /admin       office page (gallery uploads)
              ├─ /api/...     FastAPI backend
              └─ /media/...   redirect to a signed link ──► S3 bucket euroeliteautoworks-media (private)
            browser ──► S3 directly for uploads (signed form, so big videos skip the Lambda)
            Lambda ──► Aurora Postgres: database "euroeliteautoworks" in Steam Car Wash Pro's
                       cluster database-steamcarwashpro (IAM login, SSL)
```

**Status (2026-10-23): live** at **https://www.euroeliteautoworks.in/** (office: `/admin`), also
https://d1rlybstyzla4q.cloudfront.net/. CloudFront distribution `E1VM6S0IRRR800`; Lambda URL
https://dwoqajg4dgxgz544icraugdjdy0qiqet.lambda-url.ap-southeast-2.on.aws/ (no cache).

## Resources

| What | Name / value |
|---|---|
| Database | `euroeliteautoworks` inside cluster `database-steamcarwashpro` (shared server, own database). Tables are created on the Lambda's first start. |
| S3 bucket | `euroeliteautoworks-media`: Block all public access on, files under `media/` |
| Lambda | `euroeliteautoworks`: Python 3.12, arm64, 1024 MB, 60 s, handler `app.lambda_handler.handler`, role `PowerUserRole` (covers S3 and `rds-db:connect`, like the sister project) |
| Function URL | Auth type NONE (public website) |
| CloudFront | in front of the function URL, see below |
| Settings | `code/deploy/lambda.env` (secrets, not in git): `DATABASE_URL`, `DB_IAM_AUTH`, `S3_BUCKET`, `ADMIN_KEY`, … |

**Shared cluster:** the database server is Steam Car Wash Pro's. Euro Elite has its own database
on it, so the data is separate, but if that cluster is stopped, deleted or busy, both sites are affected.

### CloudFront behaviours

| Path | Cache policy | Methods |
|---|---|---|
| `/api/*` | `CachingDisabled` | all (GET, POST, PATCH, DELETE…) |
| `/media/*`, `/health`, `/admin`, `/docs`, `/openapi.json` | `CachingDisabled` | GET, HEAD |
| everything else (landing page) | `CachingOptimized`; `deploy.sh` clears it after each deploy | GET, HEAD |

The uncached paths use the origin request policy `AllViewerExceptHostHeader` (a Lambda URL rejects any
other Host header); the cached default forwards no viewer headers.

### Domain `euroeliteautoworks.in`

Registered at **OVI Hosting** (2026-10-23); DNS is in OVI's panel (nameservers `*.stableserver.net`).
HTTPS certificate: AWS Certificate Manager in **us-east-1** (CloudFront needs that region),
`arn:aws:acm:us-east-1:659791935879:certificate/ac99c018-c10e-43ba-a8ea-367d6938734b`, covers
`euroeliteautoworks.in` + `www.euroeliteautoworks.in`, renews itself while the records below stay.

| Type | Name | Value | Why |
|---|---|---|---|
| CNAME | `_b9b28b82309beeba8258f71f78df193d` | `_3acb7e0b9153ea71c4e47dec44cd3d06.wzccmgtwzk.acm-validations.aws` | certificate (keep) |
| CNAME | `_fa9636c9201c569ca2e0a09fa67585b7.www` | `_bcea5aa74b230ea9948fc56c771c8d4f.wzccmgtwzk.acm-validations.aws` | certificate (keep) |
| CNAME | `www` | `d1rlybstyzla4q.cloudfront.net` | the site |

The bare `euroeliteautoworks.in` can't be a CNAME at OVI: forward it to `https://www.euroeliteautoworks.in`
in OVI's panel (CloudFront already accepts both names, so moving DNS to Cloudflare later also works).

### S3 CORS

Uploads go from the browser straight to the bucket, so the bucket must allow `POST` from the site's
address. Allowed today: `www.` and bare `euroeliteautoworks.in`, the CloudFront domain, the Lambda URL,
`localhost:5173` and `127.0.0.1:5173` (S3 → bucket → Permissions → CORS).

## Everyday use

```bash
aws login                       # once per session, region ap-southeast-2
code/deploy/deploy.sh           # build + upload code, clear the cache, check /health
code/deploy/deploy.sh --env     # same, and also push code/deploy/lambda.env to the Lambda
```

- Office page: `<site>/admin`, sign in with `ADMIN_KEY` from `lambda.env`.
- Logs: Lambda → `euroeliteautoworks` → Monitor → View CloudWatch logs.
- The first request after ~5 quiet minutes takes up to ~30 s: Aurora wakes up from pause.

## Costs

Lambda, CloudFront and S3 fit in the free tier at this size. No extra Aurora cluster: the shared
one is billed while awake, whichever site woke it.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Forbidden` on the function URL | The resource policy must allow public `lambda:InvokeFunctionUrl` and `lambda:InvokeFunction`. |
| `PAM authentication failed` in logs | The role needs `rds-db:connect` for user `postgres` on the cluster. |
| Upload fails with a CORS / network error | The site's address is missing from the bucket's CORS rule. |
| Photos don't load | `S3_BUCKET` is wrong, or the role is missing `s3:GetObject` on the bucket. |
