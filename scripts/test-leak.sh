#!/usr/bin/env bash
# Negative tests for the publishing gate, run against real builds in a throwaway copy of the repo.
#  1. A hard-coded link from a public page to an unreviewed guide must FAIL the public build.
#  2. Unreviewed content pasted into a public page must FAIL the public build.
#  3. Marking the 3-1-3-1 as reviewed (with reviewer and date) must PUBLISH its guide and lessons.
# Usage: bash scripts/test-leak.sh   (takes about a minute; needs node_modules installed)
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
pass=0; fail=0
ok()  { echo "PASS  $1"; pass=$((pass+1)); }
bad() { echo "FAIL  $1"; fail=$((fail+1)); }

fresh() {
  rm -rf "$TMP/site"; mkdir -p "$TMP/site"
  (cd "$ROOT" && tar --exclude=./dist --exclude=./dist-public --exclude=./dist-preview --exclude=./.git -cf - .) | (cd "$TMP/site" && tar -xf -)
}
build_public() { (cd "$TMP/site" && HWP_TARGET=public npx astro build >/dev/null 2>&1 && HWP_TARGET=public node scripts/check-build.mjs dist >"$TMP/check.log" 2>&1); }

# 1. Link to a blocked guide
fresh
grep -q '<h1 id="cover-h"' "$TMP/site/src/pages/index.astro" || { echo "FAIL  injection anchor missing from homepage; update this test"; exit 1; }
sed -i 's|<h1 id="cover-h"|<a href="/formations/9v9/3-3-2/">Leak</a><h1 id="cover-h"|' "$TMP/site/src/pages/index.astro"
if build_public; then bad "public build with a link to an unreviewed guide should fail"; else grep -q "broken reference /formations/9v9/3-3-2/" "$TMP/check.log" && ok "public build fails on a link to an unreviewed guide" || bad "failed, but not for the expected reason"; fi

# 2. Unreviewed status chip or private strip on a public page
fresh
sed -i 's|<h1 id="cover-h"|<span class="hwp-chip hwp-chip--review">Coaching review required</span><h1 id="cover-h"|' "$TMP/site/src/pages/index.astro"
if build_public; then bad "public build containing unreviewed-content markers should fail"; else grep -q "private, unreviewed, exploratory or demo content" "$TMP/check.log" && ok "public build fails when unreviewed content is pasted into a public page" || bad "failed, but not for the expected reason"; fi

# 3. A reviewed formation is published (recorded through the review tool, for the current content version)
fresh
(cd "$TMP/site" && node scripts/review.mjs record --id 9v9-3-1-3-1 --by "Test Reviewer" --on 2026-10-20 --decision approved --evidence "test fixture" >/dev/null)
if build_public && [ -f "$TMP/site/dist/formations/9v9/3-1-3-1/one-goes-one-stays/index.html" ] && [ ! -e "$TMP/site/dist/formations/9v9/3-3-2" ]; then ok "a reviewed formation publishes its guide and lessons; unreviewed ones stay out"; else bad "reviewed 3-1-3-1 did not publish cleanly"; cat "$TMP/check.log" | tail -20; fi

# 4. Changing coaching content after review sends it back to review (no stale approval reaches public)
fresh
(cd "$TMP/site" && node scripts/review.mjs record --id 9v9-3-1-3-1 --by "Test Reviewer" --on 2026-10-20 --decision approved --evidence "test fixture" >/dev/null)
node -e 'const fs=require("fs"),p=process.argv[1]+"/content/formations/9v9/3-1-3-1.json";const j=JSON.parse(fs.readFileSync(p));j.rules[1].cue="Changed after review";fs.writeFileSync(p,JSON.stringify(j,null,2));' "$TMP/site"
if build_public && [ ! -e "$TMP/site/dist/formations/9v9/3-1-3-1" ]; then ok "content changed after review is not published"; else bad "a stale review still published the 3-1-3-1"; fi

# 5. Reviewer profile and reproduced playbook pages stay out of public until confirmed
fresh
node -e 'const fs=require("fs"),p=process.argv[1]+"/content/register.json";const r=JSON.parse(fs.readFileSync(p));r.filter(x=>x.kind==="confirmation").forEach(x=>Object.assign(x.confirmation,{status:"awaiting",confirmedBy:null,confirmedOn:null}));fs.writeFileSync(p,JSON.stringify(r,null,2));' "$TMP/site"
if build_public && ! grep -q "David Wilson" "$TMP/site/dist/about/index.html" && [ ! -e "$TMP/site/dist/about/playbook-cover.jpg" ]; then ok "unconfirmed reviewer profile and playbook pages are absent from public"; else bad "unconfirmed profile or playbook pages reached the public build"; fi

echo "$pass/$((pass+fail)) passed"
exit $fail
