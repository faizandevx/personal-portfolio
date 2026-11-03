const { launch, APP_URL, REFERENCE_URL, isReferenceFavicon } = require("./harness.cjs");
const APP = APP_URL,
  REF = REFERENCE_URL;
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};
async function open(b, url, o = {}) {
  const ctx = await b.newContext({
    viewport: { width: o.width || 1440, height: 800 },
    reducedMotion: o.reduced ? "reduce" : "no-preference",
  });
  if (o.theme) await ctx.addInitScript((t) => localStorage.setItem("fa-theme", t), o.theme);
  const p = await ctx.newPage();
  p.errs = [];
  if (o.year) await p.clock.setFixedTime(new Date(`${o.year}-06-01T12:00:00Z`));
  p.on("console", (m) => {
    if (["error", "warning"].includes(m.type()) && !isReferenceFavicon(m)) p.errs.push(m.text());
  });
  p.on("pageerror", (e) => p.errs.push(e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  return p;
}
const tree = (p) =>
  p.evaluate(() => {
    const skip = new Set(["href", "style"]);
    const out = [];
    (function walk(n, d) {
      if (n.nodeType === 3) {
        const t = n.textContent.replace(/\s+/g, " ").trim();
        if (t) out.push(d + "#text " + t);
        return;
      }
      if (n.nodeType !== 1 || n.tagName === "SCRIPT") return;
      const at = [...n.attributes]
        .filter((a) => !skip.has(a.name))
        .map((a) => a.name + "=" + a.value)
        .sort()
        .join(" ");
      out.push(d + n.tagName.toLowerCase() + " " + at);
      [...n.childNodes].forEach((c) => walk(c, d + "  "));
    })(document.querySelector("footer"), "");
    return out;
  });
const SEL = [
  "footer",
  ".footer-reference-upper",
  ".footer-reference-brand",
  ".footer-reference-title",
  ".footer-reference-country",
  ".footer-reference-nav",
  ".footer-reference-nav a:nth-child(1)",
  ".footer-reference-nav a:nth-child(7)",
  ".footer-reference-icons",
  ".footer-reference-icon:nth-child(1)",
  ".footer-reference-icon:nth-child(2)",
  ".footer-reference-icon:nth-child(3)",
  ".footer-reference-bottom",
  ".footer-backtop",
];
const boxes = (p) =>
  p.evaluate(
    (sel) =>
      sel.map((s) => {
        const e = document.querySelector(s);
        if (!e) return s + " MISSING";
        const r = e.getBoundingClientRect(),
          c = getComputedStyle(e);
        return `${s} ${Math.round(r.x)},${Math.round(r.y - document.querySelector("footer").getBoundingClientRect().y)} ${Math.round(r.width)}x${Math.round(r.height)} ${c.color} ${c.backgroundColor}`;
      }),
    SEL,
  );
const shot = async (p) => {
  await p.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await p.waitForTimeout(400);
  return p.locator("footer").screenshot({ animations: "disabled" });
};
(async () => {
  const b = await launch();

  console.log("=== 1. Markup vs V21 (node by node; href values compared separately) ===");
  let ref = await open(b, REF),
    app = await open(b, APP);
  // Approved Phase 6 change (CLAUDE.md, change 9): the pending LinkedIn icon is a
  // labelled image. Applied to V21 so the comparison measures everything else.
  await ref.evaluate(() =>
    document.querySelector(".footer-reference-icon-pending").setAttribute("role", "img"),
  );
  const [tr, ta] = [await tree(ref), await tree(app)];
  const d = [];
  for (let i = 0; i < Math.max(tr.length, ta.length); i++)
    if (tr[i] !== ta[i]) d.push(`#${i}\n   ref: ${tr[i]}\n   app: ${ta[i]}`);
  check(`footer DOM identical (${ta.length} nodes)`, d.length === 0, d.slice(0, 4).join("\n"));
  const hrefs = (p) =>
    p.evaluate(() => [...document.querySelectorAll("footer a")].map((a) => a.getAttribute("href")));
  const hr = await hrefs(ref),
    ha = await hrefs(app);
  const expected = {
    "index.html": "/",
    "about.html": "/about",
    "projects.html": "/projects",
    "experience.html": "/experience",
    "index.html#home-skills": "/#home-skills",
    "about.html#education": "/about#education",
    "contact.html": "/contact",
    "faq.html": "/faq",
  };
  check(
    "every link points to the matching Next route",
    hr.map((h) => expected[h] || h).join(" ") === ha.join(" "),
    ha.join(" "),
  );
  const gh = await app.evaluate(() => {
    const a = document.querySelector('footer a[href^="https://github.com"]');
    return a.target + " " + a.rel;
  });
  check("GitHub opens in a new tab safely", gh === "_blank noopener noreferrer", gh);
  check(
    "order: main -> floating header -> footer (as V21)",
    await app.evaluate(() => {
      const f = document.querySelector("footer");
      const fl = document.querySelector(".floating-header"),
        m = document.querySelector("main");
      return !!(m.compareDocumentPosition(fl) & 4) && !!(fl.compareDocumentPosition(f) & 4);
    }),
  );

  console.log("\n=== 2. LinkedIn stays non-clickable ===");
  const li = await app.evaluate(() => {
    const e = document.querySelector(".footer-reference-icon-pending");
    e.focus();
    return {
      tag: e.tagName,
      href: e.getAttribute("href"),
      focusable: document.activeElement === e,
      label: e.getAttribute("aria-label"),
    };
  });
  check(
    "LinkedIn is a plain <span>: no link, not focusable",
    li.tag === "SPAN" && li.href === null && !li.focusable,
    JSON.stringify(li),
  );
  const before = app.url();
  await app.click(".footer-reference-icon-pending");
  await app.waitForTimeout(300);
  check(
    "clicking LinkedIn goes nowhere",
    app.url() === before && app.context().pages().length === 1,
  );

  console.log("\n=== 3. Copyright year ===");
  check(
    "shows the current year",
    (await app.textContent(".footer-year")) === String(new Date().getFullYear()),
    await app.textContent(".footer-year"),
  );
  const future = await open(b, APP, { year: 2031 });
  check(
    "simulated date in 2031 -> shows 2031, set before first paint",
    (await future.textContent(".footer-year")) === "2031",
  );
  check(
    "no hydration warning when the year differs from the fallback",
    future.errs.length === 0,
    future.errs.join(" | "),
  );
  await future.context().close();

  console.log("\n=== 4. Back to top ===");
  const max = await app.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await app.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await app.waitForTimeout(300);
  await app.click(".footer-backtop");
  const samples = [];
  for (let i = 0; i < 8; i++) {
    await app.waitForTimeout(60);
    samples.push(await app.evaluate(() => Math.round(scrollY)));
  }
  await app.waitForTimeout(1200);
  const end = await app.evaluate(() => scrollY);
  const inBetween = samples.some((y) => y > 0 && y < max);
  check(
    "smooth: passes through in-between positions, then reaches the top",
    inBetween && end === 0,
    `from ${max}: ${samples.join(" ")} ... ${end}`,
  );
  check(
    "floating header hides again at the top",
    await app.evaluate(
      () => !document.querySelector(".floating-header").classList.contains("visible"),
    ),
  );
  const r = await open(b, APP, { reduced: true });
  await r.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await r.waitForTimeout(200);
  await r.click(".footer-backtop");
  await r.waitForTimeout(30);
  check("reduced motion: jumps to the top instantly", (await r.evaluate(() => scrollY)) === 0);
  await r.context().close();
  check("no console errors / hydration warnings", app.errs.length === 0, app.errs.join(" | "));
  await ref.context().close();
  await app.context().close();

  console.log("\n=== 5. Layout + pixels vs V21 (both themes, 5 widths) ===");
  for (const theme of ["dark", "light"])
    for (const width of [1440, 1024, 768, 390, 360]) {
      const R = await open(b, REF, { width, theme, reduced: true }),
        A = await open(b, APP, { width, theme, reduced: true });
      for (const p of [R, A])
        await p.addStyleTag({
          content:
            ".note-ribbon,.floating-header{visibility:hidden!important} nextjs-portal{display:none!important} main{display:block!important;height:1200px!important;overflow:hidden!important}",
        });
      const [br, ba] = [await boxes(R), await boxes(A)];
      const bd = br
        .map((x, i) => (x === ba[i] ? null : `   ref ${x}\n   app ${ba[i]}`))
        .filter(Boolean);
      const [pr, pa] = [await shot(R), await shot(A)];
      check(
        `${theme} @${width}px: ${SEL.length} elements same position/size/colour`,
        bd.length === 0,
        bd.slice(0, 3).join("\n"),
      );
      check(`${theme} @${width}px: footer pixel-identical`, Buffer.compare(pr, pa) === 0);
      await R.context().close();
      await A.context().close();
    }

  console.log("\n=== 6. Hover states vs V21 ===");
  for (const target of [
    ".footer-reference-nav a:nth-child(2)",
    ".footer-reference-icon:nth-child(1)",
    ".footer-backtop",
  ]) {
    const imgs = [];
    for (const url of [REF, APP]) {
      const p = await open(b, url, { reduced: true });
      await p.addStyleTag({
        content:
          ".note-ribbon,.floating-header{visibility:hidden!important} nextjs-portal{display:none!important} main{display:block!important;height:1200px!important;overflow:hidden!important}",
      });
      await p.evaluate(() =>
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
      );
      await p.waitForTimeout(300);
      await p.hover(target);
      await p.waitForTimeout(500);
      imgs.push(await p.locator("footer").screenshot({ animations: "disabled" }));
      await p.context().close();
    }
    check(`hover ${target}: pixel-identical`, Buffer.compare(imgs[0], imgs[1]) === 0);
  }
  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
