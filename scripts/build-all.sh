#!/usr/bin/env bash
# Builds both targets side by side (dist-public/ and dist-preview/) for local comparison and QA.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/sync-assets.mjs
node scripts/validate-content.mjs
# A clean checkout has no generated OG images. Both build targets reference the
# same public-only image set, which must be created before link checks run.
node scripts/og/generate.mjs
HWP_TARGET=public npx astro build --outDir dist-public && HWP_TARGET=public node scripts/check-build.mjs dist-public
HWP_TARGET=preview npx astro build --outDir dist-preview && HWP_TARGET=preview node scripts/check-build.mjs dist-preview
