// Phase 2 Step 2D: home Contact section, Ask Faizan AI, WhatsApp link vs V21.
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
// The approved public WhatsApp number (2026-11-26, CLAUDE.md change 30).
const WA_URL = "https://wa.me/923473057550";
const WA_NUMBER = "+92 347 3057550";
const V21_CONTACT_ANSWER =
  "You can reach Faizan through the Contact page by email, or use Let’s Chat on WhatsApp once a professional contact number is connected.";
const CONTACT_ANSWER = `You can reach Faizan by email through the Contact page, or use Let’s Chat to message him on WhatsApp at ${WA_NUMBER}.`;
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
    await p.evaluate(
      ([V21_CONTACT_ANSWER, CONTACT_ANSWER]) => {
        const s = document.getElementById("home-contact");
        const label = s.querySelector(".contact-showcase-copy > .eyebrow");
        label.textContent = label.textContent.replace(/^0\d \/ /, "");
        label.classList.add("home-section-label");
        s.querySelectorAll('a[href="contact.html"]').forEach((a) =>
          a.setAttribute("href", "/contact"),
        );
        // "Let's Chat" is already the approved WhatsApp link (harness.cjs).
        s.querySelector(".mini-ai-preview").setAttribute(
          "aria-label",
          "Ask Faizan AI (scripted demo)",
        );
        s.querySelector(".mini-ai-identity small").textContent = "Portfolio guide · Scripted demo";
        // Approved content corrections: no "kiosks" in the banking answer, and the
        // contact answer gives the WhatsApp number. V21's app.js writes the answer on
        // each click, so it is corrected as soon as it is written.
        const answer = document.getElementById("miniAiAnswer");
        new MutationObserver(() => {
          if (answer.textContent.includes(" kiosks,"))
            answer.textContent = answer.textContent.replace(" kiosks,", "");
          if (answer.textContent === V21_CONTACT_ANSWER) answer.textContent = CONTACT_ANSWER;
        }).observe(answer, { childList: true, characterData: true, subtree: true });
      },
      [V21_CONTACT_ANSWER, CONTACT_ANSWER],
    );
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
    // Approved content correction: kiosks must not appear anywhere in the portfolio.
    await app.click('.mini-ai-question[data-ai-question="banking"]');
    await app.waitForTimeout(100);
    const SRC = WEB_DIR + "/src/";
    const sources = fs
      .readdirSync(SRC, { recursive: true })
      .filter((f) => fs.statSync(SRC + f).isFile())
      .filter((f) => /kiosk/i.test(fs.readFileSync(SRC + f, "utf8")));
    const aboutHtml = await (await app.request.get(APP + "about")).text();
    check(
      "banking answer has the approved wording; 'kiosk' is not on the rendered / or /about, or anywhere in web/src",
      (await ai(app)).a ===
        "He has worked on digital banking projects involving customer channels, service integrations, and coordination across technical teams." &&
        !/kiosk/i.test(await app.evaluate(() => document.body.innerHTML)) &&
        !/kiosk/i.test(aboutHtml) &&
        sources.length === 0,
      sources.join(", "),
    );
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

  console.log("\n=== 5. WhatsApp link (approved 2026-11-26) ===");
  for (const width of [1440, 390]) {
    // wa.me is answered locally, so the test never contacts WhatsApp.
    const q = await open(b, APP, { width });
    const ctx = q.context();
    await ctx.route("https://wa.me/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<title>wa.me</title>" }),
    );
    const url = q.url();
    const link = q.locator("#home-contact .whatsapp-preview-trigger");
    const attrs = await link.evaluate((a) => ({
      tag: a.tagName,
      href: a.getAttribute("href"),
      target: a.target,
      rel: a.rel,
      name: a.getAttribute("aria-label"),
      popup: a.getAttribute("aria-haspopup"),
      text: a.textContent.replace(/\s+/g, " ").trim(),
    }));
    check(
      `@${width}: 'Let's Chat' links to ${WA_URL} in a new tab (noopener noreferrer); its name starts with the visible text and gives the number`,
      attrs.tag === "A" &&
        attrs.href === WA_URL &&
        attrs.target === "_blank" &&
        attrs.rel === "noopener noreferrer" &&
        attrs.name === `Let's Chat on WhatsApp, ${WA_NUMBER} (opens in a new tab)` &&
        attrs.popup === null &&
        attrs.text === "Let's Chat ↗",
      JSON.stringify(attrs),
    );
    await link.scrollIntoViewIfNeeded();
    const [tab] = await Promise.all([ctx.waitForEvent("page"), link.click()]);
    await tab.waitForLoadState();
    check(
      `@${width}: click opens wa.me in a new tab (no prefilled message); this page stays put with no dialog`,
      tab.url() === WA_URL &&
        q.url() === url &&
        (await q.locator('[role="dialog"]:visible, .whatsapp-preview-backdrop').count()) === 0,
      tab.url(),
    );
    await tab.close();
    await link.focus();
    const [tab2] = await Promise.all([ctx.waitForEvent("page"), q.keyboard.press("Enter")]);
    await tab2.waitForLoadState();
    check(`@${width}: keyboard Enter opens the same chat`, tab2.url() === WA_URL, tab2.url());
    await tab2.close();
    check(`@${width}: no console errors`, q.errs.length === 0, q.errs.join(" | "));
    await ctx.close();
  }
  for (const theme of ["dark", "light"]) {
    // Hover and keyboard focus look like V21's button (same lift, colours and outline).
    const res = {};
    for (const [k, url] of [
      ["ref", REF],
      ["app", APP],
    ]) {
      const q = await open(b, url, { theme, motion: "no-preference" });
      const sel = "#home-contact .whatsapp-preview-trigger";
      const look = () =>
        q.locator(sel).evaluate((e) => {
          const c = getComputedStyle(e);
          return `${c.transform} ${c.backgroundColor} ${c.color} ${c.boxShadow} ${c.outlineStyle} ${c.outlineColor} ${c.outlineWidth} ${c.outlineOffset}`;
        });
      await q.locator(sel).scrollIntoViewIfNeeded();
      await q.hover(sel);
      await q.waitForTimeout(400);
      const hover = await look();
      await q.mouse.move(1, 1);
      // Reach the link with the keyboard, so :focus-visible applies as for a visitor.
      await q.locator(sel).focus();
      await q.keyboard.press("Shift+Tab");
      await q.keyboard.press("Tab");
      await q.waitForTimeout(400);
      res[k] = { hover, focus: await look() };
      await q.context().close();
    }
    check(
      `${theme}: 'Let's Chat' hover and keyboard-focus styles match V21's button`,
      JSON.stringify(res.ref) === JSON.stringify(res.app),
      `V21 ${JSON.stringify(res.ref)} app ${JSON.stringify(res.app)}`,
    );
  }
  {
    // Number consistency: every WhatsApp link and every phone number on the site.
    const q = await open(b, APP);
    const found = [];
    for (const route of ["", "about", "projects", "experience", "contact", "faq"]) {
      await q.goto(APP + route, { waitUntil: "networkidle" });
      if (route === "") {
        await q.click('.mini-ai-question[data-ai-question="contact"]');
        await q.waitForTimeout(100);
      }
      if (route === "faq") {
        await q.click(".faq-item:nth-child(6) .faq-trigger");
        await q.waitForTimeout(400);
      }
      found.push(
        await q.evaluate(
          (route) => ({
            route: "/" + route,
            links: [...document.querySelectorAll("a[href]")]
              .map((a) => a.getAttribute("href"))
              .filter((h) => /wa\.me|whatsapp|tel:/i.test(h)),
            numbers: document.body.innerText.match(/\+?\d[\d -]{8,}\d/g) || [],
          }),
          route,
        ),
      );
    }
    const links = found.flatMap((f) => f.links);
    const numbers = found.flatMap((f) => f.numbers);
    const count = (route) => found.find((f) => f.route === route).links.length;
    check(
      `every WhatsApp link is ${WA_URL} (one on Home, one on Contact; no tel: links); every phone number shown (AI answer, Contact card, FAQ) is ${WA_NUMBER}`,
      links.length === 2 &&
        links.every((h) => h === WA_URL) &&
        count("/") === 1 &&
        count("/contact") === 1 &&
        numbers.length === 3 &&
        numbers.every((n) => n === WA_NUMBER),
      JSON.stringify(found),
    );
    await q.goto(APP, { waitUntil: "networkidle" });
    await q.click('.mini-ai-question[data-ai-question="contact"]');
    await q.waitForTimeout(100);
    check(
      "the Ask Faizan AI contact answer gives the number",
      (await ai(q)).a === CONTACT_ANSWER,
      (await ai(q)).a,
    );
    check("no console errors", q.errs.length === 0, q.errs.join(" | "));
    await q.context().close();
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
      res[k] = r.violations.map((v) => `${v.id}(${v.nodes.length})`);
      await q.context().close();
    }
    // Phase 6: the app must have no violations at all (V21's own are listed for reference).
    check(
      `${theme}: Contact section with the WhatsApp link: zero accessibility violations`,
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
