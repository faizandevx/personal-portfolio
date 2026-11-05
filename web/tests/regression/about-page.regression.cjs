// Phase 3: the About page (/about) vs V21 design-reference/about.html.
// Step 3B: hero + "From idea to impact" workflow visual.
// Run with: npm run test:regression (see tests/regression/README.md)
const { AxeBuilder } = require("@axe-core/playwright");
const fs = require("fs");
const { launch, appPage, referencePage, SHOTS_DIR, isReferenceFavicon } = require("./harness.cjs");
const APP = appPage("about"),
  REF = referencePage("about");
const WIDTHS = [1440, 1280, 1024, 900, 768, 620, 390, 360];
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const NO_CHROME = ".note-ribbon{display:none!important} nextjs-portal{display:none!important}";
const NO_HEADERS = ".hero-header,.floating-header{visibility:hidden!important}";
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};

async function open(b, url, o = {}) {
  const ctx = await b.newContext({
    viewport: { width: o.width || 1440, height: o.height || 800 },
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
  await p.addStyleTag({ content: NO_CHROME + (o.css || "") });
  if (url === REF && !o.raw)
    // Approved changes applied to V21 (CLAUDE.md): label without "01 /" at the
    // section-label size; links use the final routes.
    await p.evaluate(() => {
      const label = document.querySelector(".about-v18-hero-inner > .eyebrow");
      label.textContent = label.textContent.replace(/^0\d \/ /, "");
      label.classList.add("about-section-label");
      document
        .querySelectorAll('.inside-hero a[href="projects.html"]')
        .forEach((a) => a.setAttribute("href", "/projects"));
      // Step 3C: section label without "02 /"; AlphaSoft360 (V21: AlphaSoft K60); the
      // story's employer names link to their websites; final routes.
      const journey = document.querySelector("#journey .about-v18-heading-row .eyebrow");
      journey.textContent = journey.textContent.replace(/^0\d \/ /, "");
      journey.classList.add("about-section-label");
      const link = (name, href) =>
        `<a class="about-company-link" href="${href}" target="_blank" rel="noopener noreferrer">${name}<span class="sr-only"> (opens in a new tab)</span></a>`;
      const story = [...document.querySelectorAll("#my-story .about-v18-prose p strong")];
      story.find((s) => s.textContent === "AlphaSoft K60").innerHTML = link(
        "AlphaSoft360",
        "https://www.alphasoft360.com/",
      );
      story.find((s) => s.textContent === "Aman Bank for Commerce & Investment").innerHTML = link(
        "Aman Bank for Commerce &amp; Investment",
        "https://www.aman-bank.com/",
      );
      document
        .querySelectorAll("#journey .about-v18-org")
        .forEach((o) => (o.textContent = o.textContent.replace("AlphaSoft K60", "AlphaSoft360")));
      document
        .querySelectorAll('a[href="experience.html"]')
        .forEach((a) => a.setAttribute("href", "/experience"));
      // Step 3E: the Education note keeps only its first sentence.
      const note = document.querySelector("#education .section-intro");
      note.textContent = note.textContent.replace(/(work\.) .*$/, "$1");
      // Step 3D: section labels without "03 /" - "05 /"; final routes in the CTA.
      for (const s of ["#skills", "#approach", "#education"]) {
        const e = document.querySelector(`${s} .eyebrow`);
        e.textContent = e.textContent.replace(/^0\d \/ /, "");
        e.classList.add("about-section-label");
      }
      for (const [from, to] of [
        ["projects.html", "/projects"],
        ["contact.html", "/contact"],
      ])
        document
          .querySelectorAll(`main a[href="${from}"]`)
          .forEach((a) => a.setAttribute("href", to));
    });
  await p.waitForTimeout(300);
  return p;
}

const serialise = (p) =>
  p.evaluate(() => {
    const out = [];
    const walk = (n, depth) => {
      for (const c of n.childNodes) {
        if (c.nodeType === 3) {
          const t = c.textContent.replace(/[ \t\n]+/g, " ").trim();
          if (t) out.push(`${"  ".repeat(depth)}"${t}"`);
          continue;
        }
        if (c.nodeType !== 1) continue;
        out.push(
          `${"  ".repeat(depth)}<${c.tagName.toLowerCase()} ${[...c.attributes]
            .map((a) => `${a.name}=${a.value}`)
            .sort()
            .join(" ")}>`,
        );
        walk(c, depth + 1);
      }
    };
    const s = document.querySelector(".inside-hero");
    out.push(
      `<section ${[...s.attributes]
        .map((a) => `${a.name}=${a.value}`)
        .sort()
        .join(" ")}>`,
    );
    walk(s.querySelector(".about-v18-hero-inner"), 1);
    return out;
  });

const SEL = [
  ".inside-hero",
  ".about-v18-hero-inner",
  ".about-v18-hero-inner > .eyebrow",
  ".about-v18-hero-grid",
  ".about-v18-hero-grid h1",
  ".about-v18-hero-grid h1 .accent",
  ".about-v18-hero-grid > div:first-child > p",
  ".about-v18-hero-grid strong",
  ".about-v18-hero-actions",
  ".about-v18-hero-actions .btn-primary",
  ".about-v18-hero-actions .btn-secondary",
  ".v21-workflow",
  ".v21-card-top",
  ".v21-card-top strong",
  ".v21-card-top span",
  ".v21-card-top i",
  ".v21-card-main",
  ".v21-connect-arcs",
  ".v21-flow",
  ".step-understand",
  ".step-understand .v21-icon",
  ".step-understand strong",
  ".step-understand small",
  ".v21-arrow",
  ".step-build .v21-icon",
  ".step-coordinate .v21-icon",
  ".step-deliver",
  ".step-deliver .v21-icon",
  ".v21-card-foot",
  ".v21-card-foot svg",
  ".v21-card-foot span",
];
const PROPS = [
  "display",
  "position",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "color",
  "background-color",
  "background-image",
  "border-top-color",
  "border-radius",
  "padding",
  "margin",
  "gap",
  "min-height",
  "max-width",
  "opacity",
  "transform",
  "box-shadow",
  "transition",
  "animation-name",
  "animation-delay",
  "grid-template-columns",
  "white-space",
];
const measure = (p) =>
  p.evaluate(
    ([SEL, PROPS]) => {
      const top = document.querySelector(".inside-hero").getBoundingClientRect().top;
      return SEL.map((s) => {
        const e = document.querySelector(s);
        if (!e) return `${s} MISSING`;
        const r = e.getBoundingClientRect(),
          c = getComputedStyle(e);
        return (
          `${s} box=${[r.x, r.y - top, r.width, r.height].map((v) => Math.round(v * 2) / 2).join(",")} ` +
          PROPS.map((k) => `${k}:${c.getPropertyValue(k)}`).join(";")
        );
      });
    },
    [SEL, PROPS],
  );

async function pixelDiff(b, pngA, pngB) {
  const p = await (await b.newContext()).newPage();
  const r = await p.evaluate(
    async ([a, c]) => {
      const load = (src) =>
        new Promise((res) => {
          const i = new Image();
          i.onload = () => res(i);
          i.src = "data:image/png;base64," + src;
        });
      const [ia, ib] = await Promise.all([load(a), load(c)]);
      if (ia.width !== ib.width || ia.height !== ib.height)
        return { sizeMismatch: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}` };
      const px = (i) => {
        const cv = document.createElement("canvas");
        cv.width = i.width;
        cv.height = i.height;
        const x = cv.getContext("2d");
        x.drawImage(i, 0, 0);
        return x.getImageData(0, 0, i.width, i.height).data;
      };
      const da = px(ia),
        db = px(ib),
        max = 35215 * 0.2 * 0.2;
      let diff = 0,
        exact = 0;
      for (let k = 0; k < da.length; k += 4) {
        const dr = da[k] - db[k],
          dg = da[k + 1] - db[k + 1],
          dbb = da[k + 2] - db[k + 2];
        if (dr || dg || dbb) exact++;
        const y = dr * 0.29889531 + dg * 0.58662247 + dbb * 0.11448223,
          i = dr * 0.59597799 - dg * 0.2741761 - dbb * 0.32180189,
          q = dr * 0.21147017 - dg * 0.52261711 + dbb * 0.31114694;
        if (0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q > max) diff++;
      }
      return { diff, exact, total: da.length / 4 };
    },
    [pngA.toString("base64"), pngB.toString("base64")],
  );
  await p.context().close();
  return r;
}
const fmt = (d) =>
  d.sizeMismatch ||
  `${d.diff} px beyond threshold (${((d.diff / d.total) * 100).toFixed(3)}%), ${d.exact} not byte-identical, of ${d.total}`;
const ok = (d) => !d.sizeMismatch && d.diff / d.total <= 0.01;

(async () => {
  const b = await launch();

  console.log("=== 1. Page, metadata and hero markup ===");
  {
    const [ref, app] = [await open(b, REF), await open(b, APP)];
    const [r, a] = [await serialise(ref), await serialise(app)];
    const diffs = [];
    for (let i = 0; i < Math.max(r.length, a.length); i++)
      if (r[i] !== a[i]) diffs.push(`\n   line ${i}: V21 ${r[i]}\n           app ${a[i]}`);
    check(
      `hero: ${a.length} nodes match V21 node-for-node (tags, all attributes, SVG paths, text)`,
      diffs.length === 0,
      diffs.slice(0, 4).join(""),
    );
    const m = await app.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content,
      h1: document.querySelectorAll("h1").length,
      label: document.querySelector(".about-v18-hero-inner > .eyebrow").innerText,
      labelSize: getComputedStyle(document.querySelector(".about-v18-hero-inner > .eyebrow"))
        .fontSize,
      headers: document.querySelectorAll("header").length,
      structure: [...document.querySelector("main").children]
        .map((e) => `${e.tagName.toLowerCase()}.${e.className}`)
        .join(" "),
    }));
    check(
      "title 'About Faizan Ali | Software Engineer & IT Project Manager'; description without preview wording",
      m.title === "About Faizan Ali | Software Engineer & IT Project Manager" &&
        /Software Engineer and IT Project Manager/.test(m.desc) &&
        !/preview|demo/i.test(m.desc),
      `${m.title} | ${m.desc}`,
    );
    check(
      "label reads ABOUT ME (no '01 /') at the approved 15px; one h1; one hero + one floating header",
      m.label === "ABOUT ME" && m.labelSize === "15px" && m.h1 === 1 && m.headers === 2,
      JSON.stringify(m),
    );
    check(
      "<main> starts with section.inside-hero (V21 structure, hero header inside it)",
      m.structure.startsWith("section.inside-hero") &&
        (await app.evaluate(
          () => !!document.querySelector(".inside-hero[data-header-hero] > header.hero-header"),
        )),
      m.structure,
    );
    check("no console errors or hydration warnings", app.errs.length === 0, app.errs.join(" | "));
    await ref.context().close();
    await app.context().close();
  }

  console.log("\n=== 2. Layout + styles: 8 widths x 2 themes ===");
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const [ref, app] = [
        await open(b, REF, { width, theme }),
        await open(b, APP, { width, theme }),
      ];
      const [r, a] = [await measure(ref), await measure(app)];
      const diffs = r
        .map((x, i) =>
          x === a[i] ? null : `\n   V21 ${x.slice(0, 240)}\n   app ${a[i].slice(0, 240)}`,
        )
        .filter(Boolean);
      check(
        `${theme} @${width}: ${SEL.length} hero elements same position, size and ${PROPS.length} styles`,
        diffs.length === 0,
        diffs.slice(0, 2).join(""),
      );
      await ref.context().close();
      await app.context().close();
    }

  console.log("\n=== 3. Pixels: hero content, 8 widths x 2 themes ===");
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const shots = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        const q = await open(b, url, { width, theme, css: NO_HEADERS });
        shots[k] = await q.locator(".about-v18-hero-inner").screenshot({ animations: "disabled" });
        if (width === 1440 || width === 390)
          fs.writeFileSync(`${SHOTS_DIR}/about-hero-${theme}-${width}-${k}.png`, shots[k]);
        await q.context().close();
      }
      const d = await pixelDiff(b, shots.ref, shots.app);
      check(`${theme} @${width}: hero pixels`, ok(d), fmt(d));
    }

  console.log("\n=== 4. Workflow animation, hover and reduced motion ===");
  for (const motion of ["no-preference", "reduce"]) {
    const read = (p) =>
      p.evaluate(() =>
        [...document.querySelectorAll(".v21-workflow *")]
          .map((e) => {
            const c = getComputedStyle(e);
            return c.animationName === "none"
              ? null
              : `${e.getAttribute("class")}: ${c.animationName} ${c.animationDuration} delay ${c.animationDelay} x${c.animationIterationCount}`;
          })
          .filter(Boolean),
      );
    const [ref, app] = [await open(b, REF, { motion }), await open(b, APP, { motion })];
    const [r, a] = [await read(ref), await read(app)];
    if (motion === "no-preference")
      check(
        "motion: steps reveal staggered 0 / .09 / .18 / .27s, arcs reveal, arrows pulse — same as V21",
        JSON.stringify(r) === JSON.stringify(a) &&
          a.filter((x) => /v21StepReveal/.test(x)).length === 4 &&
          a.filter((x) => /v21ArrowPulse .* xinfinite/.test(x)).length === 3 &&
          a.some((x) => /v21ArcReveal/.test(x)),
        a.join(" | "),
      );
    else
      check(
        "reduced motion: no workflow animation (as V21)",
        a.length === 0 && r.length === 0,
        a.join(" | "),
      );
    await ref.context().close();
    await app.context().close();
  }
  for (const theme of ["dark", "light"]) {
    const imgs = [];
    for (const url of [REF, APP]) {
      const q = await open(b, url, { theme, motion: "no-preference", css: NO_HEADERS });
      await q.waitForTimeout(1600); // let the step reveal finish
      await q.hover(".step-build .v21-icon");
      await q.waitForTimeout(700);
      imgs.push(await q.locator(".v21-workflow").screenshot({ animations: "disabled" }));
      await q.context().close();
    }
    const d = await pixelDiff(b, imgs[0], imgs[1]);
    check(`${theme}: step icon hover lift matches V21`, ok(d), fmt(d));
  }
  {
    const card = (p) =>
      p.evaluate(() => {
        const c = getComputedStyle(document.querySelector(".v21-workflow"));
        return `${c.backgroundColor} ${c.borderTopColor}`;
      });
    const cards = {};
    for (const theme of ["dark", "light"]) {
      const q = await open(b, APP, { theme });
      cards[theme] = await card(q);
      await q.context().close();
    }
    check(
      "workflow card: dark navy #111922 in the dark theme, warm white #FFFDFC in the light theme (V21)",
      /rgb\(17, 25, 34\)/.test(cards.dark) && /rgb\(255, 253, 252\)/.test(cards.light),
      JSON.stringify(cards),
    );
  }

  console.log("\n=== 5. Buttons, navigation, floating header, theme ===");
  for (const width of [1440, 390]) {
    const q = await open(b, APP, { width });
    const nav = await q.evaluate(() =>
      [...document.querySelectorAll('a[aria-current="page"]')].map(
        (a) =>
          `${a.closest("header").className.split(" ")[0]}${a.closest(".mobile-drawer") ? " drawer" : ""}:${a.textContent.trim()}`,
      ),
    );
    check(
      `@${width}: 'About' is the current page in the hero header, floating header and both drawers (Home is not)`,
      nav.length === 4 && nav.every((n) => n.endsWith(":About")),
      nav.join(", "),
    );
    const story = await q.evaluate(() => ({
      href: document.querySelector(".about-v18-hero-actions .btn-primary").getAttribute("href"),
      target: !!document.getElementById("my-story"),
    }));
    await q.click(".about-v18-hero-actions .btn-primary");
    await q.waitForTimeout(400);
    const after = await q.evaluate(() => ({
      hash: location.hash,
      top: Math.round(document.getElementById("my-story").getBoundingClientRect().top),
      max: document.documentElement.scrollHeight - innerHeight,
      y: Math.round(scrollY),
    }));
    check(
      `@${width}: 'Discover my story' goes to #my-story (target exists)`,
      story.href === "#my-story" &&
        story.target &&
        after.hash === "#my-story" &&
        (after.top <= 1 || after.y >= after.max - 1),
      JSON.stringify({ ...story, ...after }),
    );
    await q.context().close();
  }
  {
    const q = await open(b, APP);
    check(
      "'Explore my work' links to /projects (final route)",
      (await q.evaluate(() =>
        document.querySelector(".about-v18-hero-actions .btn-secondary").getAttribute("href"),
      )) === "/projects",
    );
    await q.click(".about-v18-hero-actions .btn-secondary");
    await q.waitForURL("**/projects", { timeout: 5000 }).catch(() => {});
    check(
      "'Explore my work' navigates client-side to /projects",
      q.url().endsWith("/projects"),
      q.url(),
    );
    await q.context().close();
  }
  {
    const q = await open(b, APP);
    const H = await q.evaluate(
      () => document.querySelector(".inside-hero").getBoundingClientRect().height,
    );
    const vis = async (y) => {
      await q.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
      await q.waitForTimeout(250);
      return q.evaluate(() => ({
        floating: document.querySelector(".floating-header").classList.contains("visible"),
        heroInactive: document.querySelector(".hero-header").classList.contains("nav-inactive"),
      }));
    };
    const max = await q.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const SHOW = Math.ceil(H + 8);
    const s1 = await vis(SHOW - 1),
      s2 = await vis(Math.min(SHOW + 200, max)),
      s3 = await vis(0);
    check(
      "floating header slides in after the About hero (-8px threshold) and hides again at the top",
      SHOW <= max ? !s1.floating && s2.floating && s2.heroInactive && !s3.floating : true,
      `hero ${H.toFixed(1)}px, max scroll ${max}; ${JSON.stringify([s1, s2, s3])}`,
    );
    await q.click(".hero-header .cv-btn");
    await q.waitForTimeout(250);
    check(
      "hero header CV button opens the shared CV modal",
      await q.evaluate(() => document.getElementById("cvModal").classList.contains("open")),
    );
    await q.keyboard.press("Escape");
    await q.waitForTimeout(200);
    await q.click(".hero-header .theme-toggle");
    await q.waitForTimeout(250);
    const t = await q.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      card: getComputedStyle(document.querySelector(".v21-workflow")).backgroundColor,
      stored: localStorage.getItem("fa-theme"),
    }));
    check(
      "theme toggle on /about switches to light: workflow card becomes the light card, choice stored",
      t.theme === "light" && /255, 253, 252/.test(t.card) && t.stored === "light",
      JSON.stringify(t),
    );
    await q.context().close();
  }
  {
    const q = await open(b, APP, { width: 390 });
    await q.click(".hero-header .hamburger");
    await q.waitForTimeout(500);
    const d = await q.evaluate(() => ({
      open: document.querySelector(".hero-header .mobile-drawer").classList.contains("open"),
      current: document
        .querySelector('.hero-header .mobile-drawer a[aria-current="page"]')
        ?.textContent.trim(),
    }));
    check(
      "@390: mobile drawer opens with 'About' marked current",
      d.open && d.current === "About",
      JSON.stringify(d),
    );
    await q.context().close();
  }

  console.log("\n=== 6. Accessibility and colour ===");
  for (const theme of ["dark", "light"])
    for (const width of [1440, 768, 390]) {
      const res = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        const q = await open(b, url, { width, theme, raw: url === REF });
        const r = await new AxeBuilder({ page: q }).withTags(AXE_TAGS).analyze();
        res[k] = r.violations.map((v) => `${v.id}(${v.nodes.length})`);
        await q.context().close();
      }
      check(
        `${theme} @${width}: zero accessibility violations`,
        res.app.length === 0,
        `app [${res.app.join(", ") || "none"}] V21 as designed [${res.ref.join(", ") || "none"}]`,
      );
    }
  {
    const colours = {};
    for (const theme of ["dark", "light"]) {
      const q = await open(b, APP, { theme });
      colours[theme] = await q.evaluate(() => ({
        h1Accent: getComputedStyle(document.querySelector(".about-v18-hero-grid h1 .accent")).color,
        label: getComputedStyle(document.querySelector(".about-v18-hero-inner > .eyebrow")).color,
      }));
      await q.context().close();
    }
    check(
      "orange: dark theme V21 #f97338; light theme large accent #e56122, label #b84604 (approved tokens)",
      colours.dark.h1Accent === "rgb(249, 115, 56)" &&
        colours.dark.label === "rgb(249, 115, 56)" &&
        colours.light.h1Accent === "rgb(229, 97, 34)" &&
        colours.light.label === "rgb(184, 70, 4)",
      JSON.stringify(colours),
    );
  }
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const q = await open(b, APP, { width, theme });
      const s = await q.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      check(
        `${theme} @${width}: no horizontal overflow, no console errors`,
        s <= 0 && q.errs.length === 0,
        `overflow ${s}px ${q.errs.join(" | ")}`,
      );
      await q.context().close();
    }

  console.log("\n=== 7. Approved hero spacing refinement (vs V21 as designed) ===");
  {
    const read = (p) =>
      p.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        const label = r(".about-v18-hero-inner > .eyebrow"),
          h1 = r(".about-v18-hero-grid h1"),
          card = r(".v21-workflow"),
          actions = r(".about-v18-hero-actions");
        const h1s = getComputedStyle(document.querySelector(".about-v18-hero-grid h1"));
        return {
          gap: Math.round(h1.top - label.bottom),
          top: Math.round(label.top - card.top),
          bottom: Math.round(card.bottom - actions.bottom),
          stacked: card.top >= actions.bottom,
          card: `${Math.round(card.width)}x${Math.round(card.height)}`,
          h1: `${h1s.fontSize} ${h1s.lineHeight} ${h1s.letterSpacing}`,
        };
      });
    const rows = [];
    for (const width of WIDTHS) {
      const [raw, app] = [await open(b, REF, { width, raw: true }), await open(b, APP, { width })];
      rows.push({ width, v21: await read(raw), app: await read(app) });
      await raw.context().close();
      await app.context().close();
    }
    check(
      "label → heading gap is 22px at all 8 widths (V21: 31px stacked, 63-83px on desktop)",
      rows.every((r) => r.app.gap === 22),
      rows.map((r) => `@${r.width} ${r.v21.gap}→${r.app.gap}`).join(", "),
    );
    const desktop = rows.filter((r) => !r.app.stacked);
    check(
      `desktop (${desktop.map((r) => r.width).join(", ")}): label + text centred against the card (equal space above and below)`,
      desktop.length >= 2 &&
        desktop.every((r) => Math.abs(r.app.top - r.app.bottom) <= 1 && r.app.top >= 0),
      desktop
        .map((r) => `@${r.width} V21 ${r.v21.top}/${r.v21.bottom} → ${r.app.top}/${r.app.bottom}`)
        .join(", "),
    );
    check(
      "workflow card size and heading typography unchanged from V21 at all widths; same stacking breakpoints",
      rows.every(
        (r) =>
          r.app.card === r.v21.card && r.app.h1 === r.v21.h1 && r.app.stacked === r.v21.stacked,
      ),
      rows
        .filter(
          (r) =>
            r.app.card !== r.v21.card || r.app.h1 !== r.v21.h1 || r.app.stacked !== r.v21.stacked,
        )
        .map((r) => `@${r.width} ${JSON.stringify(r)}`)
        .join(" | "),
    );
  }

  console.log("\n=== 8. Step 3C: Story, At a glance, Career journey ===");
  const SECTIONS = ["#my-story", "#journey"];
  const serialiseSection = (p, id) =>
    p.evaluate((id) => {
      const out = [];
      const walk = (n, depth) => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3) {
            const t = c.textContent.replace(/[ \t\n]+/g, " ").trim();
            if (t) out.push(`${"  ".repeat(depth)}"${t}"`);
            continue;
          }
          if (c.nodeType !== 1) continue;
          out.push(
            `${"  ".repeat(depth)}<${c.tagName.toLowerCase()} ${[...c.attributes]
              .map((a) => `${a.name}=${a.value}`)
              .sort()
              .join(" ")}>`,
          );
          walk(c, depth + 1);
        }
      };
      const s = document.querySelector(id);
      out.push(
        `<section ${[...s.attributes]
          .map((a) => `${a.name}=${a.value}`)
          .sort()
          .join(" ")}>`,
      );
      walk(s, 1);
      return out;
    }, id);
  {
    const [ref, app] = [await open(b, REF), await open(b, APP)];
    for (const id of SECTIONS) {
      const [r, a] = [await serialiseSection(ref, id), await serialiseSection(app, id)];
      const diffs = [];
      for (let i = 0; i < Math.max(r.length, a.length); i++)
        if (r[i] !== a[i]) diffs.push(`\n   line ${i}: V21 ${r[i]}\n           app ${a[i]}`);
      check(
        `${id}: ${a.length} nodes match V21 node-for-node (with the approved changes)`,
        diffs.length === 0,
        diffs.slice(0, 4).join(""),
      );
    }
    const t = await app.evaluate(() => {
      const story = document
        .querySelector("#my-story .about-v18-prose p:nth-of-type(2)")
        .cloneNode(true);
      story.querySelectorAll(".sr-only").forEach((e) => e.remove());
      const size = (s) => getComputedStyle(document.querySelector(s)).fontSize;
      return {
        storyText: story.textContent.replace(/\s+/g, " ").trim(),
        orgs: [...document.querySelectorAll("#journey .about-v18-org")].map((e) => e.textContent),
        k60: /K60/.test(document.body.innerText),
        order: [...document.querySelectorAll("main > section")]
          .map((s) => s.id || s.className.split(" ")[0])
          .join(", "),
        labels: [
          ["#my-story .about-v18-prose > .eyebrow", "THE INTRODUCTION"],
          [".about-v18-identity-top .eyebrow", "AT A GLANCE"],
          ["#journey .about-v18-heading-row .eyebrow", "CAREER JOURNEY"],
        ].map(([s]) => `${document.querySelector(s).innerText} ${size(s)}`),
        cardIndex: [...document.querySelectorAll(".about-v18-job-index")].map((e) => e.textContent),
        links: [...document.querySelectorAll("#my-story a, #journey a")].map((a) =>
          `${a.textContent.replace(" (opens in a new tab)", "").replace(/\s+/g, " ").trim()} -> ${a.getAttribute("href")} ${a.target || ""} ${a.rel || ""}`.trim(),
        ),
      };
    });
    check(
      "story reads 'At AlphaSoft360, I worked … at Aman Bank for Commerce & Investment, …'",
      t.storyText.startsWith(
        "At AlphaSoft360, I worked as a Software Developer. I then moved into an IT Project Manager role at Aman Bank for Commerce & Investment, collaborating",
      ),
      t.storyText,
    );
    check(
      "career cards: Aman Bank for Commerce & Investment, AlphaSoft360; no 'AlphaSoft K60' anywhere on the page",
      JSON.stringify(t.orgs) ===
        JSON.stringify(["Aman Bank for Commerce & Investment", "AlphaSoft360"]) && !t.k60,
      JSON.stringify(t.orgs),
    );
    // Step 3D added the remaining sections; the order is V21's.
    check(
      "section order: hero, my-story, journey, skills, approach, education, CTA",
      t.order === "inside-hero, my-story, journey, skills, approach, education, section",
      t.order,
    );
    check(
      "labels: THE INTRODUCTION 11px, AT A GLANCE 11px (unnumbered, unchanged); CAREER JOURNEY 15px (number removed); card labels kept",
      JSON.stringify(t.labels) ===
        JSON.stringify(["THE INTRODUCTION 11px", "AT A GLANCE 11px", "CAREER JOURNEY 15px"]) &&
        JSON.stringify(t.cardIndex) === JSON.stringify(["02 / BANKING", "01 / ENGINEERING"]),
      t.labels.join(", "),
    );
    check(
      "links: employer names open their websites in a new tab; experience links use /experience",
      JSON.stringify(t.links) ===
        JSON.stringify([
          "AlphaSoft360 -> https://www.alphasoft360.com/ _blank noopener noreferrer",
          "Aman Bank for Commerce & Investment -> https://www.aman-bank.com/ _blank noopener noreferrer",
          "View my professional experience↗ -> /experience",
          "Full experience ↗ -> /experience",
        ]),
      t.links.join(" | "),
    );
    await ref.context().close();
    await app.context().close();
  }
  const SEL3C = [
    "#my-story",
    ".about-v18-story-grid",
    ".about-v18-prose",
    ".about-v18-prose > .eyebrow",
    "#my-story h2",
    "#my-story h2 .accent",
    ".about-v18-prose p:nth-of-type(1)",
    ".about-v18-prose p:nth-of-type(2)",
    ".about-v18-prose p:nth-of-type(2) strong:first-child",
    ".about-v18-prose .about-v18-text-link",
    ".about-v18-identity",
    ".about-v18-identity-top",
    ".about-v18-spark",
    ".about-v18-identity h3",
    ".about-v18-identity h3 .accent",
    ".about-v18-identity > p",
    ".about-v18-role-list",
    ".about-v18-role-list > div:nth-child(2)",
    ".about-v18-role-icon",
    ".about-v18-role-list strong",
    ".about-v18-role-list small",
    ".about-v18-identity-note",
    ".about-v18-green-dot",
    "#journey",
    ".about-v18-heading-row",
    "#journey .eyebrow",
    "#journey h2",
    "#journey .section-intro",
    "#journey .about-v18-text-link",
    ".about-v18-journey-grid",
    ".about-v18-job-card",
    ".about-v18-job-card:nth-child(2)",
    ".about-v18-job-top",
    ".about-v18-job-index",
    ".about-v18-date",
    ".about-v18-job-mark",
    ".about-v18-job-card h3",
    ".about-v18-org",
    ".about-v18-job-card p",
    ".about-v18-mini-tags",
    ".about-v18-mini-tags span",
  ];
  const measure3C = (p) =>
    p.evaluate(
      ([SEL, PROPS]) =>
        SEL.map((s) => {
          const e = document.querySelector(s);
          if (!e) return `${s} MISSING`;
          const top = e.closest("section").getBoundingClientRect().top,
            r = e.getBoundingClientRect(),
            c = getComputedStyle(e);
          return (
            `${s} box=${[r.x, r.y - top, r.width, r.height].map((v) => Math.round(v * 2) / 2).join(",")} ` +
            PROPS.map((k) => `${k}:${c.getPropertyValue(k)}`).join(";")
          );
        }),
      [SEL3C, PROPS],
    );
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const [ref, app] = [
        await open(b, REF, { width, theme }),
        await open(b, APP, { width, theme }),
      ];
      const [r, a] = [await measure3C(ref), await measure3C(app)];
      const diffs = r
        .map((x, i) =>
          x === a[i] ? null : `\n   V21 ${x.slice(0, 240)}\n   app ${a[i].slice(0, 240)}`,
        )
        .filter(Boolean);
      check(
        `${theme} @${width}: ${SEL3C.length} story / journey elements same position (within section), size and styles`,
        diffs.length === 0,
        diffs.slice(0, 2).join(""),
      );
      const shots = {};
      for (const [k, q] of [
        ["ref", ref],
        ["app", app],
      ]) {
        await q.addStyleTag({ content: NO_HEADERS });
        shots[k] = {
          story: await q.locator("#my-story").screenshot({ animations: "disabled" }),
          journey: await q.locator("#journey").screenshot({ animations: "disabled" }),
        };
      }
      for (const id of ["story", "journey"]) {
        const d = await pixelDiff(b, shots.ref[id], shots.app[id]);
        check(
          `${theme} @${width}: #${id === "story" ? "my-story" : "journey"} pixels`,
          ok(d),
          fmt(d),
        );
      }
      await ref.context().close();
      await app.context().close();
    }
  for (const theme of ["dark", "light"])
    for (const target of [
      ".about-v18-job-card:nth-child(1)",
      ".about-v18-prose .about-v18-text-link",
      "#journey .about-v18-text-link",
    ]) {
      const imgs = [];
      for (const url of [REF, APP]) {
        const q = await open(b, url, { theme, motion: "no-preference", css: NO_HEADERS });
        await q.locator(target).scrollIntoViewIfNeeded();
        await q.hover(target);
        await q.waitForTimeout(700);
        imgs.push(
          await q
            .locator(
              target.startsWith("#journey") || target.includes("job-card")
                ? "#journey"
                : "#my-story",
            )
            .screenshot({ animations: "disabled" }),
        );
        await q.context().close();
      }
      const d = await pixelDiff(b, imgs[0], imgs[1]);
      check(`${theme} hover ${target} matches V21`, ok(d), fmt(d));
    }
  for (const theme of ["dark", "light"]) {
    const q = await open(b, APP, { theme, motion: "no-preference" });
    const orange = await q.evaluate(
      () => getComputedStyle(document.querySelector("#my-story .about-v18-prose > .eyebrow")).color,
    );
    const link = q.locator("#my-story .about-company-link").first();
    const base = await link.evaluate((e) => getComputedStyle(e).color);
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await q.waitForTimeout(400);
    const hover = await link.evaluate((e) => getComputedStyle(e).color);
    await q.mouse.move(1, 1);
    await q.waitForTimeout(400);
    await link.focus();
    await q.waitForTimeout(400);
    const focus = await link.evaluate((e) => {
      const c = getComputedStyle(e);
      return {
        color: c.color,
        outline: `${c.outlineStyle} ${c.outlineWidth}`,
        transition: c.transition,
      };
    });
    const accent = await q.evaluate(
      () => getComputedStyle(document.querySelector(".about-v18-identity h3 .accent")).color,
    );
    check(
      `${theme}: story employer links — bold text colour at rest, orange on hover and keyboard focus with a 2px outline, 0.22s transition`,
      base !== orange &&
        hover === orange &&
        focus.color === orange &&
        focus.outline === "solid 2px" &&
        /color 0\.22s/.test(focus.transition),
      JSON.stringify({ base, hover, focus }),
    );
    check(
      `${theme}: "One approach." uses the ${theme === "light" ? "large-text orange #e56122" : "V21 orange #f97338"}`,
      accent === (theme === "light" ? "rgb(229, 97, 34)" : "rgb(249, 115, 56)"),
      accent,
    );
    await q.context().close();
  }
  for (const width of [1440, 390]) {
    // The Story section starts where the hero ends, so after the jump the hero's
    // bottom is at 0px: the hero header has faded out and the floating header waits
    // for the -8px threshold, exactly as in V21. The headers must match V21's state.
    const states = {};
    for (const [k, url] of [
      ["ref", REF],
      ["app", APP],
    ]) {
      const q = await open(b, url, { width });
      await q.click(".about-v18-hero-actions .btn-primary");
      await q.waitForTimeout(1700);
      states[k] = await q.evaluate(() => ({
        top: Math.round(document.getElementById("my-story").getBoundingClientRect().top),
        hash: location.hash,
        floating: document.querySelector(".floating-header").classList.contains("visible"),
        heroInactive: document.querySelector(".hero-header").classList.contains("nav-inactive"),
      }));
      await q.context().close();
    }
    check(
      `@${width}: 'Discover my story' lands on the Story section; header state same as V21`,
      states.app.hash === "#my-story" &&
        Math.abs(states.app.top) <= 1 &&
        JSON.stringify(states.app) === JSON.stringify(states.ref),
      `app ${JSON.stringify(states.app)} V21 ${JSON.stringify(states.ref)}`,
    );
  }

  console.log("\n=== 9. Step 3D: Capabilities, Approach, Education, CTA ===");
  const SECTIONS_3D = ["#skills", "#approach", "#education", ".about-v18-cta"];
  {
    const [ref, app] = [await open(b, REF), await open(b, APP)];
    for (const id of SECTIONS_3D) {
      const [r, a] = [await serialiseSection(ref, id), await serialiseSection(app, id)];
      const diffs = [];
      for (let i = 0; i < Math.max(r.length, a.length); i++)
        if (r[i] !== a[i]) diffs.push(`\n   line ${i}: V21 ${r[i]}\n           app ${a[i]}`);
      check(
        `${id}: ${a.length} nodes match V21 node-for-node (with the approved changes)`,
        diffs.length === 0,
        diffs.slice(0, 4).join(""),
      );
    }
    const t = await app.evaluate(() => {
      const size = (s) => getComputedStyle(document.querySelector(s)).fontSize;
      const text = (s) => [...document.querySelectorAll(s)].map((e) => e.textContent);
      return {
        labels: ["#skills", "#approach", "#education", ".about-v18-cta"].map(
          (s) => `${document.querySelector(`${s} .eyebrow`).innerText} ${size(`${s} .eyebrow`)}`,
        ),
        cards: text(".about-v18-skill-card h3"),
        pills: [...document.querySelectorAll(".about-v18-pills")].map((p) => p.children.length),
        steps: text(".about-v18-step-no"),
        degree: [
          ".about-v18-degree-overline",
          ".about-v18-degree h3",
          ".about-v18-degree p",
          ".about-v18-degree .about-v18-date",
        ].map((s) => document.querySelector(s).textContent),
        note: document.querySelector("#education .section-intro").textContent,
        cta: [...document.querySelectorAll(".about-v18-cta a")].map(
          (a) => `${a.textContent} -> ${a.getAttribute("href")}`,
        ),
        numbered: [...document.querySelectorAll("main .eyebrow")]
          .map((e) => e.textContent)
          .filter((x) => /^0\d \//.test(x)),
      };
    });
    check(
      "labels: CAPABILITIES, MY APPROACH, EDUCATION 15px (numbers removed); WHAT'S NEXT? 11px (unnumbered, unchanged); no numbered section label left",
      JSON.stringify(t.labels) ===
        JSON.stringify([
          "CAPABILITIES 15px",
          "MY APPROACH 15px",
          "EDUCATION 15px",
          "WHAT'S NEXT? 11px",
        ]) && t.numbered.length === 0,
      `${t.labels.join(", ")} ${t.numbered.join(", ")}`,
    );
    check(
      "three skill cards with five pills each; approach step numbers 01-03 kept (step design)",
      JSON.stringify(t.cards) ===
        JSON.stringify(["Frontend development", "Backend & data", "Delivery & collaboration"]) &&
        JSON.stringify(t.pills) === "[5,5,5]" &&
        JSON.stringify(t.steps) === JSON.stringify(["01", "02", "03"]),
      JSON.stringify({ cards: t.cards, pills: t.pills, steps: t.steps }),
    );
    check(
      "education: BS Software Engineering, University of Sindh, Jamshoro, 2020 – 2024; note reduced to its first sentence (approved, Step 3E)",
      JSON.stringify(t.degree) ===
        JSON.stringify([
          "UNIVERSITY EDUCATION",
          "BS Software Engineering",
          "University of Sindh, Jamshoro",
          "2020 – 2024",
        ]) && t.note === "The degree most relevant to my professional work.",
      JSON.stringify(t.degree),
    );
    check(
      "CTA links use the final routes: Explore projects -> /projects, Get in touch -> /contact",
      JSON.stringify(t.cta) ===
        JSON.stringify(["Explore projects ↗ -> /projects", "Get in touch ↗ -> /contact"]),
      t.cta.join(" | "),
    );
    await ref.context().close();
    await app.context().close();
  }
  const SEL3D = [
    "#skills",
    "#skills .eyebrow",
    "#skills h2",
    "#skills h2 .accent",
    "#skills .section-intro",
    ".about-v18-skills-grid",
    ".about-v18-skill-card",
    ".about-v18-skill-card:nth-child(3)",
    ".about-v18-category-mark",
    ".about-v18-skill-card h3",
    ".about-v18-skill-card p",
    ".about-v18-pills",
    ".about-v18-pills span",
    ".about-v18-pills span:last-child",
    "#approach",
    "#approach .eyebrow",
    "#approach h2",
    ".about-v18-steps",
    ".about-v18-step",
    ".about-v18-step:nth-child(3)",
    ".about-v18-step-no",
    ".about-v18-step h3",
    ".about-v18-step p",
    "#education",
    ".about-v18-education-grid",
    "#education .eyebrow",
    "#education h2",
    "#education .section-intro",
    ".about-v18-degree",
    ".about-v18-degree-icon",
    ".about-v18-degree-overline",
    ".about-v18-degree h3",
    ".about-v18-degree p",
    ".about-v18-degree .about-v18-date",
    ".about-v18-cta",
    ".about-v18-cta-inner",
    ".about-v18-cta .eyebrow",
    ".about-v18-cta h2",
    ".about-v18-cta h2 .accent",
    ".about-v18-cta p",
    ".about-v18-cta-actions",
    ".about-v18-cta .btn-primary",
    ".about-v18-cta .btn-secondary",
  ];
  const measure3D = (p) =>
    p.evaluate(
      ([SEL, PROPS]) =>
        SEL.map((s) => {
          const e = document.querySelector(s);
          if (!e) return `${s} MISSING`;
          const top = e.closest("section").getBoundingClientRect().top,
            r = e.getBoundingClientRect(),
            c = getComputedStyle(e);
          return (
            `${s} box=${[r.x, r.y - top, r.width, r.height].map((v) => Math.round(v * 2) / 2).join(",")} ` +
            PROPS.map((k) => `${k}:${c.getPropertyValue(k)}`).join(";")
          );
        }),
      [SEL3D, PROPS],
    );
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const [ref, app] = [
        await open(b, REF, { width, theme }),
        await open(b, APP, { width, theme }),
      ];
      const [r, a] = [await measure3D(ref), await measure3D(app)];
      const diffs = r
        .map((x, i) =>
          x === a[i] ? null : `\n   V21 ${x.slice(0, 240)}\n   app ${a[i].slice(0, 240)}`,
        )
        .filter(Boolean);
      check(
        `${theme} @${width}: ${SEL3D.length} capabilities / approach / education / CTA elements same position (within section), size and styles`,
        diffs.length === 0,
        diffs.slice(0, 2).join(""),
      );
      const shots = { ref: [], app: [] };
      for (const [k, q] of [
        ["ref", ref],
        ["app", app],
      ]) {
        await q.addStyleTag({ content: NO_HEADERS });
        for (const id of SECTIONS_3D)
          shots[k].push(await q.locator(id).screenshot({ animations: "disabled" }));
      }
      for (const [i, id] of SECTIONS_3D.entries()) {
        const d = await pixelDiff(b, shots.ref[i], shots.app[i]);
        check(`${theme} @${width}: ${id} pixels`, ok(d), fmt(d));
      }
      await ref.context().close();
      await app.context().close();
    }
  for (const theme of ["dark", "light"])
    for (const [target, section] of [
      [".about-v18-skill-card:nth-child(1)", "#skills"],
      [".about-v18-cta .btn-primary", ".about-v18-cta"],
      [".about-v18-cta .btn-secondary", ".about-v18-cta"],
    ]) {
      const imgs = [];
      for (const url of [REF, APP]) {
        const q = await open(b, url, { theme, motion: "no-preference", css: NO_HEADERS });
        await q.locator(target).scrollIntoViewIfNeeded();
        await q.hover(target);
        await q.waitForTimeout(700);
        imgs.push(await q.locator(section).screenshot({ animations: "disabled" }));
        await q.context().close();
      }
      const d = await pixelDiff(b, imgs[0], imgs[1]);
      check(`${theme} hover ${target} matches V21`, ok(d), fmt(d));
    }
  {
    // The skill-card lift is turned off for reduced motion, as in V21.
    const res = {};
    for (const motion of ["no-preference", "reduce"]) {
      const q = await open(b, APP, { motion });
      res[motion] = await q.evaluate(
        () => getComputedStyle(document.querySelector(".about-v18-skill-card")).transitionDuration,
      );
      await q.context().close();
    }
    check(
      "skill-card transition: 0.28s with motion, none for reduced motion",
      res["no-preference"] === "0.28s, 0.28s" && res.reduce === "0s",
      JSON.stringify(res),
    );
  }
  {
    const colours = {};
    for (const theme of ["dark", "light"]) {
      const q = await open(b, APP, { theme });
      colours[theme] = await q.evaluate(() =>
        [
          "#skills .eyebrow",
          ".about-v18-step-no",
          ".about-v18-degree-overline",
          ".about-v18-category-mark",
          "#education h2 .accent",
          ".about-v18-cta h2 .accent",
        ].map((s) => getComputedStyle(document.querySelector(s)).color),
      );
      await q.context().close();
    }
    const [o, large, v21] = ["rgb(184, 70, 4)", "rgb(229, 97, 34)", "rgb(249, 115, 56)"];
    check(
      "orange text: dark theme V21 #f97338; light theme #b84604 for small text, #e56122 for h2 accents",
      colours.dark.every((c) => c === v21) &&
        JSON.stringify(colours.light) === JSON.stringify([o, o, o, o, large, large]),
      JSON.stringify(colours),
    );
  }
  for (const width of [1440, 390]) {
    // The footer "Education" link, from the homepage and from /about itself, lands on
    // the Education section exactly where V21 lands.
    for (const from of ["home", "about"]) {
      const tops = {};
      for (const [k, url] of [
        ["ref", from === "home" ? referencePage("index") : REF],
        ["app", from === "home" ? appPage("") : APP],
      ]) {
        const q = await open(b, url, { width });
        const link = q.locator(".site-footer a", { hasText: /^Education/ }).first();
        tops[`${k}Href`] = await link.getAttribute("href");
        await Promise.all([q.waitForURL(/#education$/), link.click()]);
        await q.waitForLoadState("networkidle");
        await q.waitForTimeout(1500);
        tops[k] = await q.evaluate(() =>
          Math.round(document.getElementById("education").getBoundingClientRect().top),
        );
        tops[`${k}Url`] = new URL(q.url()).pathname + new URL(q.url()).hash;
        await q.context().close();
      }
      check(
        `@${width}: footer Education link from ${from === "home" ? "/" : "/about"} lands on /about#education where V21 lands`,
        tops.appHref === "/about#education" &&
          tops.appUrl === "/about#education" &&
          Math.abs(tops.app - tops.ref) <= 1,
        JSON.stringify(tops),
      );
    }
  }

  console.log("\n=== 10. Step 3E: whole page ===");
  // Section transitions: every section's page position, height and padding, plus the
  // footer, and a full-page screenshot, against V21 at 8 widths x 2 themes.
  const bounds = (p) =>
    p.evaluate(() =>
      [...document.querySelectorAll("main > section"), document.querySelector(".site-footer")].map(
        (s) => {
          const r = s.getBoundingClientRect(),
            c = getComputedStyle(s);
          return `${s.id || s.className.split(" ")[0]} y=${Math.round((r.top + scrollY) * 2) / 2} h=${Math.round(r.height * 2) / 2} pad=${c.paddingTop}/${c.paddingBottom}`;
        },
      ),
    );
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const [ref, app] = [
        await open(b, REF, { width, theme }),
        await open(b, APP, { width, theme }),
      ];
      const [r, a] = [await bounds(ref), await bounds(app)];
      const diffs = r.map((x, i) => (x === a[i] ? null : `V21 ${x} | app ${a[i]}`)).filter(Boolean);
      check(
        `${theme} @${width}: all ${a.length} sections and the footer at the same page position, height and padding as V21`,
        diffs.length === 0 && a.length === 8,
        diffs.join(" ;; "),
      );
      const shots = [];
      for (const q of [ref, app]) {
        await q.addStyleTag({ content: NO_HEADERS });
        shots.push(await q.screenshot({ fullPage: true, animations: "disabled" }));
      }
      const d = await pixelDiff(b, shots[0], shots[1]);
      check(`${theme} @${width}: full-page pixels`, ok(d), fmt(d));
      await ref.context().close();
      await app.context().close();
    }
  // V21 file links in the same form as the app's routes, for comparing Tab stops.
  const route = (h) =>
    h
      .replace(/^index\.html/, "/")
      .replace(/^([a-z-]+)\.html/, "/$1")
      .replace(/^\/\//, "/");
  for (const width of [1440, 390]) {
    const seqs = {};
    for (const [k, url] of [
      ["ref", REF],
      ["app", APP],
    ]) {
      const q = await open(b, url, { width });
      const seq = [];
      for (let i = 0; i < 80; i++) {
        await q.keyboard.press("Tab");
        const f = await q.evaluate(() => {
          const e = document.activeElement;
          if (!e || e === document.body) return null;
          const c = getComputedStyle(e),
            r = e.getBoundingClientRect();
          return {
            label: (e.getAttribute("aria-label") || e.innerText || "").replace(/\s+/g, " ").trim(),
            tag: e.tagName.toLowerCase(),
            href: e.getAttribute("href") || "",
            ring: c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0,
            inView: r.bottom > 0 && r.top < innerHeight,
            hidden: !!e.closest("[inert], [aria-hidden='true']"),
          };
        });
        if (!f || (seq.length && f.label === seq[0].label && f.href === seq[0].href)) break;
        seq.push(f);
      }
      seqs[k] = seq.map((f) => ({
        ...f,
        href: k === "ref" ? route(f.href) : f.href,
        // Phase 6 (approved): the brand link's accessible name.
        label:
          k === "ref" && f.label === "Faizan Ali home" ? "FA Faizan Ali, go to homepage" : f.label,
      }));
      await q.context().close();
    }
    const key = (f) => `${f.tag} "${f.label}" ${f.href}`;
    const [r, a] = [seqs.ref.map(key), seqs.app.map(key)];
    const bad = seqs.app.filter((f) => !f.ring || !f.inView || f.hidden).map(key);
    check(
      `@${width}: keyboard - ${a.length} Tab stops in V21's order (header, hero, story, journey, CTA, footer); each has a visible focus outline, scrolls into view and is not hidden`,
      JSON.stringify(r) === JSON.stringify(a) && bad.length === 0 && a.length >= 20,
      r
        .map((x, i) => (x === a[i] ? null : `${i}: V21 ${x} | app ${a[i]}`))
        .filter(Boolean)
        .concat(bad.map((x) => `no ring / hidden: ${x}`))
        .join(" ;; "),
    );
  }
  {
    const states = {};
    for (const [k, url] of [
      ["ref", REF],
      ["app", APP],
    ]) {
      const q = await open(b, url, { width: 390 });
      const read = () =>
        q.evaluate(() => ({
          open: document.querySelector(".hero-header .mobile-drawer").classList.contains("open"),
          expanded: document.querySelector(".hero-header .hamburger").getAttribute("aria-expanded"),
          menuOpen: document.body.classList.contains("menu-open"),
          focus:
            document.activeElement === document.body
              ? "body"
              : document.activeElement.textContent.trim().slice(0, 20),
        }));
      await q.focus(".hero-header .hamburger");
      await q.keyboard.press("Enter");
      await q.waitForTimeout(500);
      const opened = await read();
      await q.keyboard.press("Tab");
      const tabbed = await read();
      await q.keyboard.press("Escape");
      await q.waitForTimeout(500);
      states[k] = { opened, tabbed, closed: await read() };
      await q.context().close();
    }
    const s = states.app;
    check(
      "@390: mobile drawer by keyboard - Enter opens it, Tab reaches its links, Escape closes it (focus returns to the page, as in V21); same states as V21",
      s.opened.open &&
        s.opened.expanded === "true" &&
        s.opened.menuOpen &&
        s.tabbed.focus === "Home" &&
        !s.closed.open &&
        s.closed.expanded === "false" &&
        !s.closed.menuOpen &&
        JSON.stringify(states.app) === JSON.stringify(states.ref),
      `app ${JSON.stringify(states.app)} V21 ${JSON.stringify(states.ref)}`,
    );
  }
  for (const motion of ["no-preference", "reduce"]) {
    // Every animation and transition on the page, against V21.
    const read = (p) =>
      p.evaluate(() =>
        [...document.querySelectorAll("main *")]
          .map((e) => {
            const c = getComputedStyle(e);
            const moving =
              c.animationName !== "none" ||
              c.transitionDuration.split(",").some((x) => parseFloat(x) > 0);
            return moving
              ? `${e.getAttribute("class") || e.tagName}: ${c.animationName} ${c.animationDuration} / ${c.transitionProperty} ${c.transitionDuration}`
              : null;
          })
          .filter(Boolean),
      );
    const [ref, app] = [await open(b, REF, { motion }), await open(b, APP, { motion })];
    const [r, a] = [await read(ref), await read(app)];
    // Reduced motion: nothing may animate or transition for longer than 1ms.
    const extra =
      motion === "reduce"
        ? await app.evaluate(() =>
            [...document.querySelectorAll("main *")]
              .filter((e) => {
                const c = getComputedStyle(e);
                return (
                  c.animationName !== "none" ||
                  c.transitionDuration.split(",").some((x) => parseFloat(x) > 0.001)
                );
              })
              .map((e) => e.getAttribute("class") || e.tagName),
          )
        : [];
    check(
      motion === "reduce"
        ? `reduced motion: no animations anywhere on the page; transitions at V21's near-zero duration (${a.length} elements, same as V21)`
        : `motion: the same ${a.length} animated / transitioning elements as V21`,
      JSON.stringify(r) === JSON.stringify(a) && extra.length === 0,
      extra.slice(0, 5).join(" | "),
    );
    await ref.context().close();
    await app.context().close();
  }
  {
    // Every link on the page: built routes respond, in-page anchors exist, and the
    // only unfinished destinations are the documented later-phase pages.
    const q = await open(b, APP);
    const hrefs = await q.evaluate(() => [
      ...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"))),
    ]);
    const res = [];
    for (const h of hrefs) {
      if (/^(https?|mailto):/.test(h)) continue;
      if (h === "#cv-preview") {
        res.push(
          `${h} cv-trigger:${await q.evaluate(() => [...document.querySelectorAll('a[href="#cv-preview"]')].every((a) => a.classList.contains("cv-trigger")))}`,
        );
        continue;
      }
      const u = new URL(h, APP);
      const page = await q.request.get(u.origin + u.pathname);
      const id = u.hash.slice(1);
      res.push(
        `${h} ${page.status()}${id ? ` #${id}:${(await page.text()).includes(`id="${id}"`)}` : ""}`,
      );
    }
    await q.context().close();
    const expected = [
      "/ 200",
      "/about 200",
      "/projects 404",
      "/experience 404",
      "/contact 404",
      "/faq 404",
      "#cv-preview cv-trigger:true",
      "#my-story 200 #my-story:true",
      "/#home-skills 200 #home-skills:true",
      "/about#education 200 #education:true",
    ];
    check(
      "routes: /, /about and every anchor work; /projects, /experience (Phase 4), /contact, /faq (Phase 5) are the only unfinished destinations",
      JSON.stringify(res) === JSON.stringify(expected),
      res.join(" | "),
    );
  }

  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
