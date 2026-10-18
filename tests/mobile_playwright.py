"""Mobile browser regression checks (manual; no CI services or GitHub Actions).

Install:
    python -m pip install playwright
    python -m playwright install chromium
Run against a Cloudflare preview before deploying:
    BASE_URL=https://<preview>.whos-that-pokemon-7iu.pages.dev python tests/mobile_playwright.py
"""
import os
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get("BASE_URL", "https://whos-that-pokemon-7iu.pages.dev").rstrip("/")
SIZES = [(320, 568), (375, 667), (390, 844), (768, 1024), (1280, 800)]


def box_is_horizontally_visible(box, width):
    return box and box["width"] >= 40 and box["x"] >= -1 and box["x"] + box["width"] <= width + 1


def test_page(browser, width, height):
    mobile = width < 640
    page = browser.new_page(
        viewport={"width": width, "height": height},
        is_mobile=mobile, has_touch=mobile,
        device_scale_factor=2 if mobile else 1,
    )
    try:
        page.goto(BASE, wait_until="domcontentloaded", timeout=30_000)
        page.get_by_role("button", name="Play", exact=True).click()
        mask = page.locator(".pokemon-silhouette")
        expect(mask).to_be_visible(timeout=15_000)
        # The color sprite should never exist as a previewable image before the guess.
        assert page.locator('img[alt^="Revealed Pokémon"]').count() == 0
        assert page.evaluate("""() => getComputedStyle(document.querySelector('.pokemon-silhouette')).maskImage !== 'none'""")
        game_buttons = page.locator("main button")
        assert game_buttons.count() == 4, f"Expected 3 guesses + Quit, found {game_buttons.count()}"
        names = [game_buttons.nth(i).inner_text().strip() for i in range(3)]
        assert len(set(names)) == 3, f"Duplicate answers: {names}"
        assert game_buttons.nth(3).inner_text().strip() == "Quit"
        for i in range(4):
            button = game_buttons.nth(i)
            button.scroll_into_view_if_needed()
            assert box_is_horizontally_visible(button.bounding_box(), width), f"Button {i} clips at {width}px"
            expect(button).to_be_visible()
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "Horizontal overflow"
        if mobile:
            # The Oak floating action must not cover the answer grid.
            oak = page.get_by_role("button", name="Ask Professor Oak")
            oa = oak.bounding_box()
            choices = [game_buttons.nth(i).bounding_box() for i in range(4)]
            assert oa and all(
                rect and (rect["x"] + rect["width"] <= oa["x"] or
                          rect["x"] >= oa["x"] + oa["width"] or
                          rect["y"] + rect["height"] <= oa["y"] or
                          rect["y"] >= oa["y"] + oa["height"])
                for rect in choices
            ), "Oak's floating button covers a game choice"
            oak.click()
            expect(page.get_by_role("dialog")).to_be_visible()
            expect(page.get_by_role("textbox", name="ONE POKéMON QUESTION")).to_be_visible()
        print(f"PASS: {width}x{height} — 3 distinct guesses, no image preview or clipped buttons")
    finally:
        page.close()


if __name__ == "__main__":
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for w, h in SIZES:
                test_page(browser, w, h)
        finally:
            browser.close()
