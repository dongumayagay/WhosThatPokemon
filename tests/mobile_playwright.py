"""Immersive anime WTP smoke suite. Run against a green Cloudflare preview.
BASE_URL=https://<preview>.whos-that-pokemon-7iu.pages.dev python tests/mobile_playwright.py
"""
import os
from playwright.sync_api import sync_playwright, expect
BASE = os.environ.get('BASE_URL','https://whos-that-pokemon-7iu.pages.dev').rstrip('/')
SIZES = [(320,568),(390,844),(768,1024),(1280,800)]

def run_viewport(browser, width, height):
    page = browser.new_page(viewport={'width':width,'height':height},is_mobile=width<640,has_touch=width<640)
    page.goto(BASE,wait_until='domcontentloaded',timeout=30000)
    expect(page.locator('.mystery-silhouette')).to_be_visible(timeout=25000)
    stage = page.locator('.anime-stage')
    expect(stage).to_be_visible()
    expect(page.locator('.anime-burst')).to_be_visible()
    expect(page.locator('.anime-logo')).to_have_text('Pokémon')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), f'Home overflows at {width}'
    ratio = stage.evaluate('(e) => e.clientWidth/e.clientHeight')
    assert abs(ratio - 4/3) < 0.07, f'Expected 4:3 mystery screen, got {ratio} at {width}'

    page.get_by_role('button',name='Open game modes and options').click()
    expect(page.get_by_role('dialog',name='Game modes and options')).to_be_visible()
    expect(page.get_by_text('Daily Dex',exact=True)).to_be_visible()
    expect(page.get_by_text('Gym Trials')).to_be_visible()
    page.get_by_role('button',name='Open personal Pokédex').click()
    expect(page.get_by_role('dialog',name='Personal Pokédex')).to_be_visible()
    page.get_by_role('button',name='Close Pokédex').click()

    page.get_by_role('button',name='Open game modes and options').click()
    page.get_by_role('button',name='Open game settings').click()
    expect(page.get_by_role('dialog',name='Game settings')).to_be_visible()
    page.get_by_role('button',name='Close settings').click()

    # Free Play begins immediately with the classic silhouette. No intro card.
    expect(page.locator('.mystery-silhouette')).to_be_visible(timeout=25000)
    expect(page.locator('.anime-question')).to_be_visible()
    expect(page.locator('.revealed-sprite')).to_have_count(0)
    answers = page.locator('.anime-option')
    expect(answers).to_have_count(4)
    expect(answers.first).to_be_enabled(timeout=25000)
    assert len({x.inner_text() for x in answers.all()}) == 4
    assert answers.first.evaluate('(e)=>e.getBoundingClientRect().height') >= 48
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), f'Game overflows at {width}'

    answers.first.click()
    expect(page.locator('.revealed-sprite')).to_be_visible(timeout=8000)
    expect(page.locator('.anime-answer')).to_be_visible()
    expect(page.locator('.wtp-result-feedback')).to_be_visible()
    page.get_by_role('button',name='Next Pokémon').click()
    expect(page.locator('.mystery-silhouette')).to_be_visible(timeout=25000)
    page.get_by_role('button',name='End round').click()
    expect(page.get_by_text('Nice run, Trainer!')).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), f'Results overflow at {width}'
    print(f'PASS {width}x{height}: anime scene, menu, Dex, settings, guess, reveal, results')
    page.close()

if __name__ == '__main__':
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for width, height in SIZES:
                run_viewport(browser,width,height)
        finally:
            browser.close()
