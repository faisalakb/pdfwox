#!/usr/bin/env bash
set -euo pipefail

# Pin the runtime for non-interactive SSH sessions (shell profiles are not read).
export PATH="/home/deploy/.nvm/versions/node/v22.23.1/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
EXPECTED_REPOSITORY="faisalakb/pdfwox"
APP_DIRECTORY="/home/deploy/pdfwox"
DEPLOY_SHA="${2:-}"
if [[ "${1:-}" != "$EXPECTED_REPOSITORY" ]]; then
  echo "Refusing deployment: this script only accepts $EXPECTED_REPOSITORY" >&2
  exit 64
fi
if [[ ! "$DEPLOY_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "A full GitHub commit SHA is required as the second argument" >&2
  exit 64
fi
cd "$APP_DIRECTORY"
case "$(git remote get-url origin)" in
  *:faisalakb/pdfwox.git|*/faisalakb/pdfwox.git|*/faisalakb/pdfwox) ;;
  *) echo "Refusing deployment: checkout origin does not match $EXPECTED_REPOSITORY" >&2; exit 64 ;;
esac
command -v node >/dev/null
command -v npm >/dev/null
command -v pm2 >/dev/null
command -v flock >/dev/null
if [[ "${3:-}" == "--check" ]]; then
  echo "OK: $EXPECTED_REPOSITORY -> $APP_DIRECTORY (node $(node --version))"
  exit 0
fi
# GitHub concurrency is per repository. This lock also serializes builds across sites.
mkdir -p /home/deploy/.deployment-locks
exec 9>/home/deploy/.deployment-locks/contabo-build.lock
flock -w 2700 9
# Recheck main after waiting: an older queued run must never overwrite a newer release.
git fetch origin main
if [[ "$(git rev-parse origin/main)" != "$DEPLOY_SHA" ]]; then
  echo "Skipping superseded commit $DEPLOY_SHA; main has advanced."
  exit 0
fi

APP_DIR="/home/deploy/pdfwox"
APP_NAME="pdfwox"

echo "=============================="
echo "Starting PDFWox deployment"
echo "=============================="

echo "Node path: $(which node || true)"
echo "NPM path: $(which npm || true)"
echo "PNPM path: $(which pnpm || true)"
echo "Node version: $(node -v || true)"
echo "NPM version: $(npm -v || true)"
echo "PNPM version: $(pnpm -v || true)"

cd "$APP_DIR"

echo "Fetching latest code..."
test "$(git rev-parse origin/main)" = "$DEPLOY_SHA"

echo "Resetting to latest main..."
git reset --hard "$DEPLOY_SHA"

echo "Installing dependencies with pnpm..."
pnpm install --no-strict-peer-dependencies

echo "Building app..."
pnpm run build

echo "Reloading PM2 app..."
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$APP_NAME"
else
  pm2 start ecosystem.config.js --only "$APP_NAME"
fi

echo "Saving PM2 state..."
pm2 save

echo "PDFWox deployment completed successfully."

curl --fail --silent --show-error --retry 5 --retry-connrefused --retry-delay 2 --max-time 20 -o /dev/null http://127.0.0.1:3004/
