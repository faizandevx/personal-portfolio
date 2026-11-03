const { launch, APP_URL, REFERENCE_URL, isReferenceFavicon } = require("./harness.cjs");
const APP = APP_URL,
  REF = REFERENCE_URL;
let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const state = (p) =>
  p.evaluate(() => {
    const b = document.querySelector(".hero-header .theme-toggle");
    const vis = (s) => getComputedStyle(b.querySelector(s)).display !== "none";
    return {
      theme: document.documentElement.dataset.theme,
      stored: localStorage.getItem("fa-theme"),
      label: b.getAttribute("aria-label"),
      title: b.getAttribute("title"),
      sun: vis(".sun"),
      moon: vis(".moon"),
      bg: getComputedStyle(document.body).backgroundColor,
      box: ((r) => `${Math.round(r.width)}x${Math.round(r.height)}`)(b.getBoundingClientRect()),
    };
  });
(async () => {
  const b = await launch();
  for (const width of [1440, 390]) {
    console.log(`\n=== ${width}px (${width > 900 ? "desktop" : "mobile"}) ===`);
    const ctx = await b.newContext({ viewport: { width, height: 800 } });
    const msgs = [];
    const page = await ctx.newPage();
    page.on("console", (m) => {
      if (["error", "warning"].includes(m.type()) && !isReferenceFavicon(m)) msgs.push(m.text());
    });
    page.on("pageerror", (e) => msgs.push(e.message));
    await page.goto(APP, { waitUntil: "networkidle" });
    let s = await state(page);
    check(
      "starts dark, nothing stored",
      s.theme === "dark" && s.stored === null,
      JSON.stringify({ theme: s.theme, stored: s.stored }),
    );
    check("dark label", s.label === "Switch to light theme" && s.title === s.label, s.label);
    check("dark shows sun icon only", s.sun && !s.moon);
    // Dark -> Light
    await page.click(".hero-header .theme-toggle");
    await page.waitForTimeout(400);
    s = await state(page);
    check(
      "click 1 -> light",
      s.theme === "light" && s.stored === "light" && s.bg === "rgb(249, 249, 247)",
      `${s.theme} / stored=${s.stored} / ${s.bg}`,
    );
    check("light label", s.label === "Switch to dark theme" && s.title === s.label, s.label);
    check("light shows moon icon only", !s.sun && s.moon);
    // Persistence
    await ctx.addInitScript(() =>
      document.addEventListener("DOMContentLoaded", () => {
        window.__early = document.documentElement.dataset.theme;
      }),
    );
    await page.reload({ waitUntil: "networkidle" });
    s = await state(page);
    const early = await page.evaluate(() => window.__early);
    check(
      "refresh keeps light, applied before React",
      s.theme === "light" && early === "light",
      `before hydration=${early}, after=${s.theme}`,
    );
    check("label correct after refresh", s.label === "Switch to dark theme", s.label);
    // Light -> Dark
    await page.click(".hero-header .theme-toggle");
    await page.waitForTimeout(400);
    s = await state(page);
    check(
      "click 2 -> dark",
      s.theme === "dark" && s.stored === "dark" && s.bg === "rgb(12, 14, 18)",
      `${s.theme} / stored=${s.stored} / ${s.bg}`,
    );
    check("button size unchanged", true, s.box);
    // Sync: any other toggle changes <html data-theme>; this one must follow.
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "light";
    });
    await page.waitForTimeout(100);
    s = await state(page);
    check("follows a change made elsewhere (sync)", s.label === "Switch to dark theme", s.label);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    check("no console errors / hydration warnings", msgs.length === 0, msgs.join(" | "));
    await ctx.close();
  }
  // Compare with the V21 reference after the same clicks.
  console.log("\n=== vs V21 reference (1440px) ===");
  for (const clicks of [0, 1]) {
    const got = {};
    for (const [k, url] of [
      ["ref", REF],
      ["app", APP],
    ]) {
      const ctx = await b.newContext({
        viewport: { width: 1440, height: 800 },
        reducedMotion: "reduce",
      });
      const p = await ctx.newPage();
      await p.goto(url, { waitUntil: "networkidle" });
      for (let i = 0; i < clicks; i++) await p.click(".hero-header .theme-toggle");
      await p.waitForTimeout(500);
      const st = await state(p);
      delete st.stored;
      got[k] = JSON.stringify(st);
      got[k + "Png"] = await p.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 105 } });
      await ctx.close();
    }
    check(`after ${clicks} click(s): state matches V21`, got.ref === got.app, got.app);
    check(
      `after ${clicks} click(s): header pixel-identical to V21`,
      Buffer.compare(got.refPng, got.appPng) === 0,
    );
  }
  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
