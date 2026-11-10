// Browser check against the real modules with synthetic Home Assistant data.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.NODARION_PLAYWRIGHT || "playwright");

async function main() {
  const browser = await chromium.launch({
    ...(process.env.NODARION_BROWSER_CHANNEL ? { channel: process.env.NODARION_BROWSER_CHANNEL } : {}),
  });
  try {
    const root = path.resolve(__dirname, "..");
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on("pageerror", error => errors.push(String(error)));
    const origin = "http://nodarion-preview.invalid";
    await page.route(origin + "/**", async route => {
      const url = new URL(route.request().url());
      const file = path.join(root, url.pathname);
      if (url.pathname === "/tests/pihole-browser.html") {
        const fixture = fs.readFileSync(file, "utf8").replace(
          "document.body.dataset.ready='true';",
          `monitor.participants = [
            { entity_id:"binary_sensor.office", state:"on", attributes:{ nodarion_key:"office", ip_address:"192.0.2.2", hostname:"Überwachung" } },
            { entity_id:"binary_sensor.lamp", state:"off", attributes:{ nodarion_key:"lamp", ip_address:"192.0.2.3", hostname:"A very long sample device name that should not push the status offscreen" } }
          ];
          panel._render();
          document.body.dataset.ready='true';`
        );
        return route.fulfill({ contentType: "text/html", body: fixture });
      }
      if (/\.(?:m?js)$/.test(file) && fs.existsSync(file)) {
        return route.fulfill({ contentType: "text/javascript", body: fs.readFileSync(file) });
      }
      if (url.pathname.startsWith("/engelsoft_nodarion/room-")) {
        return route.fulfill({ path: path.join(root, "custom_components/nodarion/frontend", path.basename(file)) });
      }
      if (url.pathname === "/engelsoft_nodarion_icon.png") {
        return route.fulfill({ path: path.join(root, "custom_components/nodarion/brand/icon.png") });
      }
      return route.fulfill({ status: 404, body: "" });
    });
    await page.goto(origin + "/tests/pihole-browser.html");
    await page.waitForSelector('body[data-ready="true"]', { state: "attached" });
    const panel = page.locator("engelsoft-nodarion-panel");
    const nav = panel.locator(".panel-navigation");
    const mobileNav = await nav.boundingBox();
    const mobileHeader = await panel.locator("header").boundingBox();
    assert.ok(mobileNav.y + mobileNav.height < mobileHeader.y && mobileNav.width > mobileNav.height);
    assert.equal(await panel.locator(".ha-menu").count(), 0);
    const settings = panel.locator(".settings-view");
    const policy = settings.locator(".pihole-domain-form");
    await policy.locator('[name="domain"]').fill("new.example.org");
    await policy.locator('[type="submit"]').click();
    await panel.locator(".confirm-accept").click();
    await settings.locator('[data-pihole-remove="@@||new.example.org^"]').waitFor();
    await page.locator("#adguard").click();
    assert.equal(await settings.locator("[data-adguard-switch]").count(), 6);
    assert.equal(await policy.count(), 0);
    const general = nav.getByRole("button", { name: "Allgemeine Einstellungen öffnen" });
    await general.click();
    assert.equal(await general.getAttribute("aria-current"), "page");
    assert.equal(await settings.locator('[data-settings-panel="general"]').isVisible(), true);
    assert.equal(await panel.locator("header .header-settings").count(), 0);
    assert.equal(await panel.locator("header .scan, header .version-info").count(), 0);
    await nav.getByRole("button", { name: "Geräte", exact: true }).click();
    const guest = panel.locator(".device-counts .guest-inline");
    await guest.click();
    assert.equal(await panel.locator(".guest-modal").isVisible(), true);
    await panel.locator(".guest-close").click();
    assert.equal(await panel.locator(".guest-modal").count(), 0);
    const row = panel.locator(".device-list tbody tr").first();
    const disclosure = row.locator(".mobile-details");
    const watch = row.locator('[data-column="watch"]');
    const ip = row.locator('[data-column="ip"]');
    const status = row.locator(".mobile-device-status");
    assert.equal(await status.isVisible(), true);
    assert.equal(await status.textContent(), "Online");
    assert.equal(await ip.isVisible(), false);
    assert.equal(await watch.isVisible(), false);
    assert.ok((await row.boundingBox()).height <= 70);
    const offlineStatus = panel.locator(".device-list tbody tr").nth(1).locator(".mobile-device-status");
    assert.equal(await offlineStatus.textContent(), "Offline");
    assert.ok(Math.abs((await status.boundingBox()).x - (await offlineStatus.boundingBox()).x) < 1);
    assert.ok((await offlineStatus.boundingBox()).x + (await offlineStatus.boundingBox()).width < 380);
    await disclosure.click();
    assert.equal(await disclosure.getAttribute("aria-expanded"), "true");
    assert.equal(await watch.isVisible(), true);
    assert.equal(await ip.isVisible(), true);
    await panel.evaluate(element => element._render(new Set(["participants"])));
    assert.equal(await disclosure.getAttribute("aria-expanded"), "true");
    await disclosure.click();
    assert.equal(await watch.isVisible(), false);
    await panel.locator('.metrics [data-quick-filter-value="off"]').click();
    assert.equal(await panel.locator(".device-list tbody tr").count(), 1);
    await panel.locator('.metrics [data-quick-filter-value="off"]').click();
    assert.equal(await panel.locator(".device-list tbody tr").count(), 2);
    for (const [label, view] of [["Ereignisse","log"], ["DNS","dns"], ["Analyse","ai"], ["Überwachung","watch"]]) {
      const button = nav.getByRole("button", { name: label, exact: true });
      await button.focus();
      await page.keyboard.press("Enter");
      assert.equal(await button.getAttribute("aria-current"), "page");
      assert.equal(await panel.locator(`[data-view="${view}"]`).isVisible(), true);
    }
    await nav.getByRole("button", { name: "Geräte", exact: true }).click();
    await panel.evaluate(element => { element.hass = { ...element._hass, language: "en" }; });
    assert.equal(await nav.getByRole("button", { name: "Devices", exact: true }).getAttribute("aria-current"), "page");
    assert.equal(await row.locator(".entity-link").textContent(), "Überwachung");
    assert.equal(await panel.getByRole("searchbox", { name: "Search devices" }).isVisible(), true);
    assert.match(await panel.locator(".connection-status").textContent(), /connections active/);
    assert.equal(await disclosure.getAttribute("aria-label"), "Show more device details");
    assert.equal(await panel.locator('header a[href*="github.com"], .mesh-panel, .toolbar, .tabs').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
    if (process.env.NODARION_PREVIEW_DIR) {
      await page.screenshot({ path: path.join(process.env.NODARION_PREVIEW_DIR, "panel-mobile.png") });
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    const rail = await nav.boundingBox();
    const content = await panel.locator(".panel-content").boundingBox();
    assert.ok(rail.x + rail.width < content.x && rail.height > rail.width);
    const readings = await panel.locator(".metric-reading > div, .device-count strong, .function-count strong")
      .evaluateAll(elements => elements.map(el => [el.getBoundingClientRect().top, getComputedStyle(el).fontSize]));
    assert.equal(new Set(readings.map(([, font]) => font)).size, 1);
    assert.ok(Math.max(...readings.map(([top]) => top)) - Math.min(...readings.map(([top]) => top)) < 2);
    assert.equal(await ip.isVisible(), true);
    assert.equal(await watch.isVisible(), true);
    assert.equal(await status.isVisible(), false);
    const dark = await panel.locator(".metrics .metric").first().evaluate(el => getComputedStyle(el).backgroundColor);
    await panel.evaluate(element => { element.hass = { ...element._hass, themes: { darkMode: false } }; });
    const light = await panel.locator(".metrics .metric").first().evaluate(el => getComputedStyle(el).backgroundColor);
    assert.notEqual(dark, light);
    if (process.env.NODARION_PREVIEW_DIR) {
      await page.screenshot({ path: path.join(process.env.NODARION_PREVIEW_DIR, "panel-desktop.png") });
    }
    assert.deepEqual(errors, []);
    console.log("PASS: responsive cards, refresh, filters, keyboard navigation, language, and both themes");
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
