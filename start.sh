#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$ROOT_DIR/apps/web-nextjs"

echo "→ Installing dependencies"
cd "$APP_DIR"
npm ci

echo "→ Building Next.js application"
npm run build

PORT="${PORT:-3000}"
echo "→ Starting Next.js on port ${PORT}"
npm run start -- --hostname 0.0.0.0 --port "${PORT}"

