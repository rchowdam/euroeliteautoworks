#!/usr/bin/env bash
# Deploy from this computer: build the landing page, pack API + page into one zip,
# upload it to the Lambda, clear the CloudFront cache, then check /health.
#
#   aws login                      # once per session (region ap-southeast-2)
#   code/deploy/deploy.sh          # from the repo root (or any folder)
#
# Also update the Lambda's environment variables from code/deploy/lambda.env:
#   code/deploy/deploy.sh --env
set -euo pipefail

FUNCTION="${LAMBDA_FUNCTION:-euroeliteautoworks}"
DISTRIBUTION="${CLOUDFRONT_DISTRIBUTION:-E1VM6S0IRRR800}"   # CloudFront in front of the Lambda URL
export AWS_REGION="${AWS_REGION:-ap-southeast-2}"
CODE="$(cd "$(dirname "$0")/.." && pwd)"   # the code/ folder
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT

echo "==> Checking AWS login"
aws sts get-caller-identity --query Account --output text

echo "==> Building landing page"
(cd "$CODE/frontend" && npm ci --silent && npm run build --silent)

echo "==> Packing Lambda zip (arm64, Python 3.12)"
# Runtime packages only (no web server, no test tools); boto3 is built into Lambda.
grep -vE '^(uvicorn|pytest|httpx|boto3)' "$CODE/backend/requirements.txt" > "$BUILD/requirements.txt"
"$CODE/backend/.venv/bin/pip" install -q -r "$BUILD/requirements.txt" --target "$BUILD/pkg" \
  --platform manylinux2014_aarch64 --implementation cp --python-version 3.12 --only-binary=:all:
cp -r "$CODE/backend/app" "$BUILD/pkg/"
cp -r "$CODE/frontend/dist" "$BUILD/pkg/site"
(cd "$BUILD/pkg" && find . -name __pycache__ -prune -exec rm -rf {} + && zip -qr "$BUILD/app.zip" .)
ls -lh "$BUILD/app.zip" | awk '{print "    zip size: " $5}'
if [[ -n "${ZIP_ONLY:-}" ]]; then cp "$BUILD/app.zip" "$ZIP_ONLY"; echo "Saved $ZIP_ONLY"; exit 0; fi

if [[ "${1:-}" == "--env" ]]; then
  echo "==> Updating environment variables from lambda.env"
  python3 - "$CODE/deploy/lambda.env" > "$BUILD/env.json" <<'PY'
import json, sys
env = {}
for line in open(sys.argv[1]):
    line = line.strip()
    if line and not line.startswith("#"):
        key, value = line.split("=", 1)
        env[key] = value
print(json.dumps({"Variables": env}))
PY
  aws lambda wait function-updated-v2 --function-name "$FUNCTION"
  aws lambda update-function-configuration --function-name "$FUNCTION" \
    --environment "file://$BUILD/env.json" --query LastModified --output text
  aws lambda wait function-updated-v2 --function-name "$FUNCTION"
fi

echo "==> Uploading to Lambda '$FUNCTION'"
aws lambda wait function-updated-v2 --function-name "$FUNCTION"
aws lambda update-function-code --function-name "$FUNCTION" \
  --zip-file "fileb://$BUILD/app.zip" --architectures arm64 --query LastModified --output text
aws lambda wait function-updated-v2 --function-name "$FUNCTION"

if [[ -n "$DISTRIBUTION" ]]; then
  echo "==> Clearing the CloudFront cache"
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" --paths "/*" \
    --query Invalidation.Id --output text
  URL="https://$(aws cloudfront get-distribution --id "$DISTRIBUTION" --query Distribution.DomainName --output text)"
else
  URL="$(aws lambda get-function-url-config --function-name "$FUNCTION" --query FunctionUrl --output text)"
  URL="${URL%/}"
fi

echo "==> Checking the live site (first call may take ~30 s while the database wakes up)"
for _ in 1 2 3 4 5 6; do
  if curl -fsS -m 70 "$URL/health"; then
    echo; echo "Live: $URL   (office: $URL/admin)"; exit 0
  fi
  sleep 10
done
echo "Health check failed: $URL/health  (see Lambda → Monitor → CloudWatch logs)"; exit 1
