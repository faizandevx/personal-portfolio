// Phase 2 Step 2A: home hero vs V21.
// Run with: npm run test:regression (see tests/regression/README.md)
const { launch, APP_URL, REFERENCE_URL, SHOTS_DIR, isReferenceFavicon } = require("./harness.cjs");
const fs = require("fs");
const APP = APP_URL,
  REF = REFERENCE_URL;
const SHOTS = SHOTS_DIR;
const WIDTHS = [1440, 1280, 1024, 900, 768, 620, 390, 360];
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};

async function open(b, url, o = {}) {
  const ctx = await b.newContext({
    viewport: { width: o.width || 1440, height: o.height || 800 },
    reducedMotion: o.motion || "reduce",
  });
  if (o.theme) await ctx.addInitScript((t) => localStorage.setItem("fa-theme", t), o.theme);
  const p = await ctx.newPage();
  p.errs = [];
  p.on("console", (m) => {
    if (["error", "warning"].includes(m.type()) && !isReferenceFavicon(m)) p.errs.push(m.text());
  });
  p.on("pageerror", (e) => p.errs.push(e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  // Review ribbon (reference only) and the Next dev-tools badge (dev only) are not part of the design.
  await p.addStyleTag({
    content: ".note-ribbon{display:none!important} nextjs-portal{display:none!important}",
  });
  await p.waitForTimeout(300);
  return p;
}

// Elements removed on purpose from the V21 photo panel (approved in Step 2A).
const REMOVED = ["#portraitImage", ".photo-sub", ".photo-btn", "#photoInput", ".photo-tag"];

// Serialise the hero content (everything in #hero except the shared header).
const serialise = (p, isRef) =>
  p.evaluate(
    ([isRef, REMOVED]) => {
      const root = document.getElementById("hero").cloneNode(true);
      root.querySelector(":scope > header")?.remove();
      if (isRef) REMOVED.forEach((s) => root.querySelectorAll(s).forEach((e) => e.remove()));
      const ATTRS = [
        "class",
        "href",
        "target",
        "rel",
        "title",
        "aria-label",
        "aria-hidden",
        "type",
        "viewBox",
        "width",
        "height",
        "fill",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "d",
        "transform",
        "cx",
        "cy",
        "r",
        "x",
        "y",
        "style",
      ];
      const out = [];
      const walk = (n, depth) => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3) {
            const t = c.textContent.replace(/\s+/g, " ").trim();
            if (t) out.push(`${"  ".repeat(depth)}"${t}"`);
            continue;
          }
          if (c.nodeType !== 1) continue;
          const attrs = ATTRS.filter((a) => c.hasAttribute(a)).map((a) => {
            let v = c.getAttribute(a);
            if (a === "href") v = v.replace(/^about\.html$/, "/about");
            if (a === "style") v = v.replace(/\s|;$/g, "");
            return `${a}=${v}`;
          });
          out.push(`${"  ".repeat(depth)}<${c.tagName.toLowerCase()} ${attrs.join(" ")}>`);
          walk(c, depth + 1);
        }
      };
      walk(root, 0);
      return out;
    },
    [isRef, REMOVED],
  );

const SEL = [
  "#hero",
  "#hero .hero-grid",
  "#hero .hero-copy",
  "#hero .pill",
  "#hero .orange-dot",
  "#hero h1",
  "#hero h1 .line-accent",
  "#hero .lead",
  "#hero .lead b",
  "#hero .hero-actions",
  "#hero .hero-actions .btn-primary",
  "#hero .hero-actions .btn-secondary",
  "#hero .hero-social-row",
  "#hero .hero-social-link:not(.hero-social-pending)",
  "#hero .hero-social-pending",
  "#hero .hero-social-link svg",
  "#hero .hero-photo",
  "#hero .photo-panel",
  "#hero .hero-learn-more",
  "#hero .hero-down-circle",
  "#hero .hero-learn-label",
];
// The avatar is re-centred vertically in the panel because the instructions below it were removed: same size and x, different y.
const SEL_MOVED = ["#hero .avatar-circle", "#hero .avatar-circle svg"];
const PROPS = [
  "display",
  "visibility",
  "position",
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
  "opacity",
  "transform",
  "transition",
  "text-transform",
  "white-space",
];

const measure = (p, sels, withY) =>
  p.evaluate(
    ([sels, PROPS, withY]) =>
      sels.map((s) => {
        const e = document.querySelector(s);
        if (!e) return `${s} MISSING`;
        const r = e.getBoundingClientRect(),
          c = getComputedStyle(e);
        const box = withY ? [r.x, r.y, r.width, r.height] : [r.x, r.width, r.height];
        return (
          `${s} box=${box.map((v) => Math.round(v * 2) / 2).join(",")} ` +
          PROPS.map((k) => `${k}:${c.getPropertyValue(k)}`).join(";")
        );
      }),
    [sels, PROPS, withY],
  );

// Pixel diff (pixelmatch-style YIQ delta, threshold 0.2), computed in a blank page.
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
        return { sizeMismatch: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}` };
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
        exact = 0;
      for (let k = 0; k < da.length; k += 4) {
        if (da[k] !== db[k] || da[k + 1] !== db[k + 1] || da[k + 2] !== db[k + 2]) exact++;
        const dr = da[k] - db[k],
          dg = da[k + 1] - db[k + 1],
          dbb = da[k + 2] - db[k + 2];
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

(async () => {
  const b = await launch();

  console.log("=== 1. Markup matches V21 (minus the approved photo-panel removals) ===");
  {
    const ref = await open(b, REF),
      app = await open(b, APP);
    const r = await serialise(ref, true),
      a = await serialise(app, false);
    // Expected, approved differences: the photo label text, and data-link-pending (a V21 script hook with no visible effect).
    const rAdj = r.map((l) =>
      l
        .replace('"Your professional photo"', '"Professional photo coming soon"')
        .replace("<div class=photo-label>", "<div class=photo-label photo-label-muted>"),
    );
    const diffs = [];
    for (let i = 0; i < Math.max(rAdj.length, a.length); i++)
      if (rAdj[i] !== a[i]) diffs.push(`\n   line ${i}: V21 ${rAdj[i]}\n           app ${a[i]}`);
    check(
      `hero DOM: ${a.length} nodes match V21 node-for-node (tags, classes, attributes, SVG paths, text)`,
      diffs.length === 0,
      diffs.slice(0, 4).join(""),
    );
    const removed = await app.evaluate(() => ({
      img: !!document.querySelector("#hero .avatar-circle img"),
      input: !!document.querySelector('#hero input[type="file"]'),
      btn: !!document.querySelector("#hero .photo-btn"),
      sub: !!document.querySelector("#hero .photo-sub"),
      tag: !!document.querySelector("#hero .photo-tag"),
      text: document.getElementById("hero").innerText,
    }));
    check(
      "photo panel: no upload input/button, no review instructions, no 'Photo-ready hero' tag",
      !removed.img &&
        !removed.input &&
        !removed.btn &&
        !removed.sub &&
        !removed.tag &&
        !/Photo-ready|Add Your Photo|stays on your device/i.test(removed.text),
    );
    check(
      "photo panel shows exactly 'Professional photo coming soon'",
      await app.evaluate(
        () =>
          document.querySelector("#hero .photo-label")?.textContent ===
          "Professional photo coming soon",
      ),
    );
    check(
      "section order unchanged: #hero then #home-about (temporary target)",
      await app.evaluate(() => {
        const s = [...document.querySelectorAll("main > section")].map((e) => e.id);
        return s[0] === "hero" && s[1] === "home-about";
      }),
    );
    check(
      "one hero header + one floating header, no extra navigation",
      await app.evaluate(
        () =>
          document.querySelectorAll("header").length === 2 &&
          document.querySelectorAll('nav[aria-label="Main navigation"]').length === 2,
      ),
    );
    check("no console errors or hydration warnings", app.errs.length === 0, app.errs.join(" | "));
    await ref.context().close();
    await app.context().close();
  }

  console.log("\n=== 2. Layout + styles vs V21: 8 widths x 2 themes ===");
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const ref = await open(b, REF, { width, theme }),
        app = await open(b, APP, { width, theme });
      const [r, a] = [await measure(ref, SEL, true), await measure(app, SEL, true)];
      const diffs = r
        .map((x, i) =>
          x === a[i] ? null : `\n   V21 ${x.slice(0, 220)}\n   app ${a[i].slice(0, 220)}`,
        )
        .filter(Boolean);
      const [rm, am] = [await measure(ref, SEL_MOVED, false), await measure(app, SEL_MOVED, false)];
      const mdiffs = rm
        .map((x, i) =>
          x === am[i] ? null : `\n   V21 ${x.slice(0, 200)}\n   app ${am[i].slice(0, 200)}`,
        )
        .filter(Boolean);
      const label = await app.evaluate(() => {
        const l = document.querySelector("#hero .photo-label"),
          c = getComputedStyle(l),
          r = l.getBoundingClientRect();
        return {
          fs: c.fontSize,
          fw: c.fontWeight,
          lines: Math.round(r.height / parseFloat(c.lineHeight || 20)) || 1,
          fits: r.width <= l.parentElement.getBoundingClientRect().width,
        };
      });
      check(
        `${theme} @${width}: ${SEL.length} hero elements same position, size and styles`,
        diffs.length === 0,
        diffs.slice(0, 2).join(""),
      );
      check(
        `${theme} @${width}: avatar same size/x/styles (re-centred vertically only); label is the approved smaller, muted style`,
        mdiffs.length === 0 &&
          label.fs === (width <= 620 ? "13px" : "14px") &&
          label.fw === "600" &&
          label.fits,
        mdiffs.join("") + ` label ${JSON.stringify(label)}`,
      );
      await ref.context().close();
      await app.context().close();
    }

  console.log(
    "\n=== 3. Pixels vs V21 (photo panel masked; tolerance maxDiffPixelRatio 0.01, threshold 0.2) ===",
  );
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const shots = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        const q = await open(b, url, { width, theme });
        const box = await q.evaluate(() => {
          const r = document.getElementById("hero").getBoundingClientRect();
          return { x: 0, y: 0, width: Math.floor(r.width), height: Math.floor(r.height) };
        });
        shots[k] = await q.screenshot({
          clip: box,
          fullPage: true,
          mask: [q.locator("#hero .photo-panel")],
          maskColor: "#ff00ff",
          animations: "disabled",
        });
        if (width === 1440 || width === 390)
          fs.writeFileSync(`${SHOTS}/hero-${theme}-${width}-${k}.png`, shots[k]);
        await q.context().close();
      }
      const d = await pixelDiff(b, shots.ref, shots.app);
      const ratio = d.diff / d.total;
      check(
        `${theme} @${width}: hero pixels`,
        !d.sizeMismatch && ratio <= 0.01,
        d.sizeMismatch ||
          `${d.diff} px beyond threshold (${(ratio * 100).toFixed(3)}%), ${d.exact} px not byte-identical, of ${d.total}`,
      );
    }

  console.log("\n=== 4a. 'Learn more' visibility (tested separately from scrolling) ===");
  for (const width of WIDTHS) {
    const vis = {};
    for (const [k, url] of [
      ["ref", REF],
      ["app", APP],
    ]) {
      const q = await open(b, url, { width });
      vis[k] = await q.evaluate(() => {
        const e = document.querySelector(".hero-learn-more"),
          r = e.getBoundingClientRect(),
          c = getComputedStyle(e);
        return {
          shown: c.display !== "none" && c.visibility !== "hidden" && r.width > 0,
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
          font: c.fontSize,
        };
      });
      await q.context().close();
    }
    check(
      `@${width}: same visibility, position and size as V21`,
      JSON.stringify(vis.ref) === JSON.stringify(vis.app),
      `V21 ${JSON.stringify(vis.ref)} app ${JSON.stringify(vis.app)}`,
    );
  }

  console.log("\n=== 4b. 'Learn more' scroll behaviour ===");
  for (const width of [1440, 1024, 900, 620, 390])
    for (const motion of ["reduce", "no-preference"]) {
      const ys = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        const q = await open(b, url, { width, motion });
        const expected = await q.evaluate(() =>
          Math.round(
            document.getElementById("home-about").getBoundingClientRect().top +
              scrollY +
              (innerWidth <= 620 ? 5 : 16),
          ),
        );
        await q.click(".hero-learn-more");
        let y0 = -1;
        if (motion === "reduce") {
          await q.waitForTimeout(60);
          y0 = await q.evaluate(() => scrollY);
        }
        await q.waitForTimeout(motion === "reduce" ? 200 : 1600);
        ys[k] = {
          expected,
          immediate: y0,
          final: Math.round(await q.evaluate(() => scrollY)),
          hash: await q.evaluate(() => location.hash),
        };
        await q.context().close();
      }
      const a = ys.app;
      const offset = width <= 620 ? 5 : 16;
      check(
        `@${width} ${motion === "reduce" ? "reduced motion (instant)" : "smooth"}: lands on #home-about + ${offset}px, same as V21; URL unchanged`,
        a.final === a.expected &&
          a.final === ys.ref.final &&
          a.hash === "" &&
          (motion !== "reduce" || a.immediate === a.expected),
        `app ${JSON.stringify(a)} V21 final ${ys.ref.final}`,
      );
    }
  {
    const q = await open(b, APP);
    const info = await q.evaluate(() => {
      const e = document.querySelector(".hero-learn-more");
      return {
        href: e.getAttribute("href"),
        label: e.getAttribute("aria-label"),
        target: !!document.querySelector(e.getAttribute("href")),
      };
    });
    check(
      "no-JS fallback: real link href=#home-about with an existing target, same aria-label as V21",
      info.href === "#home-about" &&
        info.target &&
        info.label === "Learn more about Faizan — scroll to next section",
      JSON.stringify(info),
    );
    await q.keyboard.press("Tab");
    let tabs = 0;
    while (
      tabs++ < 30 &&
      !(await q.evaluate(() => document.activeElement?.classList.contains("hero-learn-more")))
    )
      await q.keyboard.press("Tab");
    await q.keyboard.press("Enter");
    await q.waitForTimeout(250);
    check(
      "keyboard: Tab to 'Learn more' + Enter scrolls to About",
      (await q.evaluate(() => scrollY)) > 700,
      `scrollY ${await q.evaluate(() => scrollY)}`,
    );
    await q.waitForTimeout(1300);
    check(
      "after scrolling to About, the floating header has slid in (Phase 1 scroll nav still wired)",
      await q.evaluate(
        () =>
          document.querySelector(".floating-header").classList.contains("visible") &&
          document.querySelector(".hero-header").classList.contains("nav-inactive"),
      ),
    );
    await q.context().close();
  }

  console.log("\n=== 5. Hero buttons and links ===");
  for (const width of [1440, 390]) {
    const q = await open(b, APP, { width });
    const url = q.url();
    await q.click("#hero .hero-actions .cv-trigger");
    await q.waitForTimeout(250);
    const s = await q.evaluate(() => ({
      open: document.getElementById("cvModal").classList.contains("open"),
      focus: document.activeElement?.textContent?.trim(),
      modals: document.querySelectorAll(".modal-backdrop").length,
    }));
    check(
      `@${width}: hero '↓ Download CV' opens the one shared CV modal`,
      s.open && s.focus === "Understood ✓" && s.modals === 1 && q.url() === url,
      JSON.stringify(s),
    );
    await q.keyboard.press("Escape");
    await q.waitForTimeout(250);
    check(
      `@${width}: Escape closes it and focus returns to the hero CV button`,
      await q.evaluate(
        () =>
          !document.getElementById("cvModal").classList.contains("open") &&
          document.activeElement === document.querySelector("#hero .hero-actions .cv-trigger"),
      ),
    );
    await q.context().close();
  }
  {
    const q = await open(b, APP);
    const l = await q.evaluate(() => {
      const gh = document.querySelector("#hero .hero-social-link[href]"),
        li = document.querySelector("#hero .hero-social-pending");
      return {
        about: document.querySelector("#hero .hero-actions .btn-primary").getAttribute("href"),
        gh: [gh.href, gh.target, gh.rel].join(" "),
        liTag: li.tagName,
        liHref: li.hasAttribute("href"),
        links: [...document.querySelectorAll("#hero > :not(header) a[href], #hero > a[href]")].map(
          (a) => a.getAttribute("href"),
        ),
      };
    });
    check("'About Me' goes to /about", l.about === "/about");
    check(
      "GitHub opens github.com/faizandevx in a new tab with noopener noreferrer",
      l.gh === "https://github.com/faizandevx _blank noopener noreferrer",
      l.gh,
    );
    check(
      "LinkedIn is a non-link 'pending' button (no URL yet)",
      l.liTag === "BUTTON" && !l.liHref,
    );
    check(
      "no private/unknown links in the hero",
      l.links.every((h) =>
        ["/about", "#cv-preview", "https://github.com/faizandevx", "#home-about"].includes(h),
      ),
      l.links.join(", "),
    );
    const before = q.url();
    // force: Playwright refuses to click aria-disabled controls, but a visitor still can.
    await q.click("#hero .hero-social-pending", { force: true });
    await q.waitForTimeout(200);
    check(
      "clicking LinkedIn does nothing (no navigation, no errors)",
      q.url() === before && q.errs.length === 0,
    );
    await q.click("#hero .hero-actions .btn-primary");
    await q.waitForURL("**/about", { timeout: 5000 }).catch(() => {});
    check("'About Me' navigates client-side to /about", q.url().endsWith("/about"), q.url());
    await q.context().close();
  }
  {
    const q = await open(b, APP, { theme: "dark" });
    await q.click(".hero-header .theme-toggle");
    await q.waitForTimeout(200);
    const t = await q.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      panel: getComputedStyle(document.querySelector("#hero .photo-panel")).backgroundColor,
      h1: getComputedStyle(document.querySelector("#hero h1")).color,
    }));
    const ref = await open(b, REF, { theme: "light" });
    const rt = await ref.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      panel: getComputedStyle(document.querySelector("#hero .photo-panel")).backgroundColor,
      h1: getComputedStyle(document.querySelector("#hero h1")).color,
    }));
    check(
      "theme toggle re-themes the hero live (matches V21 light colours)",
      JSON.stringify(t) === JSON.stringify(rt),
      `app ${JSON.stringify(t)} V21 ${JSON.stringify(rt)}`,
    );
    await q.context().close();
    await ref.context().close();
  }

  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
