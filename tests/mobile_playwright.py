"""Production-like WTP 2.0 smoke suite. Run on a green Cloudflare preview before merge.
BASE_URL=https://<preview>.whos-that-pokemon-7iu.pages.dev python tests/mobile_playwright.py
"""
import os
from playwright.sync_api import sync_playwright, expect
BASE = os.environ.get('BASE_URL','https://whos-that-pokemon-7iu.pages.dev').rstrip('/')
SIZES=[(320,568),(390,844),(768,1024),(1280,800)]

def run_viewport(browser,width,height):
    page=browser.new_page(viewport={'width':width,'height':height},is_mobile=width<640,has_touch=width<640)
    page.goto(BASE,wait_until='domcontentloaded',timeout=30000)
    expect(page.get_by_role('button',name='Free Play')).to_be_visible(timeout=15000)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),f'Home overflows at {width}'
    expect(page.get_by_role('button',name='Open personal Pokédex')).to_be_visible()
    page.get_by_role('button',name='Open personal Pokédex').click()
    expect(page.get_by_role('dialog',name='Personal Pokédex')).to_be_visible()
    page.get_by_role('button',name='Close Pokédex').click()
    page.get_by_role('button',name='Open game settings').click()
    expect(page.get_by_role('dialog',name='Game settings')).to_be_visible()
    page.get_by_role('button',name='Close settings').click()
    page.get_by_role('button',name='Free Play').click()
    expect(page.locator('.classic-burst')).to_be_visible()
    expect(page.locator('.mystery-mark')).to_be_visible()
    expect(page.locator('.mystery-silhouette')).to_be_visible(timeout=20000)
    expect(page.locator('.revealed-sprite')).to_have_count(0)
    choices=page.locator('.answer-option')
    expect(choices).to_have_count(4)
    expect(choices.first).to_be_enabled(timeout=20000)
    assert len({el.inner_text() for el in choices.all()})==4
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),f'Game overflows at {width}'
    choices.first.click()
    expect(page.locator('.revealed-sprite')).to_be_visible(timeout=6000)
    expect(page.locator('.reveal-callout')).to_be_visible()
    expect(page.locator('.answer-feedback')).to_be_visible()
    expect(page.get_by_role('button',name='Next Pokémon')).to_be_visible()
    page.get_by_role('button',name='Next Pokémon').click()
    expect(page.locator('.mystery-silhouette')).to_be_visible(timeout=20000)
    page.get_by_role('button',name='End run').click()
    expect(page.get_by_text('Nice run, Trainer!')).to_be_visible()
    print(f'PASS: {width}x{height}: guess, reveal, next, results, Pokédex and Settings')
    page.close()

if __name__=='__main__':
    with sync_playwright() as playwright:
        browser=playwright.chromium.launch(headless=True)
        try:
            for width,height in SIZES: run_viewport(browser,width,height)
        finally: browser.close()
