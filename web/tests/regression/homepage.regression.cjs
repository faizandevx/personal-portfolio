// Phase 2 Step 2E: whole-homepage review vs V21. The section suites compare
// each part in detail; this one checks the page as a whole: structure, links,
// keyboard order, focus indicators, accessibility (axe), animations,
// horizontal overflow and console errors, at 8 widths in both themes.
// Run with: npm run test:regression (see tests/regression/README.md)
const { AxeBuilder } = require("@axe-core/playwright");
const { launch, APP_URL, REFERENCE_URL, isReferenceFavicon } = require("./harness.cjs");
const APP = APP_URL,
  REF = REFERENCE_URL;
const WIDTHS = [1440, 1280, 1024, 900, 768, 620, 390, 360];
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
// Elements removed from V21 on purpose (review-only controls, see CLAUDE.md).
const REMOVED = [
  ".note-ribbon",
  ".about-home-mode",
  "#aboutPortraitPanel",
  ".photo-btn",
  "#photoInput",
  ".photo-tag",
  ".photo-sub",
  "#portraitImage",
];
// Internal destinations allowed on the homepage (unfinished routes are listed in README.md).
const ROUTES = [
  "/",
  "/about",
  "/projects",
  "/experience",
  "/contact",
  "/faq",
  "/#home-skills",
  "/about#education",
  "#home-about",
  "#cv-preview",
];
const V21_ROUTE = {
  "index.html": "/",
  "about.html": "/about",
  "projects.html": "/projects",
  "project-detail.html": "/projects",
  "experience.html": "/experience",
  "contact.html": "/contact",
  "faq.html": "/faq",
  "index.html#home-skills": "/#home-skills",
  "about.html#education": "/about#education",
};
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};

async function open(b, url, o = {}) {
  const ctx = await b.newContext({
    viewport: { width: o.width || 1440, height: 800 },
    reducedMotion: o.motion || "reduce",
    rawReference: !!o.raw,
  });
  if (o.theme) await ctx.addInitScript((t) => localStorage.setItem("fa-theme", t), o.theme);
  const p = await ctx.newPage();
  p.errs = [];
  p.on("console", (m) => {
    if (["error", "warning"].includes(m.type()) && !isReferenceFavicon(m))
      p.errs.push(m.text() + " @ " + m.location().url);
  });
  p.on("pageerror", (e) => p.errs.push(e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  if (url === REF)
    await p.evaluate(
      (REMOVED) => REMOVED.forEach((s) => document.querySelectorAll(s).forEach((e) => e.remove())),
      REMOVED,
    );
  if (url === REF && !o.raw)
    // Approved Phase 6 markup changes (CLAUDE.md, change 9), applied to V21 so the
    // link and Tab-order comparisons measure everything else.
    await p.evaluate(() => {
      document.querySelectorAll(".brand").forEach((a) => {
        a.setAttribute("aria-label", "FA Faizan Ali, go to homepage");
        a.querySelector(".brand-icon").after(" ");
      });
      document.querySelector(".footer-reference-icon-pending")?.setAttribute("role", "img");
    });
  await p.waitForTimeout(300);
  return p;
}

(async () => {
  const b = await launch();

  console.log("=== 1. Page structure ===");
  {
    const [ref, app] = [await open(b, REF), await open(b, APP)];
    const outline = (p) =>
      p.evaluate(() =>
        [...document.querySelectorAll("h1, h2, h3")]
          .filter((h) => !h.closest("#cvModal, .whatsapp-preview-backdrop"))
          .map((h) => `${h.tagName} ${h.textContent.replace(/\s+/g, " ").trim()}`),
      );
    const [ro, ao] = [await outline(ref), await outline(app)];
    check(
      `heading outline matches V21 (${ao.length} headings, one h1)`,
      JSON.stringify(ro) === JSON.stringify(ao) &&
        ao.filter((h) => h.startsWith("H1")).length === 1,
      ao.join(" | "),
    );
    const landmarks = (p) =>
      p.evaluate(() =>
        [...document.querySelectorAll("nav")].map((n) => n.getAttribute("aria-label")).join(", "),
      );
    const refNavs = await landmarks(ref);
    const s = await app.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      main: document.querySelectorAll("main").length,
      footer: document.querySelectorAll("footer").length,
      navs: [...document.querySelectorAll("nav")]
        .map((n) => n.getAttribute("aria-label"))
        .join(", "),
      ids: [...document.querySelectorAll("[id]")]
        .map((e) => e.id)
        .filter((id, i, a) => a.indexOf(id) !== i),
    }));
    check(
      "lang=en, one <main>, one <footer>, same labelled navigation landmarks as V21",
      s.lang === "en" && s.main === 1 && s.footer === 1 && s.navs === refNavs,
      `${JSON.stringify(s)} V21 navs: ${refNavs}`,
    );
    check(
      "page title has no design-preview wording",
      /^Faizan Ali/.test(s.title) && !/preview|demo/i.test(s.title),
      s.title,
    );
    check("no duplicate ids", s.ids.length === 0, s.ids.join(", "));
    await ref.context().close();
    await app.context().close();
  }

  console.log("\n=== 2. Links and in-page targets ===");
  {
    const [ref, app] = [await open(b, REF), await open(b, APP)];
    const links = (p) =>
      p.evaluate(() =>
        [...document.querySelectorAll("a[href]")]
          .filter((a) => !a.closest(".mobile-drawer"))
          .map((a) => ({
            text: a.textContent
              .replace(/\(opens in a new tab\)/g, "")
              .replace(/\s+/g, " ")
              .trim(),
            href: a.getAttribute("href"),
            target: a.target,
            rel: a.rel,
          })),
      );
    const [rl, al] = [await links(ref), await links(app)];
    const internal = al.filter((l) => !/^https?:|^mailto:/.test(l.href));
    check(
      `all ${internal.length} internal links use known routes or in-page targets`,
      internal.every((l) => ROUTES.includes(l.href)),
      internal
        .filter((l) => !ROUTES.includes(l.href))
        .map((l) => l.href)
        .join(", "),
    );
    const external = al.filter((l) => /^https?:/.test(l.href));
    check(
      `all ${external.length} external links open in a new tab with rel="noopener noreferrer"`,
      external.every((l) => l.target === "_blank" && l.rel === "noopener noreferrer"),
      external.map((l) => l.href).join(", "),
    );
    check(
      "only approved external sites (GitHub profile, AlphaSoft360, Aman Bank)",
      external.every((l) =>
        [
          "https://github.com/faizandevx",
          "https://www.alphasoft360.com/",
          "https://www.aman-bank.com/",
        ].includes(l.href),
      ),
      external.map((l) => l.href).join(", "),
    );
    const mapped = rl.map((l) => ({ ...l, href: V21_ROUTE[l.href] ?? l.href }));
    const key = (l) => `${l.text} -> ${l.href}`;
    const expected = mapped.map(key);
    const actual = al
      .filter(
        (l) => !["https://www.alphasoft360.com/", "https://www.aman-bank.com/"].includes(l.href),
      )
      .map(key);
    check(
      `same ${actual.length} links in the same order as V21 (plus the 2 approved employer links)`,
      JSON.stringify(expected) === JSON.stringify(actual),
      expected
        .filter((k, i) => k !== actual[i])
        .slice(0, 3)
        .join(" | "),
    );
    const targets = await app.evaluate(() =>
      ["home-about", "home-skills", "hero", "home-work", "home-contact"].filter(
        (id) => !document.getElementById(id),
      ),
    );
    check(
      "in-page targets exist (#hero, #home-about, #home-work, #home-skills, #home-contact)",
      targets.length === 0,
      targets.join(", "),
    );
    await ref.context().close();
    await app.context().close();
  }

  console.log("\n=== 3. Keyboard order and focus indicators (1440 and 390) ===");
  for (const width of [1440, 390]) {
    const order = async (p) => {
      const stops = [];
      await p.evaluate(() => {
        document.activeElement?.blur();
        scrollTo(0, 0);
      });
      for (let i = 0; i < 120; i++) {
        await p.keyboard.press("Tab");
        // Focus scrolls the page, which slides the floating header in or out; let
        // that scroll-driven state settle so both pages are read the same way.
        await p.waitForTimeout(120);
        const s = await p.evaluate(() => {
          const e = document.activeElement;
          if (!e || e === document.body) return null;
          // A full cycle ends when focus comes back to an element already visited
          // (element identity, not its name: both headers have the same brand link).
          window.__tabSeen ??= new WeakSet();
          if (window.__tabSeen.has(e)) return { done: true };
          window.__tabSeen.add(e);
          const c = getComputedStyle(e),
            r = e.getBoundingClientRect();
          const name = (e.getAttribute("aria-label") || e.textContent)
            .replace(/\(opens in a new tab\)/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 40);
          const region = e.closest(".hero-header")
            ? "hero-header"
            : e.closest(".floating-header")
              ? "floating-header"
              : e.closest("footer")
                ? "footer"
                : e.closest("main")
                  ? "main"
                  : "other";
          return {
            id: `${region} ${e.tagName.toLowerCase()} "${name}"`,
            visible: r.width > 0 && r.height > 0 && c.visibility !== "hidden",
            hiddenAncestor: !!e.closest("[inert], [aria-hidden=true]"),
            outline: `${c.outlineStyle} ${c.outlineWidth}`,
          };
        });
        if (!s || s.done) break;
        stops.push(s);
      }
      return stops;
    };
    const [ref, app] = [await open(b, REF, { width }), await open(b, APP, { width })];
    // Approved accessible-name change (CLAUDE.md, change 8), applied to V21 before reading.
    await ref.evaluate(() =>
      document
        .querySelector(".whatsapp-preview-trigger")
        .setAttribute("aria-label", "Let's Chat on WhatsApp (coming soon)"),
    );
    const [ro, ao] = [await order(ref), await order(app)];
    const approved = ['main a "AlphaSoft360"', 'main a "Aman Bank"'];
    const appIds = ao.map((s) => s.id).filter((id) => !approved.includes(id));
    const refIds = ro.map((s) => s.id);
    check(
      `@${width}: same ${ao.length}-stop Tab order as V21 (plus the 2 employer links)`,
      JSON.stringify(refIds) === JSON.stringify(appIds),
      refIds
        .filter((id, i) => id !== appIds[i])
        .slice(0, 3)
        .join(" | ") +
        " vs " +
        appIds
          .filter((id, i) => id !== refIds[i])
          .slice(0, 3)
          .join(" | "),
    );
    check(
      `@${width}: every Tab stop is visible and none is inside an inert / aria-hidden region`,
      ao.every((s) => s.visible && !s.hiddenAncestor),
      ao
        .filter((s) => !s.visible || s.hiddenAncestor)
        .map((s) => s.id)
        .join(", "),
    );
    check(
      `@${width}: every Tab stop shows a focus outline`,
      ao.every((s) => s.outline !== "none 0px" && !s.outline.startsWith("none")),
      ao
        .filter((s) => s.outline.startsWith("none"))
        .map((s) => s.id)
        .join(", "),
    );
    await ref.context().close();
    await app.context().close();
  }

  console.log("\n=== 4. Accessibility (axe, WCAG 2.1 A/AA), whole page ===");
  for (const theme of ["dark", "light"])
    for (const width of [1440, 768, 390]) {
      const res = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        // V21 is read as designed (no approved changes), for reference only.
        const q = await open(b, url, { width, theme, raw: url === REF });
        const r = await new AxeBuilder({ page: q }).withTags(AXE_TAGS).analyze();
        res[k] = r.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target.join(" ")),
        }));
        await q.context().close();
      }
      const fmt = (list) => list.map((v) => `${v.id}(${v.nodes.length})`).join(", ") || "none";
      // Phase 6: the app must have no violations at all.
      check(
        `${theme} @${width}: zero accessibility violations`,
        res.app.length === 0,
        `app [${fmt(res.app)}] V21 as designed [${fmt(res.ref)}]${res.app.length ? " — " + res.app.map((v) => v.id + " " + v.nodes.join(" ; ")).join(" | ") : ""}`,
      );
    }

  console.log("\n=== 5. Animations and transitions, whole page ===");
  for (const motion of ["no-preference", "reduce"]) {
    const collect = (p) =>
      p.evaluate(() => {
        const out = [];
        for (const e of document.querySelectorAll("body *")) {
          // The WhatsApp modal only exists while open in the app (V21 keeps it hidden in
          // the page); the contact suite compares it opened. next-route-announcer is
          // Next.js's invisible screen-reader route announcer (framework, not design).
          if (
            e.closest(
              ".about-company-link, .sr-only, .whatsapp-preview-backdrop, nextjs-portal, next-route-announcer, script, style",
            )
          )
            continue;
          const c = getComputedStyle(e);
          const anim =
            c.animationName !== "none"
              ? `${c.animationName} ${c.animationDuration} ${c.animationIterationCount}`
              : "";
          const tr = c.transitionDuration.split(",").some((d) => parseFloat(d) > 0)
            ? `${c.transitionProperty} ${c.transitionDuration}`
            : "";
          // Approved modifier classes (approved-changes.css) are left out of the key.
          const classes = [...e.classList].filter(
            (c) => !["home-section-label", "photo-label-muted"].includes(c),
          );
          if (anim || tr)
            out.push(`${e.tagName.toLowerCase()}.${classes.join(".")} ${anim} | ${tr}`);
        }
        return out.sort();
      });
    const [ref, app] = [await open(b, REF, { motion }), await open(b, APP, { motion })];
    const [ra, aa] = [await collect(ref), await collect(app)];
    const missing = ra.filter((x) => !aa.includes(x)),
      added = aa.filter((x) => !ra.includes(x));
    check(
      `${motion} motion: same ${aa.length} animated / transitioning elements as V21`,
      missing.length === 0 && added.length === 0,
      `missing: ${missing.slice(0, 3).join(" ; ")} added: ${added.slice(0, 3).join(" ; ")}`,
    );
    await ref.context().close();
    await app.context().close();
  }

  console.log("\n=== 6. Responsive layout and console, 8 widths x 2 themes ===");
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const app = await open(b, APP, { width, theme });
      for (let y = 0; y < 12; y++) {
        await app.mouse.wheel(0, 700);
        await app.waitForTimeout(60);
      }
      await app.waitForTimeout(400);
      const s = await app.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        atBottom: Math.abs(scrollY + innerHeight - document.documentElement.scrollHeight) < 2,
        floating: document.querySelector(".floating-header").classList.contains("visible"),
      }));
      check(
        `${theme} @${width}: no horizontal overflow, scrolls to the footer with the floating header, no console errors`,
        s.overflow <= 0 && s.atBottom && s.floating && app.errs.length === 0,
        `${JSON.stringify(s)} ${app.errs.join(" | ")}`,
      );
      await app.context().close();
    }

  console.log("\n=== 7. Phase 6 accessibility fixes (app) ===");
  // Contrast of orange-family text against the solid colour behind it (ancestor
  // backgrounds composited; element opacity included). Large text: 24px+, or 18.66px+
  // bold (WCAG 2.1: 3:1); otherwise 4.5:1. Elements marked data-scan-target are flagged.
  const SCAN = () => {
    const parse = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1]
        .split(/[ ,/]+/)
        .filter(Boolean)
        .map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
    };
    const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
    const over = (t, u) => ({
      r: t.r * t.a + u.r * (1 - t.a),
      g: t.g * t.a + u.g * (1 - t.a),
      b: t.b * t.a + u.b * (1 - t.a),
      a: 1,
    });
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest("script, style, svg, nextjs-portal, .sr-only, [aria-hidden=true]")) continue;
      const text = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join("")
        .trim();
      if (!text) continue;
      const c = getComputedStyle(el);
      if (el.getBoundingClientRect().width === 0 || c.visibility === "hidden") continue;
      const fg = parse(c.color);
      if (!fg || !(fg.r > 150 && fg.r - fg.b > 90 && fg.g < fg.r - 40)) continue;
      const layers = [];
      let opacity = 1;
      for (let e = el; e; e = e.parentElement) {
        const s = getComputedStyle(e);
        opacity *= Number(s.opacity);
        const bg = parse(s.backgroundColor);
        if (bg && bg.a > 0 && !layers.some((l) => l.a >= 1)) layers.push(bg);
      }
      let base = parse(getComputedStyle(document.body).backgroundColor);
      for (const l of layers.reverse()) base = over(l, base);
      const shown = over({ ...fg, a: fg.a * opacity }, base);
      const [x, y] = [lum(shown), lum(base)];
      const ratio = (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      const size = parseFloat(c.fontSize);
      const large = size >= 24 || (size >= 18.66 && Number(c.fontWeight) >= 700);
      out.push({
        inTarget: !!el.closest("[data-scan-target]"),
        sel: `${el.tagName.toLowerCase()}.${[...el.classList].join(".")} "${text.slice(0, 20)}"`,
        ratio: +ratio.toFixed(2),
        need: large ? 3 : 4.5,
      });
    }
    return out;
  };
  for (const theme of ["light", "dark"])
    for (const width of [1440, 768, 390]) {
      const q = await open(b, APP, { width, theme });
      const scan = await q.evaluate(SCAN);
      const bad = scan.filter((s) => s.ratio < s.need);
      const low = [...scan].sort((m, n) => m.ratio / m.need - n.ratio / n.need)[0];
      check(
        `${theme} @${width}: all ${scan.length} orange text elements meet WCAG AA contrast`,
        scan.length > 0 && bad.length === 0,
        bad.length
          ? bad.map((s) => `${s.sel} ${s.ratio}:1 < ${s.need}`).join(" | ")
          : `lowest ${low.sel} ${low.ratio}:1 (needs ${low.need})`,
      );
      await q.context().close();
    }
  for (const theme of ["light", "dark"]) {
    const q = await open(b, APP, { theme });
    const readings = [];
    for (const sel of [
      ".about-company-link",
      ".mini-ai-question:nth-child(2)",
      ".hero-learn-more",
      ".link-inline",
      ".tech-v16-tags span",
    ])
      for (const mode of ["hover", "focus"]) {
        const loc = q.locator(sel).first();
        await loc.scrollIntoViewIfNeeded();
        if (mode === "hover") await loc.hover();
        else {
          await q.mouse.move(1, 1);
          await loc.evaluate((e) => e.focus());
        }
        await q.waitForTimeout(250);
        await loc.evaluate((e) => e.setAttribute("data-scan-target", ""));
        readings.push(
          ...(await q.evaluate(SCAN))
            .filter((s) => s.inTarget)
            .map((s) => ({ ...s, state: `${mode} ${sel}` })),
        );
        await loc.evaluate((e) => e.removeAttribute("data-scan-target"));
      }
    const bad = readings.filter((s) => s.ratio < s.need);
    check(
      `${theme}: orange text on hovered / focused links, chips and tags meets AA (${readings.length} readings)`,
      readings.length >= 9 && bad.length === 0,
      bad.map((s) => `${s.state}: ${s.sel} ${s.ratio}:1`).join(" | ") ||
        readings.map((s) => `${s.state} ${s.ratio}`).join(", "),
    );
    await q.context().close();
  }
  {
    const tokens = async (url, theme, raw) => {
      const q = await open(b, url, { theme, raw });
      const t = await q.evaluate(() => ({
        text: getComputedStyle(document.querySelector("#home-work .eyebrow")).color,
        dots: [".orange-dot", ".caption-dot", ".tech-v16-live-dot", ".mini-ai-footer-dot"]
          .map((s) => getComputedStyle(document.querySelector(s)).backgroundColor)
          .join(" "),
        avatar: getComputedStyle(document.querySelector(".avatar-circle svg")).stroke,
        underline: getComputedStyle(
          document.querySelector(".nav-links a.current .nav-label") ||
            document.querySelector(".nav-links a"),
          "::after",
        ).backgroundImage,
      }));
      await q.context().close();
      return t;
    };
    const [appLight, v21Light, appDark, v21Dark] = [
      await tokens(APP, "light"),
      await tokens(REF, "light", true),
      await tokens(APP, "dark"),
      await tokens(REF, "dark", true),
    ];
    check(
      "light theme: decorative orange (dots, avatar outline, nav underline) keeps V21's #f97338; only text darkens",
      appLight.dots === v21Light.dots &&
        appLight.avatar === v21Light.avatar &&
        appLight.underline === v21Light.underline &&
        appLight.text === "rgb(184, 70, 4)",
      `app ${JSON.stringify(appLight)} V21 ${JSON.stringify(v21Light)}`,
    );
    check(
      "dark theme: orange text and decoration unchanged from V21",
      JSON.stringify(appDark) === JSON.stringify(v21Dark),
      `app ${JSON.stringify(appDark)} V21 ${JSON.stringify(v21Dark)}`,
    );
  }
  {
    const q = await open(b, APP);
    const failed = [];
    q.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
    await q.reload({ waitUntil: "networkidle" });
    const icons = await q.evaluate(() =>
      [...document.querySelectorAll('link[rel~="icon"]')].map((l) => ({
        href: l.getAttribute("href"),
        type: l.type,
        sizes: l.getAttribute("sizes"),
      })),
    );
    const res = icons.length ? await q.request.get(new URL(icons[0].href, APP).href) : null;
    const svg = res ? await res.text() : "";
    check(
      "favicon: one SVG <link rel=icon> with the FA initials and brand gradient; no failed requests",
      icons.length === 1 &&
        icons[0].type === "image/svg+xml" &&
        res.ok() &&
        /image\/svg\+xml/.test(res.headers()["content-type"]) &&
        />FA</.test(svg) &&
        /#ff9f60/.test(svg) &&
        /#f26d36/.test(svg) &&
        failed.length === 0,
      `${JSON.stringify(icons)} ${failed.join(", ")}`,
    );
    const li = await q.evaluate(() => {
      const e = document.querySelector(".footer-reference-icon-pending");
      return {
        role: e.getAttribute("role"),
        label: e.getAttribute("aria-label"),
        focusable: e.tabIndex >= 0,
        link: e.closest("a") !== null || e.hasAttribute("href"),
        svgHidden: e.querySelector("svg").getAttribute("aria-hidden"),
      };
    });
    const tree = await q.locator("footer").ariaSnapshot();
    check(
      "footer LinkedIn (pending): a labelled image (role=img), SVG hidden, not focusable, not a link",
      li.role === "img" &&
        li.label === "LinkedIn profile link will be added after confirmation" &&
        li.svgHidden === "true" &&
        !li.focusable &&
        !li.link &&
        /img "LinkedIn profile link will be added after confirmation"/.test(tree),
      JSON.stringify(li),
    );
    const brand = await q.evaluate(() =>
      [...document.querySelectorAll("a.brand")].map((a) => ({
        name: a.getAttribute("aria-label"),
        text: a.textContent.replace(/\s+/g, " ").trim(),
        href: a.getAttribute("href"),
      })),
    );
    check(
      "brand links: accessible name starts with the visible text 'FA Faizan Ali' and keeps the home destination",
      brand.length === 2 &&
        brand.every(
          (x) =>
            x.text === "FA Faizan Ali." &&
            x.name.startsWith("FA Faizan Ali") &&
            /homepage/.test(x.name) &&
            x.href === "/",
        ),
      JSON.stringify(brand),
    );
    await q.context().close();
  }

  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
