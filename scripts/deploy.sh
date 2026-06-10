#!/usr/bin/env bash
# Deploy script for pdfwox.com (Contabo / Next.js + PM2)
#
# Problem this solves:
#   After a fresh `next build`, the /_next/static/ directory only contains
#   chunks for the NEW build. Any HTML page that a browser or crawler cached
#   from the PREVIOUS build still references old chunk hashes — those chunks
#   are now gone, causing 404 / 500 errors for JS assets.
#
# Fix:
#   Before replacing the running build, copy the old static chunks into the
#   new build's static directory so old HTML pages keep finding their chunks.
#   Next.js uses content-addressed filenames, so there is zero conflict between
#   old and new chunks sharing the same directory.
#
# Usage (run from the repo root on the server):
#   bash scripts/deploy.sh
#
# Requires: node, pnpm, pm2

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PM2_APP_NAME="${PM2_APP_NAME:-pdfwox}"

cd "$APP_DIR"
echo "▶ deploying from $APP_DIR"

# ── 1. Pull latest code ───────────────────────────────────────────────────────
echo "▶ pulling latest code"
git pull --ff-only

# ── 2. Install dependencies ───────────────────────────────────────────────────
echo "▶ installing dependencies"
pnpm install --frozen-lockfile

# ── 3. Preserve old static chunks before rebuilding ──────────────────────────
OLD_STATIC="$APP_DIR/.next/static"
SAVED_CHUNKS="$APP_DIR/.next_old_static_chunks"

if [ -d "$OLD_STATIC" ]; then
  echo "▶ saving old static chunks to $SAVED_CHUNKS"
  rm -rf "$SAVED_CHUNKS"
  cp -r "$OLD_STATIC" "$SAVED_CHUNKS"
fi

# ── 4. Build ──────────────────────────────────────────────────────────────────
echo "▶ building"
pnpm build

# ── 5. Merge old chunks into new build ───────────────────────────────────────
if [ -d "$SAVED_CHUNKS" ]; then
  echo "▶ merging old chunks into new build"
  # cp -n = no-clobber: skip files that already exist in the new build
  cp -rn "$SAVED_CHUNKS/." "$APP_DIR/.next/static/"
  rm -rf "$SAVED_CHUNKS"
  echo "▶ merge complete"
fi

# ── 6. Restart app ────────────────────────────────────────────────────────────
echo "▶ restarting pm2 process: $PM2_APP_NAME"
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  echo "▶ pm2 process not found — starting fresh"
  pm2 start pnpm --name "$PM2_APP_NAME" -- start
fi

pm2 save

echo "✓ deploy complete"
