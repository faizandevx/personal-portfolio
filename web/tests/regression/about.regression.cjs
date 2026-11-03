// Phase 2 Step 2B: home About section vs V21.
// Run with: npm run test:regression (see tests/regression/README.md)
const {
  launch,
  APP_URL,
  REFERENCE_URL,
  WEB_DIR,
  SHOTS_DIR,
  isReferenceFavicon,
} = require("./harness.cjs");
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
const NO_CHROME = ".note-ribbon{display:none!important} nextjs-portal{display:none!important}";
// The approved-changes stylesheet, applied to the V21 page too: every rule in it targets a
// modifier class or the home About section, so after this the app must match V21 exactly.
const APPROVED =
  fs.readFileSync(WEB_DIR + "/src/styles/approved-changes.css", "utf8") +
  // Tailwind's sr-only utility (the V21 page has no Tailwind).
  ".sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border-width:0}";
const NO_HEADERS = ".hero-header,.floating-header{visibility:hidden!important}";

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
  await p.addStyleTag({
    content: NO_CHROME + (o.css || "") + (url === REF && !o.pureV21 ? APPROVED : ""),
  });
  if (url === REF && !o.pureV21) {
    // Approved text change (employer name corrected, names linked), applied to V21 so
    // pixel and layout comparisons measure styling only.
    await p.evaluate(() => {
      const link = (name, href) =>
        `<a class="about-company-link" href="${href}" target="_blank" rel="noopener noreferrer">${name}<span class="sr-only"> (opens in a new tab)</span></a>`;
      const [s1, s2] = document.querySelectorAll(
        "#home-about .about-home-copy p:nth-of-type(3) strong",
      );
      s1.innerHTML = link("AlphaSoft360", "https://www.alphasoft360.com/");
      s2.innerHTML = link("Aman Bank", "https://www.aman-bank.com/");
    });
  }
  await p.waitForTimeout(300);
  return p;
}

const serialise = (p, isRef) =>
  p.evaluate((isRef) => {
    const root = document.getElementById("home-about").cloneNode(true);
    if (isRef) {
      // The approved changes applied to the V21 markup = what the app must render.
      root.querySelector(".about-home-mode").remove();
      root.querySelector("#aboutPortraitPanel").remove();
      const label = root.querySelector(".about-home-intro > .eyebrow");
      label.textContent = label.textContent.replace(/^0\d \/ /, "");
      label.classList.add("home-section-label");
      // Approved: employer names corrected and linked (new tab, accessible name).
      const link = (name, href) =>
        `<a class="about-company-link" href="${href}" target="_blank" rel="noopener noreferrer">${name}<span class="sr-only"> (opens in a new tab)</span></a>`;
      const [s1, s2] = root.querySelectorAll(".about-home-copy p:nth-of-type(3) strong");
      s1.innerHTML = link("AlphaSoft360", "https://www.alphasoft360.com/");
      s2.innerHTML = link("Aman Bank", "https://www.aman-bank.com/");
    }
    const out = [];
    const walk = (n, depth) => {
      for (const c of n.childNodes) {
        if (c.nodeType === 3) {
          const t = c.textContent.replace(/[ \t\n]+/g, " ").trim();
          if (t) out.push(`${"  ".repeat(depth)}"${t}"`);
          continue;
        }
        if (c.nodeType !== 1) continue;
        const attrs = [...c.attributes]
          .map(
            (a) =>
              `${a.name}=${a.name === "href" ? a.value.replace(/^about\.html$/, "/about") : a.value}`,
          )
          .sort();
        out.push(`${"  ".repeat(depth)}<${c.tagName.toLowerCase()} ${attrs.join(" ")}>`);
        walk(c, depth + 1);
      }
    };
    walk(root, 0);
    return out;
  }, isRef);

// Everything below the intro row. y is measured from .about-home-columns, so the
// (approved) shorter intro row does not hide real layout differences.
const SEL = [
  ".about-home-columns",
  ".about-home-copy",
  "#home-about h2",
  "#home-about h2 .accent",
  ".about-home-lead",
  ".about-home-copy p:nth-of-type(2)",
  ".about-home-copy p:nth-of-type(3)",
  ".about-home-cta",
  ".about-home-caption",
  ".caption-dot",
  ".about-home-media",
  ".tech-v16",
  ".tech-v16-meta",
  ".tech-v16-live-dot",
  ".tech-v16-heading",
  ".tech-v16-caption",
  ".tech-v16-process",
  ".tech-v16-phase:nth-of-type(1)",
  ".tech-v16-arrow",
  ".tech-v16-phase:nth-of-type(3)",
  ".tech-v16-editor",
  ".tech-v16-editorbar",
  ".tech-v16-code",
  ".tech-v16-code > div:nth-child(4)",
  ".tech-v16-caret",
  ".tech-v16-editorfoot",
  ".tech-v16-bottom",
  ".tech-v16-tags span:nth-child(3)",
  ".tech-v16-cornerglow",
  ".about-home-bento",
  ".about-strong-card:nth-child(1)",
  ".about-strong-card:nth-child(4)",
  ".about-strong-card:nth-child(4) h3",
  ".about-strong-card:nth-child(4) p",
  ".about-mini-icon",
];
const PROPS = [
  "display",
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
  "box-shadow",
  "animation-name",
  "animation-duration",
  "transition",
  "text-transform",
  "grid-template-columns",
];
const measure = (p) =>
  p.evaluate(
    ([SEL, PROPS]) => {
      const top = document.querySelector(".about-home-columns").getBoundingClientRect().top;
      return SEL.map((s) => {
        const e = document.querySelector("#home-about " + s.replace(/^#home-about /, ""));
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
const LABEL_PROPS = ["color", "text-transform", "font-weight", "font-family"];
const label = (p) =>
  p.evaluate((LABEL_PROPS) => {
    const e = document.querySelector("#home-about .about-home-intro > .eyebrow"),
      c = getComputedStyle(e),
      r = e.getBoundingClientRect();
    const intro = document.querySelector(".about-home-intro").getBoundingClientRect(),
      cols = document.querySelector(".about-home-columns").getBoundingClientRect();
    return {
      text: e.textContent,
      size: c.fontSize,
      spacingEm: (parseFloat(c.letterSpacing) / parseFloat(c.fontSize)).toFixed(3),
      other: LABEL_PROPS.map((k) => `${k}:${c.getPropertyValue(k)}`).join(";"),
      x: Math.round(r.x),
      introTop: Math.round(intro.top + scrollY),
      columnsTop: Math.round(cols.top + scrollY),
    };
  }, LABEL_PROPS);

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

(async () => {
  const b = await launch();

  console.log("=== 1. Markup = V21 with only the approved changes ===");
  {
    const ref = await open(b, REF),
      app = await open(b, APP);
    const r = await serialise(ref, true),
      a = await serialise(app, false);
    const diffs = [];
    for (let i = 0; i < Math.max(r.length, a.length); i++)
      if (r[i] !== a[i]) diffs.push(`\n   line ${i}: V21 ${r[i]}\n           app ${a[i]}`);
    check(
      `#home-about: ${a.length} nodes match V21 node-for-node (tags, all attributes, text)`,
      diffs.length === 0,
      diffs.slice(0, 4).join(""),
    );
    const gone = await app.evaluate(() => ({
      sel: [
        ".about-home-mode",
        ".mode-caption",
        ".mode-pill",
        "[data-about-mode]",
        "#aboutPortraitPanel",
        ".portrait-mode",
        "#aboutPhotoInput",
        'input[type="file"]',
      ].filter((s) => document.querySelector(s)),
      text: document.body.innerText,
    }));
    check(
      "no 'Preview the look' switch, no Tech visual / Second photo buttons, no second-photo panel or upload",
      gone.sel.length === 0 &&
        !/PREVIEW THE LOOK|Second photo|Tech visual|Add second photo|Different photo/i.test(
          gone.text,
        ),
      gone.sel.join(", "),
    );
    check("label reads exactly 'ABOUT ME' (no '01 /')", (await label(app)).text === "ABOUT ME");
    const cards = await app.evaluate(() =>
      [...document.querySelectorAll(".about-strong-card h3")].map((h) => h.textContent),
    );
    check(
      "four expertise cards in order",
      JSON.stringify(cards) ===
        JSON.stringify([
          "Software Engineering",
          "Digital Banking",
          "IT Project Management",
          "Stakeholder Coordination",
        ]),
      cards.join(", "),
    );
    check(
      "Tech Visual present: 'From idea to impact.'",
      await app.evaluate(
        () =>
          document.querySelector(".tech-v16-heading")?.textContent === "From idea to impact." &&
          document.querySelector(".tech-v16")?.checkVisibility(),
      ),
    );
    const struct = await app.evaluate(() => ({
      sections: [...document.querySelectorAll("main > section")].map((s) => s.id),
      spacer: [...document.querySelectorAll("main section")].some((s) => s.style.minHeight),
      next: document.querySelector("main").nextElementSibling?.className,
    }));
    check(
      "temporary spacer removed: main starts #hero, #home-about; floating header follows main (as V21)",
      struct.sections[0] === "hero" &&
        struct.sections[1] === "home-about" &&
        !struct.spacer &&
        struct.next.includes("floating-header"),
      JSON.stringify(struct),
    );
    check(
      "'More About Me' links to /about",
      await app.evaluate(
        () => document.querySelector(".about-home-cta").getAttribute("href") === "/about",
      ),
    );
    check("no console errors or hydration warnings", app.errs.length === 0, app.errs.join(" | "));
    await ref.context().close();
    await app.context().close();
  }

  console.log("\n=== 2. Section label size (scoped) ===");
  for (const width of [1440, 768, 390]) {
    const ref = await open(b, REF, { width }),
      app = await open(b, APP, { width });
    const [lr, la] = [await label(ref), await label(app)];
    const others = await app.evaluate(() => {
      const e = document.querySelector("#cvModal .eyebrow");
      const m = document.getElementById("cvModal");
      m.style.display = "flex";
      const s = getComputedStyle(e).fontSize;
      m.style.display = "";
      return s;
    });
    const h2 = await Promise.all(
      [ref, app].map((p) =>
        p.evaluate(() => getComputedStyle(document.querySelector("#home-about h2")).fontSize),
      ),
    );
    check(
      `@${width}: ABOUT ME label 15px (V21 ${lr.size}); colour/uppercase/letter-spacing/weight unchanged; same x`,
      la.size === "15px" &&
        lr.size === "11px" &&
        la.other === lr.other &&
        la.spacingEm === lr.spacingEm &&
        la.x === lr.x,
      `letter-spacing ${la.spacingEm}em (V21 ${lr.spacingEm}em); ${la.other}`,
    );
    check(
      `@${width}: other labels unchanged (CV modal eyebrow ${others}); h2 unchanged (${h2[1]})`,
      others === "11px" && h2[0] === h2[1],
    );
    console.log(
      `      intro row: V21 columns start ${lr.columnsTop - lr.introTop}px below the intro top, app ${la.columnsTop - la.introTop}px (switch removed${width <= 760 ? ", was a second row here" : ""})`,
    );
    await ref.context().close();
    await app.context().close();
  }

  console.log("\n=== 3. Layout + styles below the intro row: 8 widths x 2 themes ===");
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const ref = await open(b, REF, { width, theme }),
        app = await open(b, APP, { width, theme });
      const [r, a] = [await measure(ref), await measure(app)];
      const diffs = r
        .map((x, i) =>
          x === a[i] ? null : `\n   V21 ${x.slice(0, 230)}\n   app ${a[i].slice(0, 230)}`,
        )
        .filter(Boolean);
      check(
        `${theme} @${width}: ${SEL.length} elements same position (relative), size and ${PROPS.length} styles`,
        diffs.length === 0,
        diffs.slice(0, 2).join(""),
      );
      await ref.context().close();
      await app.context().close();
    }

  console.log(
    "\n=== 4. Pixels: columns (copy + Tech Visual) and the four cards, 8 widths x 2 themes ===",
  );
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const shots = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        const q = await open(b, url, { width, theme, css: NO_HEADERS });
        shots[k] = {
          cols: await q.locator(".about-home-columns").screenshot({ animations: "disabled" }),
          bento: await q.locator(".about-home-bento").screenshot({ animations: "disabled" }),
        };
        if (width === 1440 || width === 390) {
          fs.writeFileSync(`${SHOTS}/about-${theme}-${width}-${k}.png`, shots[k].cols);
        }
        await q.context().close();
      }
      const dc = await pixelDiff(b, shots.ref.cols, shots.app.cols),
        db = await pixelDiff(b, shots.ref.bento, shots.app.bento);
      check(
        `${theme} @${width}: copy + Tech Visual pixels`,
        !dc.sizeMismatch && dc.diff / dc.total <= 0.01,
        fmt(dc),
      );
      check(
        `${theme} @${width}: expertise cards pixels`,
        !db.sizeMismatch && db.diff / db.total <= 0.01,
        fmt(db),
      );
    }

  console.log("\n=== 5. Hover + animation states vs V21 ===");
  for (const target of [
    ".tech-v16-editor",
    ".tech-v16-phase:nth-of-type(3)",
    ".tech-v16-tags span:nth-child(2)",
    ".about-home-cta",
    ".about-strong-card:nth-child(2)",
  ]) {
    const imgs = [];
    for (const url of [REF, APP]) {
      const q = await open(b, url, { motion: "no-preference", css: NO_HEADERS });
      await q.locator(".about-home-columns").scrollIntoViewIfNeeded();
      await q.hover("#home-about " + target);
      await q.waitForTimeout(900);
      imgs.push(
        await q
          .locator(target.includes("strong-card") ? ".about-home-bento" : ".about-home-columns")
          .screenshot({ animations: "disabled" }),
      );
      await q.context().close();
    }
    const d = await pixelDiff(b, imgs[0], imgs[1]);
    check(
      `hover ${target}: same pixels as V21 (section below the intro row)`,
      !d.sizeMismatch && d.diff / d.total <= 0.01,
      fmt(d),
    );
  }
  for (const motion of ["reduce", "no-preference"]) {
    const v = await Promise.all(
      [REF, APP].map(async (url) => {
        const q = await open(b, url, { motion });
        const s = await q.evaluate(() =>
          [...document.querySelectorAll("#home-about *")]
            .map((e) => getComputedStyle(e))
            .filter((c) => c.animationName !== "none")
            .map((c) => `${c.animationName} ${c.animationDuration} ${c.animationIterationCount}`)
            .join(", "),
        );
        await q.context().close();
        return s;
      }),
    );
    check(
      `animations with ${motion} motion match V21`,
      v[0] === v[1],
      `V21 [${v[0] || "none"}] app [${v[1] || "none"}]`,
    );
  }

  console.log("\n=== 6. Learn more + floating header with the real section ===");
  for (const width of [1440, 1024, 768, 390])
    for (const motion of ["reduce", "no-preference"]) {
      const ys = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        const q = await open(b, url, { width, motion });
        await q.click(".hero-learn-more");
        await q.waitForTimeout(motion === "reduce" ? 300 : 1600);
        await q.waitForTimeout(1000);
        ys[k] = await q.evaluate(() => ({
          y: Math.round(scrollY),
          labelTop: Math.round(document.querySelector("#home-about").getBoundingClientRect().top),
          floating: document.querySelector(".floating-header").classList.contains("visible"),
          hash: location.hash,
        }));
        await q.context().close();
      }
      const off = width <= 620 ? 5 : 16;
      check(
        `@${width} ${motion}: lands ${off}px into #home-about (same scrollY as V21), floating header same as V21`,
        ys.app.y === ys.ref.y &&
          ys.app.labelTop === -off &&
          ys.app.floating === ys.ref.floating &&
          ys.app.hash === "",
        `app ${JSON.stringify(ys.app)} V21 ${JSON.stringify(ys.ref)}`,
      );
    }
  {
    const q = await open(b, APP);
    const H = await q.evaluate(
      () => document.getElementById("hero").getBoundingClientRect().height,
    );
    const vis = async (y) => {
      await q.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
      await q.waitForTimeout(200);
      return q.evaluate(() =>
        document.querySelector(".floating-header").classList.contains("visible"),
      );
    };
    const SHOW = Math.ceil(H + 8),
      HIDE = Math.floor(H - 32);
    check(
      "floating header thresholds unchanged (-8px show, +32px hide, hysteresis)",
      !(await vis(SHOW - 1)) && (await vis(SHOW)) && (await vis(HIDE + 1)) && !(await vis(HIDE)),
    );
    await q.evaluate(() =>
      scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await q.waitForTimeout(400);
    check(
      "page bottom reaches the footer; floating header still shown there",
      await q.evaluate(() => {
        const f = document.querySelector("footer").getBoundingClientRect();
        return (
          f.bottom <= innerHeight + 1 &&
          document.querySelector(".floating-header").classList.contains("visible")
        );
      }),
    );
    await q.context().close();
  }

  console.log("\n=== 7. Hero photo label (approved: smaller, muted) ===");
  for (const theme of ["dark", "light"])
    for (const width of [1440, 768, 620, 390]) {
      const ref = await open(b, REF, { width, theme }),
        app = await open(b, APP, { width, theme });
      const g = (p) =>
        p.evaluate(() => {
          const l = document.querySelector("#hero .photo-label"),
            c = getComputedStyle(l),
            lr = l.getBoundingClientRect();
          const box = (s) => {
            const r = document.querySelector(s).getBoundingClientRect();
            return [r.x, r.y, r.width, r.height].map(Math.round).join(",");
          };
          const av = document.querySelector("#hero .avatar-circle"),
            ac = getComputedStyle(av);
          return {
            size: c.fontSize,
            weight: c.fontWeight,
            color: c.color,
            muted: getComputedStyle(document.querySelector("#hero .lead")).color,
            margin: c.margin,
            fits: lr.width <= l.parentElement.clientWidth,
            frame: box("#hero .hero-photo"),
            panel: box("#hero .photo-panel"),
            avatarSize: `${Math.round(av.getBoundingClientRect().width)} ${ac.borderTopStyle} ${ac.borderTopColor}`,
            avatarX: Math.round(av.getBoundingClientRect().x),
          };
        });
      const [r, a] = [await g(ref), await g(app)];
      const want = width <= 620 ? "13px" : "14px";
      check(
        `${theme} @${width}: label ${a.size} (V21 ${r.size}), weight ${a.weight}, muted colour, V21 spacing; frame, panel and avatar outline unchanged`,
        a.size === want &&
          a.weight === "600" &&
          a.color === a.muted &&
          a.margin === r.margin &&
          a.fits &&
          a.frame === r.frame &&
          a.panel === r.panel &&
          a.avatarSize === r.avatarSize &&
          a.avatarX === r.avatarX,
        `app ${JSON.stringify(a)}`,
      );
      await ref.context().close();
      await app.context().close();
    }

  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
