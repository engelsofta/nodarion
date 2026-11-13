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
          monitor.rules = {...monitor.rules, network_segments:[{name:"Home", vlan_id:1, network:"192.0.2.0/24", role:"trusted",color:"#7788aa",monitoring:true}]};
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
    await page.setViewportSize({ width: 1440, height: 1080 });
    assert.ok((await panel.boundingBox()).height >= 1080);
    await page.setViewportSize({ width: 390, height: 844 });
    const settingsMenu = settings.locator(".settings-menu");
    assert.equal(await settingsMenu.getByRole("button").count(), 5);
    const saveSettings = settings.locator(".settings-toolbar .save-watch-rules");
    assert.equal(await saveSettings.isEnabled(), false);
    await page.setViewportSize({ width: 1440, height: 900 });
    const menuBox = await settingsMenu.boundingBox();
    const saveBox = await saveSettings.boundingBox();
    assert.ok(saveBox.x >= menuBox.x + menuBox.width && Math.abs(saveBox.y - menuBox.y) < 2);
    await page.setViewportSize({ width: 390, height: 844 });
    const learningDays = settings.locator('[data-rule="learning_days"]');
    await learningDays.fill("12");
    assert.equal(await saveSettings.isEnabled(), true);
    for (const section of ["rules", "notifications", "dns", "ai-maintenance", "general"]) {
      const entry = settingsMenu.locator(`[data-settings-section="${section}"]`);
      await entry.click();
      assert.equal(await entry.getAttribute("aria-current"), "true");
      assert.equal(await settings.locator(`[data-settings-panel="${section}"]`).isVisible(), true);
      assert.equal(await settings.locator("[data-settings-panel]:visible").count(), 1);
      assert.equal(await saveSettings.isVisible(), true);
      assert.equal(await saveSettings.isEnabled(), true);
      if (section === "ai-maintenance") {
        assert.equal(await settings.locator('[data-settings-panel="ai-maintenance"] .settings-select summary').isVisible(), true);
      }
    }
    assert.equal(await learningDays.inputValue(), "12");
    assert.equal(await settings.locator('.onboarding-settings').isVisible(), true);
    assert.equal(await settings.locator('.guest-settings').isVisible(), true);
    assert.equal(await settings.locator('[data-rule="enabled"]').getAttribute('role'), 'switch');
    await panel.evaluate(element => {
      element._originalStateClient = element._stateClient;
      element._stateClient = { mutate: async payload => { element._testSavedRules = payload.rules; } };
    });
    await saveSettings.click();
    assert.equal(await panel.evaluate(el => el._testSavedRules.learning_days), 12);
    assert.equal(await settings.locator('.settings-save-status').textContent(), 'Alles gespeichert');
    await page.waitForTimeout(1900);
    assert.equal(await saveSettings.isEnabled(), false);
    await panel.evaluate(element => { element._stateClient = element._originalStateClient; });
    for (const viewport of [{ width:390, height:844 }, { width:1440, height:900 }]) {
      await page.setViewportSize(viewport);
      for (const section of ['general', 'rules', 'notifications', 'dns', 'ai-maintenance']) {
        await settingsMenu.locator('[data-settings-section="' + section + '"]').click();
        assert.ok(await settings.evaluate(el => el.scrollWidth <= el.clientWidth + 1), section + ' overflow');
        if (section === 'dns') assert.equal(await settings.locator('.settings-save-status').textContent(), 'DNS wird sofort gespeichert');
        if (process.env.NODARION_PREVIEW_DIR) await settings.screenshot({path:path.join(process.env.NODARION_PREVIEW_DIR, 'settings-' + section + '-' + viewport.width + '.png')});
      }
    }
    await page.setViewportSize({ width:390, height:844 });

    assert.equal(await settings.locator(".settings-context-title, .settings-back").count(), 0);
    assert.equal(await panel.locator(".metrics .metric-settings").count(), 0);
    assert.equal(await panel.locator("header .header-settings").count(), 0);
    assert.equal(await panel.locator("header .scan, header .version-info").count(), 0);
    await nav.getByRole("button", { name: "Geräte", exact: true }).click();
    const guest = panel.locator(".device-counts .guest-inline");
    await panel.evaluate((element, qrCode) => {
      Object.assign(element._monitor.guest_access, {
        available: true, enabled: true, ap_type: "guest", ssid: "Test Guest Wi-Fi", qr_code: qrCode,
      });
    }, "data:image/svg+xml;base64," + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" /></svg>').toString("base64"));
    await guest.click();
    const guestDialog = panel.locator(".guest-modal");
    assert.equal(await guestDialog.isVisible(), true);
    assert.equal(await guestDialog.locator(".guest-qr img").isVisible(), true);
    for (const viewport of [{ width: 390, height: 640 }, { width: 1440, height: 720 }]) {
      await page.setViewportSize(viewport);
      assert.equal(await guestDialog.evaluate(el => el.scrollHeight <= el.clientHeight + 1), true);
    }
    await page.setViewportSize({ width: 390, height: 844 });
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
    await nav.locator('[data-nav-tab="ai"]').click();
    const report = panel.locator(".ai-panel");
    assert.equal(await report.locator(".ai-empty").isVisible(), true);
    await panel.evaluate(element => {
      element._monitor.ai_analysis = {
        reports: Array.from({ length: 14 }, (_, index) => ({
          timestamp: new Date(Date.UTC(2026, 10, 14 - index)).toISOString(),
          score: index === 0 ? 8 : 7,
          summary: "Das Netzwerk zeigt ein unauffälliges Verhalten mit stabiler Konnektivität und effektiver Filterung.",
          risks: "Mehrere Geräte wurden umbenannt. Der Anteil blockierter DNS-Anfragen ist erhöht.",
          changes: "Leichte Rückgänge bei DNS-Abfragen und aktiven Clients im Vergleich zum Vortag.",
          recommendations: "Gründe für die Umbenennungen und die Filterlisten überprüfen.",
          confidence: "Hohe Zuverlässigkeit bei vollständiger Datenlage.",
          prompt: "Example prompt",
        })),
      };
      element._renderAi();
    });
    assert.equal(await report.locator(".ai-history-bar").count(), 14);
    assert.equal(await report.locator(".ai-history-bar.latest").count(), 1);
    assert.equal(await report.locator(".ai-copy article").count(), 4);
    assert.equal(await report.locator(".ai-copy").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length), 1);
    const promptToggle = report.locator(".ai-prompt-toggle");
    await promptToggle.click();
    assert.equal(await promptToggle.getAttribute("aria-expanded"), "true");
    assert.equal(await report.locator(".ai-prompt").isVisible(), true);
    await promptToggle.click();
    assert.equal(await report.locator(".ai-prompt").isVisible(), false);
    await page.setViewportSize({ width: 1800, height: 900 });
    assert.equal(await report.locator(".ai-copy").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length), 2);
    assert.ok((await report.boundingBox()).height < 380);
    if (process.env.NODARION_PREVIEW_DIR) {
      await report.screenshot({ path: path.join(process.env.NODARION_PREVIEW_DIR, "panel-ai-desktop.png") });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    if (process.env.NODARION_PREVIEW_DIR) {
      await report.screenshot({ path: path.join(process.env.NODARION_PREVIEW_DIR, "panel-ai-mobile.png") });
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
    const shell = await panel.locator(".shell").boundingBox();
    const devices = await panel.locator(".device-list").boundingBox();
    assert.ok(Math.abs((shell.y + shell.height) - (devices.y + devices.height) - 14) < 2);
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
