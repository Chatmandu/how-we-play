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

# 3. A reviewed formation is published
fresh
node -e '
const fs=require("fs"); const p=process.argv[1];
const set=(file,fn)=>{const j=JSON.parse(fs.readFileSync(file,"utf8")); fn(j); fs.writeFileSync(file, JSON.stringify(j,null,2));};
set(p+"/content/register.json", r=>{const i=r.find(x=>x.id==="9v9-3-1-3-1"); Object.assign(i.content,{status:"reviewed",reviewedBy:"Test Reviewer",reviewedOn:"2026-10-19"});});
set(p+"/content/formations/9v9/3-1-3-1.json", f=>{f.status.content="reviewed"; f.status.reviewedBy="Test Reviewer"; f.status.reviewedOn="2026-10-19";});
' "$TMP/site"
if build_public && [ -f "$TMP/site/dist/formations/9v9/3-1-3-1/one-goes-one-stays/index.html" ] && [ ! -e "$TMP/site/dist/formations/9v9/3-3-2" ]; then ok "a reviewed formation publishes its guide and lessons; unreviewed ones stay out"; else bad "reviewed 3-1-3-1 did not publish cleanly"; cat "$TMP/check.log" | tail -20; fi

echo "$pass/$((pass+fail)) passed"
exit $fail
