#!/usr/bin/env bash
# Run on the deployment host from any working directory. No git pull or sudo.
set -euo pipefail
cd "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

for tool in node npm pm2; do
  command -v "$tool" >/dev/null 2>&1 || { echo "Missing prerequisite: $tool" >&2; exit 1; }
done
[[ -f package-lock.json ]] || { echo 'package-lock.json is required.' >&2; exit 1; }
export PM2_APP_NAME="${PM2_APP_NAME:-manuel-portfolio}"
export PORT="${PORT:-3000}"
export HOSTNAME="${BIND_HOST:-127.0.0.1}"
export NEXT_DIST_DIR=.next-production
if [[ ! "$PM2_APP_NAME" =~ ^[a-zA-Z0-9_-]+$ ]] || [[ ! "$PORT" =~ ^[0-9]+$ ]] || (( 10#$PORT < 1 || 10#$PORT > 65535 )); then
  echo 'Invalid PM2_APP_NAME or PORT.' >&2
  exit 1
fi

# Stop first: npm ci and the build modify files used by the running server.
# A failed install/build intentionally leaves it stopped; fix and rerun.
if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 stop "$PM2_APP_NAME"
fi
trap 'echo "Deployment failed. The app may be stopped; fix the error and rerun scripts/deploy.sh." >&2' ERR
npm ci --include=dev
NODE_ENV=production npm run build
NODE_ENV=production pm2 startOrRestart scripts/ecosystem.config.cjs --only "$PM2_APP_NAME" --update-env
pm2 save
printf 'Deployment complete: %s on http://%s:%s\n' "$PM2_APP_NAME" "$HOSTNAME" "$PORT"
