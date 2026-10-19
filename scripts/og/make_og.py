"""Renders scripts/og/og.html to public/og/default.png (1200 x 630). Dev-time only: run after a brand change.
Requires Python Playwright with Chromium. The PNG is committed, so builds don't need a browser."""
from pathlib import Path
from playwright.sync_api import sync_playwright
here = Path(__file__).resolve().parent
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 630})
    pg.goto((here / 'og.html').as_uri()); pg.wait_for_timeout(800)
    pg.screenshot(path=str(here.parent.parent / 'public/og/default.png')); b.close()
print('wrote public/og/default.png')
