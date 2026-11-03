const { launch, APP_URL, REFERENCE_URL, isReferenceFavicon } = require("./harness.cjs");
const APP = APP_URL,
  REF = REFERENCE_URL;
let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const H = ".hero-header";
const st = (p) =>
  p.evaluate((H) => {
    const d = document.querySelector(H + " .mobile-drawer"),
      b = document.querySelector(H + " .hamburger"),
      cs = getComputedStyle(d);
    return {
      open: d.classList.contains("open"),
      visible: cs.visibility === "visible" && cs.opacity === "1",
      active: b.classList.contains("is-active"),
      expanded: b.getAttribute("aria-expanded"),
      label: b.getAttribute("aria-label"),
      bodyClass: document.body.classList.contains("menu-open"),
      hamburgerShown: getComputedStyle(b).display !== "none",
      linkIndex: [...d.querySelectorAll("a")]
        .map((a) => a.style.getPropertyValue("--link-index"))
        .join(","),
    };
  }, H);
const isClosed = (s) =>
  !s.open &&
  !s.active &&
  s.expanded === "false" &&
  s.label === "Open navigation menu" &&
  !s.bodyClass;
const isOpen = (s) =>
  s.open &&
  s.visible &&
  s.active &&
  s.expanded === "true" &&
  s.label === "Close navigation menu" &&
  s.bodyClass;
const settle = (p) => p.waitForTimeout(600);
(async () => {
  const b = await launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type()) && !isReferenceFavicon(m)) errs.push(m.text());
  });
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(APP, { waitUntil: "networkidle" });
  console.log("=== 390px mobile ===");
  let s = await st(page);
  check("hamburger visible on mobile", s.hamburgerShown);
  check("starts closed", isClosed(s) && !s.visible, JSON.stringify(s));
  const open = async () => {
    await page.click(H + " .hamburger");
    await settle(page);
    return st(page);
  };
  s = await open();
  check(
    "hamburger opens drawer",
    isOpen(s),
    `label="${s.label}" expanded=${s.expanded} body.menu-open=${s.bodyClass}`,
  );
  check("stagger --link-index 0..6", s.linkIndex === "0,1,2,3,4,5,6", s.linkIndex);
  await page.click(H + " .hamburger");
  await settle(page);
  s = await st(page);
  check("hamburger closes drawer", isClosed(s) && !s.visible);
  await open();
  await page.keyboard.press("Escape");
  await settle(page);
  check("Escape closes", isClosed(await st(page)));
  await open();
  await page.mouse.click(200, 700);
  await settle(page);
  check("click outside closes", isClosed(await st(page)));
  await open();
  const box = await page.locator(H + " .mobile-drawer").boundingBox();
  await page.mouse.click(box.x + box.width - 6, box.y + 6);
  await settle(page);
  check("click inside drawer (not a link) stays open", isOpen(await st(page)));
  await page.click(H + " .mobile-drawer a[href='/']");
  await settle(page);
  check("clicking a nav link closes", isClosed(await st(page)));
  await open();
  await page.click(H + " .mobile-drawer a.cv-trigger");
  await settle(page);
  check(
    "clicking Download CV closes the drawer (and opens the CV modal)",
    isClosed(await st(page)) &&
      (await page.evaluate(() => document.getElementById("cvModal").classList.contains("open"))),
  );
  await page.keyboard.press("Escape");
  await settle(page);
  await open();
  await page.setViewportSize({ width: 1000, height: 800 });
  await settle(page);
  s = await st(page);
  check("resize above 900px closes", isClosed(s));
  check("hamburger hidden on desktop", !s.hamburgerShown);
  await page.setViewportSize({ width: 900, height: 800 });
  await settle(page);
  s = await st(page);
  check("hamburger shown at exactly 900px", s.hamburgerShown);
  check("no console errors / hydration warnings", errs.length === 0, errs.join(" | "));
  await ctx.close();

  console.log("\n=== vs V21 reference, drawer OPEN, 390px ===");
  for (const theme of ["dark", "light"]) {
    const got = {};
    for (const [k, url] of [
      ["ref", REF],
      ["app", APP],
    ]) {
      const c = await b.newContext({
        viewport: { width: 390, height: 800 },
        reducedMotion: "reduce",
      });
      await c.addInitScript((t) => localStorage.setItem("fa-theme", t), theme);
      const p = await c.newPage();
      await p.goto(url, { waitUntil: "networkidle" });
      await p.click(H + " .hamburger");
      await p.waitForTimeout(900);
      const s2 = await st(p);
      delete s2.linkIndex;
      got[k] = s2;
      got[k + "Boxes"] = await p.evaluate(
        (H) =>
          [
            ...document.querySelectorAll(
              H + " .mobile-drawer, " + H + " .mobile-drawer a, " + H + " .hamburger",
            ),
          ]
            .map((e) => {
              const r = e.getBoundingClientRect();
              return [r.x, r.y, r.width, r.height].map(Math.round).join(",");
            })
            .join(" | "),
        H,
      );
      const db = await p.locator(H + " .mobile-drawer").boundingBox();
      got[k + "Png"] = await p.screenshot({
        clip: {
          x: Math.floor(db.x),
          y: Math.floor(db.y),
          width: Math.ceil(db.width),
          height: Math.ceil(db.height),
        },
      });
      got[k + "Burger"] = await p.locator(H + " .hamburger").screenshot();
      await c.close();
    }
    check(
      `${theme}: open state matches V21`,
      JSON.stringify(got.ref) === JSON.stringify(got.app),
      JSON.stringify(got.app),
    );
    check(
      `${theme}: drawer + links + hamburger positions/sizes match`,
      got.refBoxes === got.appBoxes,
      got.refBoxes === got.appBoxes ? "" : `\n   ref ${got.refBoxes}\n   app ${got.appBoxes}`,
    );
    check(`${theme}: open drawer pixel-identical`, Buffer.compare(got.refPng, got.appPng) === 0);
    check(
      `${theme}: hamburger "×" icon pixel-identical`,
      Buffer.compare(got.refBurger, got.appBurger) === 0,
    );
  }
  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
