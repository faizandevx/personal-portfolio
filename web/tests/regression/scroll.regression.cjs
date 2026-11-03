const { launch, APP_URL, REFERENCE_URL, isReferenceFavicon } = require("./harness.cjs");
const APP = APP_URL,
  REF = REFERENCE_URL;
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};
const to = (p, y) => p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
const nav = (p) =>
  p.evaluate(() => {
    const h = document.querySelector(".hero-header"),
      f = document.querySelector(".floating-header"),
      z = document.querySelector("[data-header-hero]");
    return {
      y: parseFloat(h.style.getPropertyValue("--hero-nav-y") || "0"),
      op: parseFloat(h.style.getPropertyValue("--hero-nav-opacity") || "1"),
      heroInactive: h.classList.contains("nav-inactive"),
      heroAria: h.getAttribute("aria-hidden"),
      floatVisible: f.classList.contains("visible"),
      floatInert: f.inert,
      floatAria: f.getAttribute("aria-hidden"),
      heroHeight: z.getBoundingClientRect().height,
      scrollY: scrollY,
      floatOpacity: +getComputedStyle(f).opacity,
    };
  });
const settle = (p) => p.waitForTimeout(1600);
const maxScroll = (p) => p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
async function open(b, url, opts = {}) {
  const ctx = await b.newContext({
    viewport: { width: opts.width || 1440, height: 800 },
    reducedMotion: opts.reduced ? "reduce" : "no-preference",
  });
  if (opts.theme) await ctx.addInitScript((t) => localStorage.setItem("fa-theme", t), opts.theme);
  const p = await ctx.newPage();
  p.errs = [];
  p.on("console", (m) => {
    if (["error", "warning"].includes(m.type()) && !isReferenceFavicon(m)) p.errs.push(m.text());
  });
  p.on("pageerror", (e) => p.errs.push(e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  return p;
}
async function pixelDiff(b, pngA, pngB) {
  const p = await (await b.newContext()).newPage();
  const r = await p.evaluate(
    async ([a, b]) => {
      const load = (src) =>
        new Promise((res) => {
          const i = new Image();
          i.onload = () => res(i);
          i.src = "data:image/png;base64," + src;
        });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      if (ia.width !== ib.width || ia.height !== ib.height)
        return { size: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}` };
      const px = (i) => {
        const c = document.createElement("canvas");
        c.width = i.width;
        c.height = i.height;
        const x = c.getContext("2d");
        x.drawImage(i, 0, 0);
        return x.getImageData(0, 0, i.width, i.height).data;
      };
      const da = px(ia),
        db = px(ib),
        max = 35215 * 0.2 * 0.2;
      let diff = 0,
        exact = 0,
        maxd = 0;
      for (let k = 0; k < da.length; k += 4) {
        const dr = da[k] - db[k],
          dg = da[k + 1] - db[k + 1],
          dbb = da[k + 2] - db[k + 2];
        if (dr || dg || dbb) exact++;
        maxd = Math.max(maxd, Math.abs(dr), Math.abs(dg), Math.abs(dbb));
        const y = dr * 0.29889531 + dg * 0.58662247 + dbb * 0.11448223,
          i = dr * 0.59597799 - dg * 0.2741761 - dbb * 0.32180189,
          q = dr * 0.21147017 - dg * 0.52261711 + dbb * 0.31114694;
        if (0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q > max) diff++;
      }
      return { diff, exact, maxd, total: da.length / 4 };
    },
    [pngA.toString("base64"), pngB.toString("base64")],
  );
  await p.context().close();
  return r;
}
(async () => {
  const b = await launch();

  console.log("=== 1. Initial state (1440px) ===");
  const app = await open(b, APP),
    ref = await open(b, REF);
  let a = await nav(app);
  check(
    "hero header active, floating hidden + inert",
    !a.heroInactive &&
      a.heroAria === "false" &&
      !a.floatVisible &&
      a.floatInert &&
      a.floatAria === "true",
    JSON.stringify(a),
  );

  console.log("\n=== 2. Glide + fade vs V21, scrolling DOWN (after damping settles) ===");
  for (const y of [100, 200, 300, 400, 496, 520, 700]) {
    await to(app, y);
    await to(ref, y);
    await settle(app);
    const A = await nav(app),
      R = await nav(ref);
    const goalY = Math.min(118, y * 0.24);
    check(
      `scrollY=${y}: y=${A.y}px opacity=${A.op} inactive=${A.heroInactive}`,
      Math.abs(A.y - R.y) < 0.2 &&
        Math.abs(A.op - R.op) < 0.006 &&
        A.heroInactive === R.heroInactive &&
        Math.abs(A.y - goalY) < 0.2,
      `V21: y=${R.y} opacity=${R.op} inactive=${R.heroInactive}`,
    );
  }

  console.log("\n=== 3. Damping curve (jump 0 -> 400, sampled every ~50ms) vs V21 ===");
  await to(app, 0);
  await to(ref, 0);
  await settle(app);
  const curve = async (p) => {
    await to(p, 400);
    const out = [];
    for (let i = 0; i < 12; i++) {
      await p.waitForTimeout(50);
      out.push((await nav(p)).y);
    }
    return out;
  };
  const [ca, cr] = await Promise.all([curve(app), curve(ref)]);
  const mono = ca.every((v, i) => i === 0 || v >= ca[i - 1] - 0.01);
  check(
    "smooth: rises gradually, never jumps or goes backwards",
    mono && ca[0] > 0 && ca[0] < 96,
    "app  " + ca.map((v) => v.toFixed(0)).join(" "),
  );
  check(
    "same easing as V21 (within frame-timing jitter, +-6px)",
    ca.every((v, i) => Math.abs(v - cr[i]) <= 6),
    "V21  " + cr.map((v) => v.toFixed(0)).join(" "),
  );

  console.log("\n=== 4. Floating header thresholds (hero bottom: show at -8px, hide at +32px) ===");
  const H = (await nav(app)).heroHeight;
  const vis = async (y) => {
    await to(app, y);
    await app.waitForTimeout(150);
    return (await nav(app)).floatVisible;
  };
  await to(app, 0);
  await app.waitForTimeout(200);
  // Hero height can be fractional (real content): V21 shows when bottom <= -8 and hides when bottom >= 32.
  const SHOW = Math.ceil(H + 8),
    HIDE = Math.floor(H - 32);
  check(`down: hidden just above hero bottom -8px (scrollY ${SHOW - 1})`, !(await vis(SHOW - 1)));
  check(`down: shown at hero bottom -8px (scrollY ${SHOW})`, await vis(SHOW));
  check("down further: stays shown", await vis(H + 600));
  check(
    `UP: still shown just below hero bottom +32px (hysteresis, scrollY ${HIDE + 1})`,
    await vis(HIDE + 1),
  );
  check(`UP: hidden at hero bottom +32px (scrollY ${HIDE})`, !(await vis(HIDE)));
  check("UP to top: hidden", !(await vis(0)));
  await to(app, H + 300);
  await settle(app);
  a = await nav(app);
  check(
    "when shown: not inert, aria-hidden=false, fully opaque after slide-in",
    a.floatVisible && !a.floatInert && a.floatAria === "false" && a.floatOpacity === 1,
    JSON.stringify({ inert: a.floatInert, aria: a.floatAria, opacity: a.floatOpacity }),
  );

  console.log("\n=== 5. Only one header active at a time (every 8px, top -> bottom -> top) ===");
  let overlap = 0,
    gap = 0;
  const max = await maxScroll(app);
  const ys = [];
  for (let y = 0; y <= max; y += 8) ys.push(y);
  const path = ys.concat([...ys].reverse());
  for (const y of path) {
    await to(app, y);
    await app.waitForTimeout(16);
    const s = await nav(app);
    if (!s.heroInactive && s.floatVisible) overlap++;
    if (s.heroInactive && !s.floatVisible) gap++;
  }
  // Gaps (neither header active) are expected: as in V21, the hero nav fades out
  // before the floating header slides in. Only overlaps are an error.
  check(
    `never both active (${path.length} samples)`,
    overlap === 0,
    `overlaps=${overlap}, gaps=${gap}`,
  );

  console.log("\n=== 6. Fast scrolling ===");
  // V21 stops animating within 0.13px / 0.004 opacity of the target (app.js line 72).
  const fast = async (p) => {
    const mx = await maxScroll(p);
    for (let i = 0; i < 20; i++) {
      await to(p, i % 2 ? 0 : mx);
      await p.waitForTimeout(10);
    }
    await to(p, mx);
    await settle(p);
    const bottom = await nav(p);
    await p.mouse.move(700, 400);
    for (let i = 0; i < 6; i++) await p.mouse.wheel(0, -2500);
    await settle(p);
    return { bottom, top: await nav(p) };
  };
  const [fa, fr] = await Promise.all([fast(app), fast(ref)]);
  check(
    "20 instant jumps, ends at bottom: floating shown, hero gone (at rest)",
    fa.bottom.floatVisible &&
      fa.bottom.heroInactive &&
      Math.abs(fa.bottom.y - 118) <= 0.13 &&
      fa.bottom.op <= 0.004,
    `app y=${fa.bottom.y} op=${fa.bottom.op} · V21 y=${fr.bottom.y} op=${fr.bottom.op}`,
  );
  check(
    "mouse-wheel flicks back to top: hero at rest, floating hidden",
    fa.top.scrollY === 0 &&
      !fa.top.heroInactive &&
      !fa.top.floatVisible &&
      fa.top.y <= 0.13 &&
      fa.top.op >= 0.996,
    `app y=${fa.top.y} op=${fa.top.op} · V21 y=${fr.top.y} op=${fr.top.op}`,
  );
  check(
    "no console errors / hydration warnings (desktop)",
    app.errs.length === 0,
    app.errs.join(" | "),
  );

  console.log("\n=== 7. Theme toggles synchronised across both headers ===");
  await to(app, max);
  await settle(app);
  const labels = () =>
    app.evaluate(() =>
      [...document.querySelectorAll(".theme-toggle")].map((x) => x.getAttribute("aria-label")),
    );
  await app.click(".floating-header .theme-toggle");
  await app.waitForTimeout(300);
  let th = await app.evaluate(() => document.documentElement.dataset.theme),
    L = await labels();
  check(
    "floating toggle -> light; BOTH buttons updated",
    th === "light" && L.length === 2 && L.every((l) => l === "Switch to dark theme"),
    `${th} ${JSON.stringify(L)}`,
  );
  await to(app, 0);
  await settle(app);
  await app.click(".hero-header .theme-toggle");
  await app.waitForTimeout(300);
  th = await app.evaluate(() => document.documentElement.dataset.theme);
  L = await labels();
  check(
    "hero toggle -> dark; BOTH buttons updated",
    th === "dark" && L.every((l) => l === "Switch to light theme"),
    `${th} ${JSON.stringify(L)}`,
  );
  await app.context().close();
  await ref.context().close();

  console.log("\n=== 8. Mobile (390px): menus with both headers ===");
  const m = await open(b, APP, { width: 390 });
  const menu = () =>
    m.evaluate(() => ({
      hero: document.querySelector(".hero-header .mobile-drawer").classList.contains("open"),
      float: document.querySelector(".floating-header .mobile-drawer").classList.contains("open"),
      body: document.body.classList.contains("menu-open"),
    }));
  const mH = (await nav(m)).heroHeight,
    mMax = await maxScroll(m);
  await m.click(".hero-header .hamburger");
  await m.waitForTimeout(300);
  let s = await menu();
  check("open hero menu at top", s.hero && !s.float && s.body);
  for (let y = 0; y <= 560; y += 40) {
    await to(m, y);
    await m.waitForTimeout(20);
  }
  await settle(m);
  s = await menu();
  check(
    "scroll down until hero header fades -> its menu closes (as V21)",
    !s.hero && !s.float && !s.body,
    JSON.stringify(s),
  );
  await to(m, mMax);
  await settle(m);
  await m.click(".floating-header .hamburger");
  await m.waitForTimeout(300);
  s = await menu();
  check("open floating menu after the hero", s.float && !s.hero && s.body);
  await m.keyboard.press("Escape");
  await m.waitForTimeout(200);
  s = await menu();
  check("Escape closes floating menu", !s.float && !s.body);
  await m.click(".floating-header .hamburger");
  await m.waitForTimeout(300);
  await to(m, mH - 40);
  await m.waitForTimeout(300);
  s = await menu();
  check(
    "scroll back up until floating hides -> its menu closes (as V21)",
    !s.float && !s.body,
    JSON.stringify(s),
  );
  await to(m, mMax);
  await settle(m);
  await m.click(".floating-header .theme-toggle");
  await m.waitForTimeout(200);
  check(
    "mobile: floating theme toggle works",
    (await m.evaluate(() => document.documentElement.dataset.theme)) === "light",
  );
  check("no console errors (mobile)", m.errs.length === 0, m.errs.join(" | "));
  await m.context().close();

  console.log("\n=== 9. Keyboard: the hidden header cannot be focused ===");
  const k = await open(b, APP);
  const canFocus = (sel) =>
    k.evaluate((sel) => {
      const el = document.querySelector(sel);
      el.focus();
      return document.activeElement === el;
    }, sel);
  check(
    "at top: floating header links NOT focusable (inert)",
    !(await canFocus(".floating-header .nav-links a")),
  );
  check("at top: hero header links focusable", await canFocus(".hero-header .nav-links a"));
  await to(k, await maxScroll(k));
  await settle(k);
  check(
    "after hero: hero header links NOT focusable",
    !(await canFocus(".hero-header .nav-links a")),
  );
  check(
    "after hero: floating header links focusable",
    await canFocus(".floating-header .nav-links a"),
  );
  await k.context().close();

  console.log("\n=== 10. Reduced motion ===");
  const r = await open(b, APP, { reduced: true });
  await to(r, 300);
  await r.waitForTimeout(60);
  a = await nav(r);
  check(
    "hero header goes straight to target (no damping)",
    a.y === 72 && Math.abs(a.op - (1 - 255 / 470)) < 0.002,
    JSON.stringify({ y: a.y, op: a.op }),
  );
  await to(r, a.heroHeight + 100);
  await r.waitForTimeout(80);
  a = await nav(r);
  check(
    "floating header appears without the 800ms slide",
    a.floatVisible && a.floatOpacity === 1,
    "opacity " + a.floatOpacity,
  );
  await r.context().close();

  console.log("\n=== 11. Floating header pixels vs V21 (page content behind hidden) ===");
  for (const theme of ["dark", "light"])
    for (const width of [1440, 390]) {
      const shots = [];
      for (const url of [REF, APP]) {
        const p = await open(b, url, { width, theme, reduced: true });
        await p.addStyleTag({
          content:
            "main>*:not(.hero-zone), .hero-zone>*:not(.hero-header), .hero-zone:before, .hero-zone:after, .note-ribbon, .site-footer {visibility:hidden!important} nextjs-portal{display:none!important}",
        });
        await to(p, 1400);
        await p.waitForTimeout(500);
        shots.push(await p.locator(".floating-header").screenshot());
        await p.context().close();
      }
      const d = await pixelDiff(b, shots[0], shots[1]);
      check(
        `${theme} @${width}px: floating header pixels (documented tolerance)`,
        !d.size && d.diff / d.total <= 0.01,
        `${d.diff} px beyond threshold, ${d.exact} not byte-identical, max channel delta ${d.maxd}, of ${d.total}`,
      );
    }
  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
