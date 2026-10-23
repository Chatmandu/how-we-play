#!/usr/bin/env bash
# Negative tests for the publishing gate, run against real builds in a throwaway copy of the repo.
#  1. A hard-coded link from a public page to the draft Moving Up guide must FAIL the public build.
#  2. Unreviewed content pasted into a public page must FAIL the public build.
#  3. Already-reviewed 3-1-3-1 must publish; draft Moving Up must stay out.
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

# 1. Link to an unpublished draft guide (3-3-2 is now approved and public)
fresh
grep -q '<h1 id="cover-h"' "$TMP/site/src/pages/index.astro" || { echo "FAIL  injection anchor missing from homepage; update this test"; exit 1; }
sed -i 's|<h1 id="cover-h"|<a href="/moving-up/">Leak</a><h1 id="cover-h"|' "$TMP/site/src/pages/index.astro"
if build_public; then bad "public build with a link to a draft guide should fail"; else grep -q "broken reference /moving-up/" "$TMP/check.log" && ok "public build fails on a link to a draft guide" || bad "failed, but not for the expected reason"; fi

# 2. Unreviewed status chip or private strip on a public page
fresh
sed -i 's|<h1 id="cover-h"|<span class="hwp-chip hwp-chip--review">Coaching review required</span><h1 id="cover-h"|' "$TMP/site/src/pages/index.astro"
if build_public; then bad "public build containing unreviewed-content markers should fail"; else grep -q "private, unreviewed, exploratory or demo content" "$TMP/check.log" && ok "public build fails when unreviewed content is pasted into a public page" || bad "failed, but not for the expected reason"; fi

# 3. An approved formation publishes; the unpublished Moving Up guide stays out
fresh
if build_public && [ -f "$TMP/site/dist/formations/9v9/3-1-3-1/one-goes-one-stays/index.html" ] && [ ! -e "$TMP/site/dist/moving-up" ]; then ok "reviewed formation publishes its guide and lessons; draft guide stays out"; else bad "reviewed formation did not publish cleanly"; tail -20 "$TMP/check.log"; fi

# 4. Changing coaching content after review sends it back to review (no stale approval reaches public)
fresh
(cd "$TMP/site" && node scripts/review.mjs record --id 9v9-3-1-3-1 --by "Test Reviewer" --on 2026-10-20 --decision approved --evidence "test fixture" >/dev/null)
node -e 'const fs=require("fs"),p=process.argv[1]+"/content/formations/9v9/3-1-3-1.json";const j=JSON.parse(fs.readFileSync(p));j.rules[1].cue="Changed after review";fs.writeFileSync(p,JSON.stringify(j,null,2));' "$TMP/site"
if build_public; then
  if [ ! -e "$TMP/site/dist/formations/9v9/3-1-3-1" ]; then ok "content changed after review is not published"; else bad "a stale review still published the 3-1-3-1"; fi
elif grep -q 'blocked 9v9-3-1-3-1' "$TMP/check.log" && grep -q 'homepage must feature 3-1-3-1' "$TMP/check.log"; then
  ok "a stale review blocks the public build"
else
  bad "a content change failed the build for an unrelated reason"; tail -20 "$TMP/check.log"
fi

# 5. Reviewer profile and reproduced playbook pages stay out of public until confirmed
fresh
node -e 'const fs=require("fs"),p=process.argv[1]+"/content/register.json";const r=JSON.parse(fs.readFileSync(p));r.filter(x=>x.kind==="confirmation").forEach(x=>Object.assign(x.confirmation,{status:"awaiting",confirmedBy:null,confirmedOn:null}));fs.writeFileSync(p,JSON.stringify(r,null,2));' "$TMP/site"
if build_public; then
  if ! grep -q "David Wilson" "$TMP/site/dist/about/index.html" && [ ! -e "$TMP/site/dist/about/playbook-cover.jpg" ]; then ok "unconfirmed reviewer profile and playbook pages are absent from public"; else bad "unconfirmed profile or playbook pages reached the public build"; fi
elif grep -q 'blocked profile-david-wilson' "$TMP/check.log" && grep -q 'in-page link #reviewer has no target' "$TMP/check.log" && ! grep -q "David Wilson" "$TMP/site/dist/about/index.html" && [ ! -e "$TMP/site/dist/about/playbook-cover.jpg" ]; then
  ok "an unconfirmed reviewer is removed and any broken page links block deployment"
else
  bad "unconfirmed reviewer or playbook was not safely blocked"; tail -20 "$TMP/check.log"
fi

echo "$pass/$((pass+fail)) passed"
exit $fail
