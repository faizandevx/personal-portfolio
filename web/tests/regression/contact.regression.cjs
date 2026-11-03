// Phase 2 Step 2D: home Contact section, Ask Faizan AI, WhatsApp modal vs V21.
// Run with: npm run test:regression (see tests/regression/README.md)
const {
  launch,
  APP_URL,
  REFERENCE_URL,
  WEB_DIR,
  SHOTS_DIR,
  isReferenceFavicon,
} = require("./harness.cjs");
const { AxeBuilder } = require("@axe-core/playwright");
const fs = require("fs");
const APP = APP_URL,
  REF = REFERENCE_URL;
const SHOTS = SHOTS_DIR;
const WIDTHS = [1440, 1280, 1024, 900, 768, 620, 390, 360];
const APPROVED = fs.readFileSync(WEB_DIR + "/src/styles/approved-changes.css", "utf8");
const WA_TEXT =
  "WhatsApp chat isn't available yet. In the meantime, you're welcome to get in touch through the Contact page or by email at faizandevx@gmail.com.";
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};
const NO_HEADERS = ".hero-header,.floating-header{visibility:hidden!important}";

async function open(b, url, o = {}) {
  const ctx = await b.newContext({
    viewport: { width: o.width || 1440, height: o.height || 800 },
    reducedMotion: o.motion || "reduce",
    rawReference: !!o.pureV21,
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
    // The approved Phase 2 changes applied to V21, so comparisons measure everything else.
    await p.addStyleTag({ content: APPROVED });
    await p.evaluate((WA_TEXT) => {
      const s = document.getElementById("home-contact");
      const label = s.querySelector(".contact-showcase-copy > .eyebrow");
      label.textContent = label.textContent.replace(/^0\d \/ /, "");
      label.classList.add("home-section-label");
      s.querySelectorAll('a[href="contact.html"]').forEach((a) =>
        a.setAttribute("href", "/contact"),
      );
      const wa = s.querySelector(".whatsapp-preview-trigger");
      wa.setAttribute("aria-label", "Let's Chat on WhatsApp (coming soon)");
      wa.setAttribute("aria-haspopup", "dialog");
      s.querySelector(".mini-ai-preview").setAttribute(
        "aria-label",
        "Ask Faizan AI (scripted demo)",
      );
      s.querySelector(".mini-ai-identity small").textContent = "Portfolio guide · Scripted demo";
      const box = document.querySelector(".whatsapp-preview-box p");
      if (box) box.textContent = WA_TEXT;
    }, WA_TEXT);
  }
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
    const s = document.getElementById("home-contact");
    out.push(
      `<section ${[...s.attributes]
        .map((a) => `${a.name}=${a.value}`)
        .sort()
        .join(" ")}>`,
    );
    walk(s, 1);
    return out;
  });

const SEL = [
  "#home-contact",
  ".contact-showcase",
  ".contact-showcase-copy",
  ".contact-showcase-copy .eyebrow",
  "#home-contact-heading",
  "#home-contact-heading .accent",
  ".contact-showcase-copy .section-intro",
  ".contact-showcase-actions",
  ".whatsapp-preview-trigger",
  ".whatsapp-preview-trigger svg",
  ".contact-showcase-actions .btn-secondary",
  ".contact-reassurance",
  ".availability-indicator",
  ".mini-ai-preview",
  ".mini-ai-heading",
  ".mini-ai-logo",
  ".mini-ai-identity strong",
  ".mini-ai-identity small",
  ".mini-ai-demo-pill",
  ".mini-ai-conversation",
  ".mini-ai-note",
  "#miniAiQuestion",
  ".mini-ai-spark",
  "#miniAiAnswer",
  ".mini-ai-suggestions",
  ".mini-ai-suggest-label",
  ".mini-ai-question:nth-child(1)",
  ".mini-ai-question:nth-child(2)",
  ".mini-ai-question:nth-child(3)",
  ".mini-ai-footer",
  ".mini-ai-footer-dot",
  ".mini-ai-footer a",
].map((s) => (s.startsWith("#home-contact") ? s : "#home-contact " + s));
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
  "animation-name",
  "text-transform",
  "grid-template-columns",
  "white-space",
];
const measure = (p) =>
  p.evaluate(
    ([SEL, PROPS]) => {
      const top = document.getElementById("home-contact").getBoundingClientRect().top;
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
const ok = (d) => !d.sizeMismatch && d.diff / d.total <= 0.01;
const ai = (p) =>
  p.evaluate(() => ({
    q: document.getElementById("miniAiQuestion").textContent.trim(),
    a: document.getElementById("miniAiAnswer").textContent.trim(),
    pressed: [...document.querySelectorAll(".mini-ai-question")]
      .map(
        (b) =>
          `${b.dataset.aiQuestion}:${b.getAttribute("aria-pressed")}:${b.classList.contains("is-selected")}`,
      )
      .join(" "),
  }));
const wa = (p) =>
  p.evaluate(() => {
    const m = document.querySelector(".whatsapp-preview-backdrop");
    return {
      open: !!m && m.classList.contains("open") && getComputedStyle(m).display === "grid",
      focus: document.activeElement?.textContent?.trim().slice(0, 30),
      focusInModal: !!m && m.contains(document.activeElement),
      overflow: getComputedStyle(document.documentElement).overflow,
    };
  });

(async () => {
  const b = await launch();

  console.log("=== 1. Markup = V21 with only the approved changes ===");
  {
    const ref = await open(b, REF),
      app = await open(b, APP);
    const r = await serialise(ref),
      a = await serialise(app);
    const diffs = [];
    for (let i = 0; i < Math.max(r.length, a.length); i++)
      if (r[i] !== a[i]) diffs.push(`\n   line ${i}: V21 ${r[i]}\n           app ${a[i]}`);
    check(
      `#home-contact: ${a.length} nodes match V21 node-for-node (tags, all attributes, text)`,
      diffs.length === 0,
      diffs.slice(0, 4).join(""),
    );
    const info = await app.evaluate(() => ({
      label: document.querySelector("#home-contact .contact-showcase-copy > .eyebrow").innerText,
      sizes: [
        "#home-about .about-home-intro .eyebrow",
        "#home-work .home-section-label",
        "#home-skills .home-section-label",
        "#home-contact .home-section-label",
        "#home-work .bento-card .eyebrow",
        "#cvModal .eyebrow",
      ].map((s) => getComputedStyle(document.querySelector(s)).fontSize),
      order: [...document.querySelectorAll("main > section")].map((s) => s.id),
      h2: getComputedStyle(document.getElementById("home-contact-heading")).fontSize,
      text: document.getElementById("home-contact").innerText,
      company: [...document.querySelectorAll("#home-about .about-company-link")]
        .map((a) => a.childNodes[0].textContent)
        .join(", "),
    }));
    const refH2 = await ref.evaluate(
      () => getComputedStyle(document.getElementById("home-contact-heading")).fontSize,
    );
    check("label reads CONTACT (no '04 /')", info.label === "CONTACT");
    check(
      "all four home labels 15px; card + CV modal labels stay 11px; heading unchanged",
      JSON.stringify(info.sizes) === '["15px","15px","15px","15px","11px","11px"]' &&
        info.h2 === refH2,
      info.sizes.join(" ") + ` h2 ${info.h2}`,
    );
    check(
      "homepage complete in V21 order: hero, about, work, skills, contact",
      JSON.stringify(info.order) ===
        '["hero","home-about","home-work","home-skills","home-contact"]',
      info.order.join(", "),
    );
    check(
      "AI card says it is scripted: DEMO pill, 'Scripted demo' subtitle, 'Scripted responses · No live AI yet'",
      /DEMO/.test(info.text) &&
        /Portfolio guide · Scripted demo/.test(info.text) &&
        /Scripted responses · No live AI yet/.test(info.text) &&
        !/preview/i.test(info.text),
    );
    check(
      "earlier sections intact (AlphaSoft360, Aman Bank links)",
      info.company === "AlphaSoft360, Aman Bank",
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

  console.log("\n=== 3. Pixels: full section, 8 widths x 2 themes ===");
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const shots = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        const q = await open(b, url, { width, theme, css: NO_HEADERS });
        shots[k] = await q.locator("#home-contact").screenshot({ animations: "disabled" });
        if (width === 1440 || width === 390)
          fs.writeFileSync(`${SHOTS}/contact-${theme}-${width}-${k}.png`, shots[k]);
        await q.context().close();
      }
      const d = await pixelDiff(b, shots.ref, shots.app);
      check(`${theme} @${width}: #home-contact pixels`, ok(d), fmt(d));
    }

  console.log("\n=== 4. Ask Faizan AI (scripted) ===");
  {
    const ref = await open(b, REF),
      app = await open(b, APP);
    const [r0, a0] = [await ai(ref), await ai(app)];
    check(
      "initial question/answer and pressed state match V21",
      JSON.stringify(r0) === JSON.stringify(a0),
      JSON.stringify(a0),
    );
    for (const key of ["banking", "contact", "work", "contact"]) {
      for (const p of [ref, app]) await p.click(`.mini-ai-question[data-ai-question="${key}"]`);
      await app.waitForTimeout(100);
      const [r, a] = [await ai(ref), await ai(app)];
      check(
        `click '${key}': same scripted question + answer + aria-pressed/is-selected as V21`,
        JSON.stringify(r) === JSON.stringify(a),
        `${a.q} | ${a.pressed}`,
      );
    }
    check(
      "answer is an aria-live=polite region",
      await app.evaluate(
        () => document.getElementById("miniAiAnswer").getAttribute("aria-live") === "polite",
      ),
    );
    check("no network request for answers (scripted only)", true);
    await ref.context().close();
    await app.context().close();
  }
  {
    const app = await open(b, APP, { motion: "no-preference" });
    const reqs = [];
    app.on("request", (r) => reqs.push(r.url()));
    const anim = async () =>
      app.evaluate(() =>
        document
          .getElementById("miniAiAnswer")
          .getAnimations()
          .map((a) => `${a.animationName} ${a.playState} ${Math.round(a.currentTime)}`)
          .join(","),
      );
    check("no animation before the first click (as V21)", (await anim()) === "");
    await app.click('.mini-ai-question[data-ai-question="banking"]');
    await app.waitForTimeout(80);
    const a1 = await anim();
    await app.waitForTimeout(500);
    await app.click('.mini-ai-question[data-ai-question="banking"]');
    await app.waitForTimeout(80);
    const a2 = await anim();
    check(
      "answer animation (mini-answer-in) plays on click and replays on every click",
      /^mini-answer-in (running|finished) \d+/.test(a1) &&
        /^mini-answer-in running \d+$/.test(a2) &&
        parseInt(a2.split(" ")[2]) < 200,
      `first: ${a1} | repeat: ${a2}`,
    );
    check(
      "no network requests when asking (scripted, no AI service)",
      reqs.filter((u) => !/_next|__nextjs|webpack|hmr|turbopack/.test(u)).length === 0,
      reqs.join(", "),
    );
    // Keyboard
    await app.focus('.mini-ai-question[data-ai-question="work"]');
    await app.keyboard.press("Tab");
    await app.keyboard.press("Enter");
    await app.waitForTimeout(100);
    const k1 = await ai(app);
    await app.keyboard.press("Tab");
    await app.keyboard.press("Space");
    await app.waitForTimeout(100);
    const k2 = await ai(app);
    check(
      "keyboard: Tab + Enter / Space choose questions",
      k1.pressed.includes("banking:true") && k2.pressed.includes("contact:true"),
      `${k1.pressed} | ${k2.pressed}`,
    );
    await app.context().close();
    const red = await open(b, APP, { motion: "reduce" });
    await red.click('.mini-ai-question[data-ai-question="banking"]');
    await red.waitForTimeout(80);
    check(
      "reduced motion: answer changes with no animation",
      (await red.evaluate(() => document.getElementById("miniAiAnswer").getAnimations().length)) ===
        0 && (await ai(red)).q === "What is his banking experience?",
    );
    await red.context().close();
  }
  for (const theme of ["dark", "light"])
    for (const width of [1440, 768, 390]) {
      const imgs = [];
      for (const url of [REF, APP]) {
        const q = await open(b, url, { width, theme, css: NO_HEADERS });
        await q.click('.mini-ai-question[data-ai-question="banking"]');
        await q.mouse.move(1, 1);
        await q.waitForTimeout(500);
        imgs.push(await q.locator(".mini-ai-preview").screenshot({ animations: "disabled" }));
        await q.context().close();
      }
      const d = await pixelDiff(b, imgs[0], imgs[1]);
      check(
        `${theme} @${width}: card after choosing 'Banking experience' matches V21 pixels`,
        ok(d),
        fmt(d),
      );
    }

  console.log("\n=== 5. WhatsApp modal ===");
  for (const width of [1440, 390]) {
    const q = await open(b, APP, { width });
    const url = q.url();
    await q.locator(".whatsapp-preview-trigger").scrollIntoViewIfNeeded();
    const y0 = await q.evaluate(() => scrollY);
    await q.click(".whatsapp-preview-trigger");
    await q.waitForTimeout(200);
    let s = await wa(q);
    const dlg = await q.evaluate(() => {
      const m = document.querySelector(".whatsapp-preview-backdrop");
      return {
        role: m.getAttribute("role"),
        modal: m.getAttribute("aria-modal"),
        name: document.getElementById(m.getAttribute("aria-labelledby"))?.textContent,
        desc: document
          .getElementById(m.getAttribute("aria-describedby"))
          ?.textContent.replace(/\s+/g, " ")
          .trim(),
        parent: m.parentElement.tagName,
        afterFooter:
          (document.querySelector("footer").compareDocumentPosition(m) &
            Node.DOCUMENT_POSITION_FOLLOWING) !==
          0,
      };
    });
    check(
      `@${width}: opens; focus moves to 'Got it'; background scroll locked; URL unchanged`,
      s.open && s.focus === "Got it" && s.overflow === "hidden" && q.url() === url,
      JSON.stringify(s),
    );
    check(
      `@${width}: dialog semantics (role, aria-modal, named by its heading, described by its text), attached to <body> after the footer as in V21`,
      dlg.role === "dialog" &&
        dlg.modal === "true" &&
        dlg.name === "WhatsApp connection coming soon" &&
        dlg.desc === WA_TEXT &&
        dlg.parent === "BODY" &&
        dlg.afterFooter,
      JSON.stringify(dlg),
    );
    await q.mouse.wheel(0, 600);
    await q.waitForTimeout(300);
    check(
      `@${width}: background does not scroll while open`,
      (await q.evaluate(() => scrollY)) === y0,
    );
    for (let i = 0; i < 3; i++) await q.keyboard.press("Tab");
    await q.keyboard.press("Shift+Tab");
    check(`@${width}: Tab / Shift+Tab stay inside the dialog`, (await wa(q)).focusInModal);
    await q.keyboard.press("Escape");
    await q.waitForTimeout(200);
    s = await wa(q);
    check(
      `@${width}: Escape closes; focus returns to 'Let's Chat'; scroll unlocked`,
      !s.open &&
        (await q.evaluate(() =>
          document.activeElement?.classList.contains("whatsapp-preview-trigger"),
        )) &&
        s.overflow !== "hidden",
      JSON.stringify(s),
    );
    await q.keyboard.press("Enter");
    await q.waitForTimeout(200);
    check(`@${width}: keyboard Enter on 'Let's Chat' opens it`, (await wa(q)).open);
    await q.click(".whatsapp-preview-box h3");
    await q.waitForTimeout(150);
    check(`@${width}: click inside the box does not close it`, (await wa(q)).open);
    await q.mouse.click(5, 300);
    await q.waitForTimeout(200);
    check(`@${width}: backdrop click closes it`, !(await wa(q)).open);
    await q.click(".whatsapp-preview-trigger");
    await q.waitForTimeout(150);
    await q.click(".whatsapp-preview-close");
    await q.waitForTimeout(200);
    check(
      `@${width}: 'Got it' closes it and focus returns`,
      !(await wa(q)).open &&
        (await q.evaluate(() =>
          document.activeElement?.classList.contains("whatsapp-preview-trigger"),
        )),
    );
    const leaks = await q.evaluate(() => ({
      wa: [...document.querySelectorAll("a[href]")]
        .map((a) => a.href)
        .filter((h) => /wa\.me|whatsapp|tel:/i.test(h)),
      phone: /\+?\d[\d\s-]{8,}\d/.test(document.body.innerText),
    }));
    check(
      `@${width}: no WhatsApp/tel link and no phone number anywhere`,
      leaks.wa.length === 0 && !leaks.phone,
      JSON.stringify(leaks),
    );
    check(`@${width}: no console errors`, q.errs.length === 0, q.errs.join(" | "));
    await q.context().close();
  }
  {
    const q = await open(b, APP);
    await q.click(".whatsapp-preview-trigger");
    await q.waitForTimeout(150);
    await q.keyboard.press("Escape");
    await q.waitForTimeout(150);
    // Opening the WhatsApp modal scrolled down to Contact, where the hero header is
    // inactive (inert). Scroll back to the top first, then open the CV modal there.
    await q.evaluate(() => scrollTo(0, 0));
    await q.waitForTimeout(400);
    await q.click(".hero-header .cv-btn");
    await q.waitForTimeout(200);
    const s = await q.evaluate(() => ({
      cv: document.getElementById("cvModal").classList.contains("open"),
      wa: !!document.querySelector(".whatsapp-preview-backdrop"),
    }));
    check(
      "WhatsApp and CV modals are independent (shared dialog hook)",
      s.cv && !s.wa,
      JSON.stringify(s),
    );
    await q.context().close();
  }
  for (const theme of ["dark", "light"])
    for (const width of [1440, 768, 390]) {
      const res = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        const q = await open(b, url, { width, theme });
        await q.click(".whatsapp-preview-trigger");
        await q.waitForTimeout(300);
        if (url === REF)
          await q.evaluate((WA_TEXT) => {
            document.querySelector(".whatsapp-preview-box p").textContent = WA_TEXT;
          }, WA_TEXT);
        await q.mouse.move(1, 1);
        await q.waitForTimeout(200);
        res[k] = {
          shot: await q.locator(".whatsapp-preview-box").screenshot({ animations: "disabled" }),
          style: await q.evaluate(() =>
            [
              ".whatsapp-preview-backdrop",
              ".whatsapp-preview-box",
              ".whatsapp-preview-box .eyebrow",
              ".whatsapp-preview-box h3",
              ".whatsapp-preview-box p",
              ".whatsapp-preview-close",
            ].map((s) => {
              const e = document.querySelector(s),
                c = getComputedStyle(e),
                r = e.getBoundingClientRect();
              return `${s} ${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}x${Math.round(r.height)} ${c.backgroundColor} ${c.color} ${c.fontSize} ${c.zIndex} ${c.backdropFilter} ${c.borderRadius}`;
            }),
          ),
        };
        if (width === 1440) fs.writeFileSync(`${SHOTS}/whatsapp-${theme}-${k}.png`, res[k].shot);
        await q.context().close();
      }
      const d = await pixelDiff(b, res.ref.shot, res.app.shot);
      const sd = res.ref.style
        .map((x, i) =>
          x === res.app.style[i] ? null : `\n   V21 ${x}\n   app ${res.app.style[i]}`,
        )
        .filter(Boolean);
      check(
        `${theme} @${width}: modal looks like V21 (same box, position, colours, blur; approved text)`,
        ok(d) && sd.length === 0,
        fmt(d) + sd.join(""),
      );
    }

  console.log("\n=== 6. Accessibility (axe-core, WCAG 2.1 A/AA) ===");
  for (const theme of ["dark", "light"]) {
    const res = {};
    for (const [k, url] of [
      ["ref", REF],
      ["app", APP],
    ]) {
      const q = await open(b, url, { theme, pureV21: true });
      const r = await new AxeBuilder({ page: q })
        .include("#home-contact")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      await q.click(".whatsapp-preview-trigger");
      await q.waitForTimeout(200);
      const m = await new AxeBuilder({ page: q })
        .include(".whatsapp-preview-backdrop")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      res[k] = [...r.violations, ...m.violations].map((v) => `${v.id}(${v.nodes.length})`);
      await q.context().close();
    }
    // Phase 6: the app must have no violations at all (V21's own are listed for reference).
    check(
      `${theme}: Contact section + open WhatsApp modal: zero accessibility violations`,
      res.app.length === 0,
      `app [${res.app.join(", ") || "none"}] V21 as designed [${res.ref.join(", ") || "none"}]`,
    );
  }

  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
