// Phase 2 Step 2C: home Selected work + Expertise vs V21.
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
const SECTIONS = ["#home-work", "#home-skills"];
const APPROVED = fs.readFileSync(WEB_DIR + "/src/styles/approved-changes.css", "utf8");
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};
const HREFS = {
  "projects.html": "/projects",
  "project-detail.html": "/projects",
  "experience.html": "/experience",
  "about.html": "/about",
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
    if (["error", "warning"].includes(m.type()) && !isReferenceFavicon(m))
      p.errs.push(m.text() + " @ " + m.location().url);
  });
  p.on("pageerror", (e) => p.errs.push(e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.addStyleTag({
    content:
      ".note-ribbon{display:none!important} nextjs-portal{display:none!important}" + (o.css || ""),
  });
  if (url === REF && !o.pureV21) {
    // The approved Phase 2 changes applied to V21: labels without numbers, larger label class.
    await p.addStyleTag({ content: APPROVED });
    await p.evaluate(
      ([SECTIONS, HREFS]) => {
        for (const id of SECTIONS) {
          const label = document.querySelector(`${id} .container .eyebrow`);
          label.textContent = label.textContent.replace(/^0\d \/ /, "");
          label.classList.add("home-section-label");
          document.querySelectorAll(`${id} a[href]`).forEach((a) => {
            const h = HREFS[a.getAttribute("href")];
            if (h) a.setAttribute("href", h);
          });
        }
      },
      [SECTIONS, HREFS],
    );
  }
  await p.waitForTimeout(300);
  return p;
}

const serialise = (p, id) =>
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

const SEL = [
  "#home-work",
  "#home-work .section-heading",
  "#home-work .home-section-label",
  "#home-work h2",
  "#home-work .section-intro",
  "#home-work .link-inline",
  "#home-work .bento-grid",
  "#home-work .bento-card.wide",
  "#home-work .bento-card.wide .card-icon",
  "#home-work .bento-card.wide .eyebrow",
  "#home-work .bento-card.wide h3",
  "#home-work .bento-card.wide p",
  "#home-work .card-illustration",
  "#home-work .bento-card.wide .card-arrow",
  "#home-work .bento-card:nth-child(2)",
  "#home-work .bento-card:nth-child(2) h3",
  "#home-work .bento-card:nth-child(3)",
  "#home-work .bento-card:nth-child(3) p",
  "#home-skills",
  "#home-skills .home-section-label",
  "#home-skills h2",
  "#home-skills h2 .accent",
  "#home-skills .section-intro",
  "#home-skills .chip-row",
  "#home-skills .chip:nth-child(1)",
  "#home-skills .chip:nth-child(6)",
  "#home-skills .chip:nth-child(11)",
  "#home-skills .link-inline",
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
  "transition",
  "text-transform",
  "grid-template-columns",
  "grid-row",
  "text-decoration-line",
];
// Positions are relative to each element's own section, so the (approved) shift of the About section above does not count.
const measure = (p) =>
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
    [SEL, PROPS],
  );

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
const NO_HEADERS = ".hero-header,.floating-header{visibility:hidden!important}";

(async () => {
  const b = await launch();

  console.log("=== 1. Markup = V21 with only the approved changes ===");
  {
    const ref = await open(b, REF),
      app = await open(b, APP);
    for (const id of SECTIONS) {
      const r = await serialise(ref, id),
        a = await serialise(app, id);
      const diffs = [];
      for (let i = 0; i < Math.max(r.length, a.length); i++)
        if (r[i] !== a[i]) diffs.push(`\n   line ${i}: V21 ${r[i]}\n           app ${a[i]}`);
      check(
        `${id}: ${a.length} nodes match V21 node-for-node (tags, all attributes, text)`,
        diffs.length === 0,
        diffs.slice(0, 4).join(""),
      );
    }
    const info = await app.evaluate(() => ({
      labels: ["#home-work", "#home-skills"].map(
        (id) => document.querySelector(`${id} .container .eyebrow`).innerText,
      ),
      sizes: [
        "#home-about .about-home-intro .eyebrow",
        "#home-work .home-section-label",
        "#home-skills .home-section-label",
        "#home-work .bento-card .eyebrow",
        "#cvModal .eyebrow",
      ].map((s) => getComputedStyle(document.querySelector(s)).fontSize),
      order: [...document.querySelectorAll("main > section")].map((s) => s.id),
      links: [...document.querySelectorAll("#home-work a, #home-skills a")].map(
        (a) =>
          `${a.textContent.trim().replace(/\s+/g, " ").slice(0, 24)} -> ${a.getAttribute("href")}`,
      ),
      company: [...document.querySelectorAll("#home-about .about-company-link")]
        .map((a) => `${a.childNodes[0].textContent} ${a.href}`)
        .join(" | "),
      heroLabel: document.querySelector("#hero .photo-label").textContent,
    }));
    check(
      "labels read SELECTED WORK and EXPERTISE (no numbers)",
      JSON.stringify(info.labels) === '["SELECTED WORK","EXPERTISE"]',
      info.labels.join(", "),
    );
    check(
      "all four... home labels so far 15px; 'Featured case study' and CV modal labels stay 11px",
      JSON.stringify(info.sizes) === '["15px","15px","15px","11px","11px"]',
      info.sizes.join(" "),
    );
    check(
      "section order starts: hero, about, work, skills",
      JSON.stringify(info.order.slice(0, 4)) === '["hero","home-about","home-work","home-skills"]',
      info.order.join(", "),
    );
    check(
      "links use final routes (featured card -> /projects for now)",
      JSON.stringify(info.links) ===
        JSON.stringify([
          "All projects ↗ -> /projects",
          "⌘Featured case studyFull -> /projects",
          "◈Digital bankingTechnolo -> /experience",
          "✳Ask Faizan AIPlanned: a -> /about",
          "More about my skills ↗ -> /about",
        ]),
      info.links.join(" | "),
    );
    check(
      "earlier work intact: AlphaSoft360 + Aman Bank links, hero photo label",
      info.company ===
        "AlphaSoft360 https://www.alphasoft360.com/ | Aman Bank https://www.aman-bank.com/" &&
        info.heroLabel === "Professional photo coming soon",
      info.company,
    );
    check("no console errors or hydration warnings", app.errs.length === 0, app.errs.join(" | "));
    await ref.context().close();
    await app.context().close();
  }

  console.log("\n=== 2. Layout + styles: 8 widths x 2 themes ===");
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
        `${theme} @${width}: ${SEL.length} elements same position (within section), size and ${PROPS.length} styles`,
        diffs.length === 0,
        diffs.slice(0, 2).join(""),
      );
      await ref.context().close();
      await app.context().close();
    }

  console.log("\n=== 3. Pixels: both full sections, 8 widths x 2 themes ===");
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const shots = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        const q = await open(b, url, { width, theme, css: NO_HEADERS });
        shots[k] = {};
        for (const id of SECTIONS)
          shots[k][id] = await q.locator(id).screenshot({ animations: "disabled" });
        if (width === 1440 || width === 390)
          for (const id of SECTIONS)
            fs.writeFileSync(`${SHOTS}/${id.slice(1)}-${theme}-${width}-${k}.png`, shots[k][id]);
        await q.context().close();
      }
      for (const id of SECTIONS) {
        const d = await pixelDiff(b, shots.ref[id], shots.app[id]);
        check(
          `${theme} @${width}: ${id} pixels`,
          !d.sizeMismatch && d.diff / d.total <= 0.01,
          fmt(d),
        );
      }
    }

  console.log("\n=== 4. Hover states vs V21 ===");
  for (const theme of ["dark", "light"])
    for (const target of [
      "#home-work .bento-card.wide",
      "#home-work .bento-card:nth-child(2)",
      "#home-work .bento-card:nth-child(3)",
      "#home-work .link-inline",
      "#home-skills .chip:nth-child(3)",
      "#home-skills .link-inline",
    ]) {
      const imgs = [];
      for (const url of [REF, APP]) {
        const q = await open(b, url, { theme, motion: "no-preference", css: NO_HEADERS });
        await q.locator(target).scrollIntoViewIfNeeded();
        await q.hover(target);
        await q.waitForTimeout(900);
        imgs.push(await q.locator(target.split(" ")[0]).screenshot({ animations: "disabled" }));
        await q.context().close();
      }
      const d = await pixelDiff(b, imgs[0], imgs[1]);
      check(`${theme} hover ${target}`, !d.sizeMismatch && d.diff / d.total <= 0.01, fmt(d));
    }

  console.log("\n=== 5. Navigation ===");
  {
    const q = await open(b, APP, { width: 1440 });
    await q.evaluate(() =>
      scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await q.waitForTimeout(300);
    await q.click('footer a[href="/#home-skills"]');
    await q.waitForTimeout(800);
    const s = await q.evaluate(() => ({
      top: Math.round(document.getElementById("home-skills").getBoundingClientRect().top),
      hash: location.hash,
      path: location.pathname,
    }));
    check(
      "footer 'Skills' link now lands on the Expertise section",
      s.path === "/" && s.hash === "#home-skills" && Math.abs(s.top) <= 2,
      JSON.stringify(s),
    );
    const q2 = await open(b, APP, { width: 1440 });
    await q2.click("#home-work .bento-card:nth-child(2)");
    await q2.waitForURL("**/experience", { timeout: 5000 }).catch(() => {});
    check(
      "cards navigate client-side with Next.js (Digital banking -> /experience)",
      q2.url().endsWith("/experience"),
      q2.url(),
    );
    await q.context().close();
    await q2.context().close();
  }
  for (const width of [1440, 390]) {
    const q = await open(b, APP, { width });
    await q.click(".hero-learn-more");
    await q.waitForTimeout(400);
    check(
      `@${width}: Learn more still lands on #home-about`,
      await q.evaluate(
        (w) =>
          Math.round(document.getElementById("home-about").getBoundingClientRect().top) ===
          -(w <= 620 ? 5 : 16),
        width,
      ),
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
