"""Browser QA for How We Play (Playwright, Chromium).

Serves nothing itself: start static servers first, for example
    (cd dist-preview && python3 -m http.server 8901) & (cd dist-public && python3 -m http.server 8902) &
then run
    python3 scripts/qa/browser-qa.py --axe path/to/axe.min.js
Writes scripts/qa/results.json and prints a summary. Exit code 1 if any check fails.

Checks: every page at 320/375/768/1024/1440 (no horizontal scroll, one h1, no console errors),
axe-core WCAG 2.0/2.1/2.2 A and AA on every page, keyboard behaviour of diagram tabs, Enlarge and Key
dialogs, mobile navigation, checklist persistence, newsletter demo validation (no network request),
reduced motion, and touch-target sizes at 375px.
"""
import argparse, json, re, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('--preview', default='http://localhost:8901')
ap.add_argument('--public', default='http://localhost:8902')
ap.add_argument('--axe', required=True)
a = ap.parse_args()
AXE = Path(a.axe).read_text()
OUT = Path(__file__).with_name('results.json')

def routes(base_dir):
    root = Path(base_dir)
    rs = []
    for f in sorted(root.rglob('index.html')):
        r = '/' + str(f.relative_to(root).parent).replace('.', '') + '/'
        rs.append(r.replace('//', '/'))
    return rs

repo = Path(__file__).resolve().parents[2]
SETS = {'preview': (a.preview, routes(repo / 'dist-preview')), 'public': (a.public, routes(repo / 'dist-public'))}
WIDTHS = [320, 375, 768, 1024, 1440]
R = {'layout': [], 'axe': {}, 'interactions': [], 'targets': [], 'errors': []}
fails = []

with sync_playwright() as p:
    b = p.chromium.launch()
    # Layout and console errors
    for name, (base, rs) in SETS.items():
        for w in WIDTHS:
            pg = b.new_page(viewport={'width': w, 'height': 900})
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            for r in rs:
                pg.goto(base + r); pg.wait_for_load_state('networkidle')
                ov = pg.evaluate('document.documentElement.scrollWidth - innerWidth')
                h1 = pg.evaluate("document.querySelectorAll('h1').length")
                if ov > 0 or h1 != 1:
                    culprit = pg.evaluate("""(()=>{const W=innerWidth;const o=[];document.querySelectorAll('main *').forEach(e=>{const r=e.getBoundingClientRect();if(r.right>W+1&&!e.closest('.table-scroll,.guide-nav__row'))o.push(e.tagName+'.'+(e.className.baseVal??e.className)+' '+Math.round(r.right))});return o.slice(0,4)})()""")
                    R['layout'].append({'build': name, 'width': w, 'route': r, 'overflow': ov, 'h1': h1, 'culprit': culprit}); fails.append(f'layout {name} {w} {r}')
                if w == 375 and name == 'preview':
                    small = pg.evaluate("""[...document.querySelectorAll('a,button,input,select,summary,[role=tab]')].filter(e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return false;const inline=e.tagName==='A'&&e.closest('p,li,dd,figcaption,.hwp-small,.rule-sources,.hwp-review-note,.source-line,footer small');return !inline&&(r.height<24||r.width<24)}).map(e=>e.tagName+' '+(e.textContent||e.getAttribute('aria-label')||e.name||'').trim().slice(0,40)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height))""")
                    if small: R['targets'].append({'route': r, 'small': small})
            if errs: R['errors'].append({'build': name, 'width': w, 'errors': errs[:5]}); fails.append(f'console {name} {w}')
            pg.close()
    # axe
    for name, (base, rs) in SETS.items():
        pg = b.new_page(viewport={'width': 1024, 'height': 900})
        for r in rs:
            pg.goto(base + r); pg.wait_for_load_state('networkidle'); pg.evaluate(AXE)
            v = pg.evaluate("""axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}).then(r=>r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,where:v.nodes.slice(0,3).map(n=>n.target.join(' ')),why:(v.nodes[0].failureSummary||'').slice(0,200)})))""")
            if v: R['axe'][f'{name}:{r}'] = v; fails.append(f'axe {name} {r}')
        pg.close()
    # Interactions (preview build has every component)
    I = R['interactions']
    def check(name, cond, detail=None):
        I.append({'check': name, 'pass': bool(cond), 'detail': detail})
        if not cond: fails.append('interaction ' + name)
    pg = b.new_page(viewport={'width': 375, 'height': 800})
    base = a.preview
    pg.goto(base + '/formations/9v9/3-1-3-1/one-goes-one-stays/'); pg.wait_for_load_state('networkidle')
    pg.keyboard.press('Tab'); check('first Tab reaches the skip link', 'Skip' in pg.evaluate('document.activeElement.textContent'))
    pg.keyboard.press('Enter'); check('skip link moves focus to main', pg.evaluate("location.hash==='#main' || document.activeElement.id==='main'"))
    tabs = pg.locator('figure[data-hwp="figure"] [role=tab]')
    tabs.first.focus(); pg.keyboard.press('ArrowRight')
    sel = pg.evaluate("[...document.querySelectorAll('figure[data-hwp=figure] [role=tab]')].map(t=>t.getAttribute('aria-selected'))")
    check('ArrowRight selects the next diagram tab', sel[:3] == ['false', 'true', 'false'], sel)
    check('focus follows the selected tab', pg.evaluate("document.activeElement.getAttribute('aria-selected')") == 'true')
    pg.keyboard.press('End'); check('End selects the last tab', pg.evaluate("[...document.querySelectorAll('figure[data-hwp=figure] [role=tab]')].pop().getAttribute('aria-selected')") == 'true')
    pg.keyboard.press('Home'); check('Home selects the first tab', pg.evaluate("document.querySelector('figure[data-hwp=figure] [role=tab]').getAttribute('aria-selected')") == 'true')
    vis = pg.evaluate("[...document.querySelectorAll('figure[data-hwp=figure] .hwp-tabpanel')].map(p=>!p.hidden)")
    check('only the selected panel is visible', vis.count(True) == 1, vis)
    pg.keyboard.press('ArrowRight')
    pg.locator('figure[data-hwp="figure"] [data-hwp="enlarge"]').first.click(); pg.wait_for_timeout(150)
    check('Enlarge opens a modal dialog', pg.evaluate("!!document.querySelector('dialog.hwp-dialog[open]')"))
    check('Enlarge opens on the selected view', 'Ball left' in pg.evaluate("document.querySelector('dialog.hwp-dialog [data-r=title]').textContent"), pg.evaluate("document.querySelector('dialog.hwp-dialog [data-r=title]').textContent"))
    check('focus starts on Close', pg.evaluate("document.activeElement.textContent.trim()") == 'Close')
    check('caption is shown in the enlarged view', len(pg.evaluate("document.querySelector('dialog.hwp-dialog [data-r=cap]').textContent")) > 5)
    check('enlarged diagram has title and description', pg.evaluate("!!document.querySelector('dialog.hwp-dialog svg title') && !!document.querySelector('dialog.hwp-dialog svg desc').textContent"))
    for _ in range(12): pg.keyboard.press('Tab')
    check('Tab stays inside the dialog', pg.evaluate("!!document.activeElement.closest('dialog')"))
    pg.locator('dialog.hwp-dialog [data-r=next]').click()
    check('Next in the dialog moves to the next view and syncs the page tabs', 'Never both' in pg.evaluate("document.querySelector('dialog.hwp-dialog [data-r=title]').textContent") and pg.evaluate("[...document.querySelectorAll('figure[data-hwp=figure] [role=tab]')][2].getAttribute('aria-selected')") == 'true')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
    check('Escape closes the dialog', not pg.evaluate("!!document.querySelector('dialog.hwp-dialog[open]')"))
    check('focus returns to the page after closing', pg.evaluate("document.activeElement && document.activeElement !== document.body"), pg.evaluate("document.activeElement.outerHTML.slice(0,80)"))
    pg.locator('figure[data-hwp="figure"] [data-hwp="key"]').first.click(); pg.wait_for_timeout(100)
    keys = pg.evaluate("[...document.querySelectorAll('dialog.hwp-sheet li span')].map(s=>s.textContent)")
    check('Key lists only symbols in the current frame', len(keys) > 0 and 'Offside line (to check)' not in keys, keys)
    pg.keyboard.press('Escape')
    # mobile nav
    pg.locator('[data-hwp="nav-toggle"]').click()
    check('Menu opens and moves focus into the menu', pg.evaluate("document.querySelector('[data-hwp=nav-toggle]').getAttribute('aria-expanded')") == 'true' and pg.evaluate("!!document.activeElement.closest('.hwp-mobile-nav')"))
    pg.keyboard.press('Escape')
    check('Escape closes the menu and returns focus to the toggle', pg.evaluate("document.querySelector('[data-hwp=nav-toggle]').getAttribute('aria-expanded')") == 'false' and pg.evaluate("document.activeElement.dataset.hwp") == 'nav-toggle')
    # checklist
    pg.goto(base + '/moving-up/'); pg.wait_for_load_state('networkidle')
    boxes = pg.locator('[data-hwp="checklist"] input[type=checkbox]')
    if boxes.count():
        boxes.nth(0).check(); boxes.nth(1).check()
        c1 = pg.locator('.hwp-checklist__count').first.text_content()
        pg.reload(); pg.wait_for_load_state('networkidle')
        check('checklist ticks persist after reload', pg.locator('[data-hwp="checklist"] input[type=checkbox]').nth(1).is_checked(), c1)
    # newsletter demo
    pg.goto(base + '/coaching-notes/'); pg.wait_for_load_state('networkidle')
    reqs = []
    pg.on('request', lambda r: reqs.append(r.url) if not r.url.startswith(base) else None)
    form = pg.locator('form[data-hwp="newsletter"]')
    if form.count():
        form.locator('button[type=submit]').click()
        check('empty submit shows an email error and focuses the field', 'Enter your email' in pg.evaluate("document.querySelector('form[data-hwp=newsletter] .hwp-error').textContent") and pg.evaluate("document.activeElement.type") == 'email')
        form.locator('input[type=email]').fill('coach@example.com'); form.locator('button[type=submit]').click()
        check('missing consent shows its own error', 'Tick the box' in pg.evaluate("document.querySelectorAll('form[data-hwp=newsletter] .hwp-error')[1].textContent"))
        form.locator('input[name=consent]').check(); form.locator('button[type=submit]').click()
        check('valid demo submit says nothing was sent', 'nothing was sent' in pg.evaluate("document.querySelector('[data-hwp=nl-status]').textContent"))
        check('newsletter demo makes no network request', not reqs, reqs)
    # reduced motion
    q = b.new_page(reduced_motion='reduce'); q.goto(base + '/formations/9v9/2-2-3-1/lose-it-find-home/'); q.wait_for_load_state('networkidle')
    play = q.locator('[data-hwp="seq-play"]')
    if play.count():
        play.click(); q.wait_for_timeout(200)
        check('sequence Play with reduced motion jumps without animating', q.evaluate("[...document.querySelectorAll('figure[data-hwp=figure] [role=tab]')].some(t=>t.getAttribute('aria-selected')==='true')"))
    q.close()
    b.close()

R['summary'] = {'failures': fails}
OUT.write_text(json.dumps(R, indent=1))
print(json.dumps({'layout_failures': len(R['layout']), 'axe_pages_with_violations': len(R['axe']), 'console': R['errors'], 'interactions': f"{sum(i['pass'] for i in R['interactions'])}/{len(R['interactions'])}", 'small_targets_pages': len(R['targets'])}, indent=1))
for i in R['interactions']:
    if not i['pass']: print('FAIL', i)
sys.exit(1 if fails else 0)
