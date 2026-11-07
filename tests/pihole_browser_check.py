"""Render the real custom panel with synthetic HA data on desktop and mobile."""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright


async def main():
    output=Path('test-artifacts')
    output.mkdir(exist_ok=True)
    async with async_playwright() as playwright:
        browser=await playwright.chromium.launch()
        page=await browser.new_page(viewport={"width":1440,"height":1000})
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        await page.goto('http://127.0.0.1:18765/tests/pihole-browser.html')
        await page.wait_for_selector('body[data-ready="true"]')
        await page.locator('.settings-view [data-settings-panel="dns"] .pihole-domain-form').wait_for(state='visible')
        settings=page.locator('.settings-view')
        assert await settings.locator('[data-adguard-switch]').count()==1
        assert 'pihole_gesamtschutz' in await settings.locator('[data-adguard-switch]').get_attribute('data-entity-id')
        await page.screenshot(path=str(output/'pihole-desktop.png'),full_page=True)
        await page.set_viewport_size({"width":390,"height":1000})
        await page.screenshot(path=str(output/'pihole-mobile.png'),full_page=True)
        form=settings.locator('.pihole-domain-form')
        await form.locator('[name="domain"]').fill('new.example.org')
        await form.locator('[type="submit"]').click()
        # The production confirmation dialog remains part of the tested flow.
        await page.locator('.confirm-accept').click()
        await settings.locator('[data-pihole-remove="@@||new.example.org^"]').wait_for()
        await page.locator('#adguard').click()
        assert await settings.locator('[data-adguard-switch]').count()==6
        assert await settings.locator('.pihole-domain-form').count()==0
        assert not errors, errors
        await browser.close()
    print('PASS: Pi-hole-only controls, rule confirmation/save, desktop/mobile render and AdGuard controls preserved')


if __name__=='__main__':
    asyncio.run(main())
