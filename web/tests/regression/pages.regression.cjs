// Phases 4-6: /projects, /projects/[slug], /experience, /contact, /faq vs V21, plus the
// site-wide production features (skip link, 404 page, SEO files, security headers).
// Run with: npm run test:regression -- pages (see tests/regression/README.md)
// PAGES=faq,contact,site limits the checks while developing; the runner's count needs all.
const { AxeBuilder } = require("@axe-core/playwright");
const { launch, appPage, referencePage, isReferenceFavicon, APP_URL } = require("./harness.cjs");

const WIDTHS = [1440, 1280, 1024, 900, 768, 620, 390, 360];
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const NO_CHROME = ".note-ribbon{display:none!important} nextjs-portal{display:none!important}";
const NO_HEADERS = ".hero-header,.floating-header{visibility:hidden!important}";
const FORBIDDEN =
  /kiosk|POS Management|SkillOrbit|AlphaSoft K60|design preview|in this preview|layout examples|Sample project/i;
const REPO = "https://github.com/faizandevx/personal-portfolio";
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};

// The approved changes, applied to each V21 page before comparing. Everything else
// must match V21. These run in the browser.
const APPLY = {
  projects: () => {
    for (const s of [".inside-hero .container > .eyebrow", ".section-heading .eyebrow"])
      document.querySelector(s).classList.add("page-section-label");
    document.querySelector(".inside-hero p").textContent =
      "A selection of my publicly shareable work.";
    document.querySelector(".section-intro").textContent =
      "A closer look at how this portfolio was designed, built and tested.";
    document.querySelector(".disclaimer").remove();
    const cards = document.querySelectorAll(".bento-card");
    cards[2].remove();
    cards[1].remove();
    document.querySelector(".bento-grid").classList.add("bento-grid-single");
    const card = cards[0];
    card.setAttribute("href", "/projects/personal-portfolio");
    card.querySelector(".eyebrow").textContent = "Web project";
    card.querySelector("h3").textContent = "Personal Portfolio";
    card.querySelector("p").textContent =
      "A responsive Next.js portfolio with dark and light themes, accessible navigation and automated visual regression testing.";
  },
  detail: () => {
    const hero = document.querySelector(".inside-hero .container");
    hero.querySelector(".eyebrow").textContent = "Case study";
    hero.querySelector(".eyebrow").classList.add("page-section-label");
    hero.querySelector("h1").innerHTML = 'Personal <span class="accent">Portfolio.</span>';
    hero.querySelector("p").textContent = "The design and engineering behind this website.";
    const main = document.querySelector(".page-content .container");
    main.querySelector(".eyebrow").textContent = "Project details";
    main.querySelector(".eyebrow").classList.add("page-section-label");
    const text = [
      "A personal portfolio migrated from an approved static design to Next.js, one phase at a time, while preserving the original look.",
      "Next.js App Router, React and strict TypeScript, using the original stylesheet alongside Tailwind CSS.",
      "Pages are compared with the approved design in both themes across eight screen widths, and tested for keyboard use and WCAG 2.1 AA issues with automated checks.",
    ];
    main.querySelectorAll(".info-card p").forEach((p, i) => (p.textContent = text[i]));
    main.querySelector(".mini-preview").remove();
    const back = main.querySelector("a.btn");
    back.setAttribute("href", "/projects");
    const row = document.createElement("div");
    row.className = "project-actions";
    back.replaceWith(row);
    row.append(back);
    row.insertAdjacentHTML(
      "beforeend",
      '<a href="https://github.com/faizandevx/personal-portfolio" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">View on GitHub <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>',
    );
  },
  experience: () => {
    for (const s of [".inside-hero .container > .eyebrow", ".page-content .container > .eyebrow"])
      document.querySelector(s).classList.add("page-section-label");
    document.querySelector(".inside-hero p").textContent =
      "A timeline of my professional roles and the scope of my work.";
    const h3s = document.querySelectorAll(".timeline-item h3");
    h3s[1].textContent = h3s[1].textContent.replace("AlphaSoft K60", "AlphaSoft360");
    // Approved 2026-11-25: the employer names link to their websites, as on Home and About.
    for (const [h3, name, href] of [
      [h3s[0], "Aman Bank", "https://www.aman-bank.com/"],
      [h3s[1], "AlphaSoft360", "https://www.alphasoft360.com/"],
    ])
      h3.innerHTML = h3.textContent.replace(
        name,
        `<a class="about-company-link" href="${href}" target="_blank" rel="noopener noreferrer">${name}<span class="sr-only"> (opens in a new tab)</span></a>`,
      );
    const cv = document.querySelector(".page-content a.cv-trigger");
    cv.setAttribute("aria-haspopup", "dialog");
    // Approved 2026-11-25: "View CV" opens the PDF in a new tab, before "Download CV".
    const row = document.createElement("div");
    row.className = "project-actions experience-cv-actions";
    cv.replaceWith(row);
    row.insertAdjacentHTML(
      "beforeend",
      '<a class="btn btn-primary" href="/cv/Faizan-Ali-CV.pdf" target="_blank" rel="noopener noreferrer">View CV <span aria-hidden="true">↗</span><span class="sr-only"> (PDF, opens in a new tab)</span></a>',
    );
    row.append(cv);
  },
  contact: () => {
    for (const s of [".inside-hero .container > .eyebrow", ".contact-form-card .eyebrow"])
      document.querySelector(s).classList.add("page-section-label");
    // Approved 2026-11-23: the hero label's two phrases never break mid-phrase.
    const label = document.querySelector(".inside-hero .container > .eyebrow");
    label.classList.add("contact-hero-label");
    label.innerHTML =
      '<span class="eyebrow-phrase">LET\'S CONNECT</span> <span class="eyebrow-line"></span> <span class="eyebrow-phrase">OPEN TO OPPORTUNITIES</span>';
    document.querySelector(".demo-disclaimer").remove();
    document.querySelector(".send-btn").innerHTML =
      'Send via email <span aria-hidden="true">↗</span>';
    document.querySelector(".privacy-note").innerHTML =
      '<span aria-hidden="true">◇</span> Opens your email app. Nothing is stored on this site.';
    // Approved 2026-11-26 (change 30): the WhatsApp card opens a chat with the public number.
    const feature = document.querySelector(".connect-feature");
    const whatsApp = document.createElement("a");
    whatsApp.className = "connect-feature";
    whatsApp.setAttribute("href", "https://wa.me/923473057550");
    whatsApp.setAttribute("target", "_blank");
    whatsApp.setAttribute("rel", "noopener noreferrer");
    whatsApp.innerHTML = feature.innerHTML;
    whatsApp.querySelector("p").textContent =
      "Message me on WhatsApp. It opens the app on your phone, or WhatsApp Web on a computer.";
    whatsApp.querySelector(".feature-action").innerHTML =
      '+92 347 3057550 <span class="soon-tag">Chat on WhatsApp</span><span class="sr-only"> (opens in a new tab)</span>';
    feature.replaceWith(whatsApp);
    // WCAG 2.5.3: the link's name comes from its visible text.
    document.querySelector("a.contact-method").removeAttribute("aria-label");
    // Approved 2026-11-27: "Copy email" beside the email card (a sibling, not inside the link).
    const email = document.querySelector('a.contact-method[href^="mailto:"]');
    const emailWrap = document.createElement("div");
    emailWrap.className = "contact-method-email";
    email.replaceWith(emailWrap);
    emailWrap.append(email);
    emailWrap.insertAdjacentHTML(
      "beforeend",
      '<button class="method-copy-btn" type="button">Copy email</button><span aria-live="polite" class="sr-only"></span>',
    );
    // Approved 2026-11-24 (change 26): the LinkedIn card links to the confirmed profile.
    const card = document.querySelector(".contact-side small").closest(".contact-method");
    const link = document.createElement("a");
    link.className = "contact-method";
    link.setAttribute("href", "https://www.linkedin.com/in/faizan-ali-5aa430380");
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.innerHTML = card.innerHTML;
    link.querySelector("strong").innerHTML =
      'LinkedIn<span class="sr-only"> (opens in a new tab)</span>';
    link.insertAdjacentHTML("beforeend", '<span aria-hidden="true" class="method-arrow">↗</span>');
    card.replaceWith(link);
  },
  faq: () => {
    for (const s of [".inside-hero .container > .eyebrow", ".faq-section-intro .eyebrow"])
      document.querySelector(s).classList.add("page-section-label");
    document.querySelector(".faq-section-intro p").textContent =
      "Choose a question to reveal its answer. For specific opportunities, you can always contact me directly.";
    document
      .querySelectorAll('main a[href="contact.html"]')
      .forEach((a) => a.setAttribute("href", "/contact"));
    const answers = {
      3: "Yes. Browse the Projects page for selected work and its case study. Some work uses private repositories or cannot disclose confidential implementation details.",
      5: "Use the “CV” button in the navigation, or “Download CV” on the homepage or the Experience page, to download my CV as a PDF.",
      6: "Use the Contact page, email me at faizandevx@gmail.com, or message me on WhatsApp at +92 347 3057550.",
      7: "No. “Ask Faizan AI” on the homepage is a scripted demo with pre-written answers about this portfolio. It isn’t a live AI, and it isn’t a replacement for contacting Faizan directly.",
    };
    document.querySelectorAll(".faq-item").forEach((item, i) => {
      const number = i + 1;
      item.querySelector(".faq-trigger").id = `faq-trigger-${number}`;
      item.querySelector(".faq-panel").setAttribute("aria-labelledby", `faq-trigger-${number}`);
      if (answers[number]) item.querySelector(".faq-answer p").textContent = answers[number];
    });
  },
};

const ALL = [
  {
    name: "projects",
    route: "projects",
    ref: "projects",
    title: "Projects | Faizan Ali, Full-Stack Developer",
    canonical: "/projects",
    current: "Projects",
  },
  {
    name: "detail",
    route: "projects/personal-portfolio",
    ref: "project-detail",
    title: "Personal Portfolio: Next.js Case Study | Faizan Ali",
    canonical: "/projects/personal-portfolio",
    current: "Projects",
  },
  {
    name: "experience",
    route: "experience",
    ref: "experience",
    title: "Experience | Faizan Ali, Software Developer & IT Project Manager",
    canonical: "/experience",
    current: "Experience",
  },
  {
    name: "contact",
    route: "contact",
    ref: "contact",
    title: "Contact Faizan Ali | Software Engineer & IT Project Manager",
    canonical: "/contact",
    current: "Contact",
  },
  {
    name: "faq",
    route: "faq",
    ref: "faq",
    title: "FAQ | Faizan Ali, Software Engineer & IT Project Manager",
    canonical: "/faq",
    current: "FAQ",
  },
];
const only = process.env.PAGES ? process.env.PAGES.split(",") : null;
const PAGES = ALL.filter((p) => !only || only.includes(p.name));

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
  await p.addStyleTag({ content: NO_CHROME + (o.css || "") });
  if (o.apply) await p.evaluate(APPLY[o.apply]);
  await p.waitForTimeout(250);
  return p;
}
const both = async (b, page, o = {}) => [
  await open(b, referencePage(page.ref), { ...o, apply: page.name }),
  await open(b, appPage(page.route), o),
];
const closeAll = (...pages) => Promise.all(pages.map((p) => p.context().close()));

// <main> node for node, without the hero header (the shell has its own suites).
const serialise = (p) =>
  p.evaluate(() => {
    const out = [];
    const walk = (n, depth) => {
      let text = "";
      const flush = () => {
        const t = text.replace(/\s+/g, " ").trim();
        if (t) out.push(`${"  ".repeat(depth)}"${t}"`);
        text = "";
      };
      for (const c of n.childNodes) {
        if (c.nodeType === 3) text += c.textContent;
        if (c.nodeType !== 1 || c.matches("header.hero-header")) continue;
        flush();
        out.push(
          `${"  ".repeat(depth)}<${c.tagName.toLowerCase()} ${[...c.attributes]
            .map((a) => `${a.name}=${a.value}`)
            .sort()
            .join(" ")}>`,
        );
        walk(c, depth + 1);
      }
      flush();
    };
    walk(document.querySelector("main"), 0);
    return out;
  });

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
  "opacity",
  "transform",
  "box-shadow",
  "grid-template-columns",
];
const measure = (p) =>
  p.evaluate((PROPS) => {
    const out = [];
    for (const e of document.querySelectorAll("main *")) {
      if (e.closest("header.hero-header")) continue;
      const r = e.getBoundingClientRect(),
        c = getComputedStyle(e);
      out.push(
        `${e.tagName.toLowerCase()}.${e.getAttribute("class") || ""} box=${[r.x, r.y + scrollY, r.width, r.height].map((v) => Math.round(v * 2) / 2).join(",")} ` +
          PROPS.map((k) => `${k}:${c.getPropertyValue(k)}`).join(";"),
      );
    }
    return out;
  }, PROPS);

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
      let diff = 0;
      for (let k = 0; k < da.length; k += 4) {
        const dr = da[k] - db[k],
          dg = da[k + 1] - db[k + 1],
          dbb = da[k + 2] - db[k + 2];
        const y = dr * 0.29889531 + dg * 0.58662247 + dbb * 0.11448223,
          i = dr * 0.59597799 - dg * 0.2741761 - dbb * 0.32180189,
          q = dr * 0.21147017 - dg * 0.52261711 + dbb * 0.31114694;
        if (0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q > max) diff++;
      }
      return { diff, total: da.length / 4 };
    },
    [pngA.toString("base64"), pngB.toString("base64")],
  );
  await p.context().close();
  return r;
}
const fmt = (d) =>
  d.sizeMismatch || `${d.diff} px beyond threshold (${((d.diff / d.total) * 100).toFixed(3)}%)`;
const ok = (d) => !d.sizeMismatch && d.diff / d.total <= 0.01;

// V21 file links in the same form as the app's routes, for comparing Tab stops.
const route = (h) =>
  h
    .replace(/^index\.html/, "/")
    .replace(/^([a-z-]+)\.html/, "/$1")
    .replace(/^\/\//, "/");
async function tabStops(p, isRef) {
  const seq = [];
  for (let i = 0; i < 90; i++) {
    await p.keyboard.press("Tab");
    // Focus scrolls the page, which slides the floating header in or out; let that
    // scroll-driven state settle so both pages are read the same way.
    await p.waitForTimeout(120);
    const f = await p.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const c = getComputedStyle(e),
        r = e.getBoundingClientRect();
      return {
        label: (e.getAttribute("aria-label") || e.innerText || "").replace(/\s+/g, " ").trim(),
        tag: e.tagName.toLowerCase(),
        href: e.getAttribute("href") || "",
        ring: c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0,
        field: e.matches("input,textarea") && c.boxShadow !== "none",
        inView: r.bottom > 0 && r.top < innerHeight,
        hidden: !!e.closest("[inert], [aria-hidden='true']"),
      };
    });
    if (!f || (seq.length && f.label === seq[0].label && f.href === seq[0].href)) break;
    seq.push(f);
  }
  return seq.map((f) => ({
    ...f,
    href: isRef ? route(f.href) : f.href,
    label: isRef && f.label === "Faizan Ali home" ? "FA Faizan Ali, go to homepage" : f.label,
  }));
}

async function pageChecks(b, page) {
  console.log(`\n=== ${page.name}: /${page.route} vs ${page.ref}.html ===`);
  {
    const [ref, app] = await both(b, page);
    const [r, a] = [await serialise(ref), await serialise(app)];
    const diffs = [];
    for (let i = 0; i < Math.max(r.length, a.length); i++)
      if (r[i] !== a[i]) diffs.push(`\n   line ${i}: V21 ${r[i]}\n           app ${a[i]}`);
    check(
      `${page.name}: ${a.length} nodes in <main> match V21 node for node (with the approved changes)`,
      diffs.length === 0,
      diffs.slice(0, 4).join(""),
    );
    const m = await app.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogTitle: document.querySelector('meta[property="og:title"]')?.content,
      ogImage: document.querySelector('meta[property="og:image"]')?.content,
      card: document.querySelector('meta[name="twitter:card"]')?.content,
      twImage: document.querySelector('meta[name="twitter:image"]')?.content,
      h1: document.querySelectorAll("h1").length,
      labels: [...document.querySelectorAll(".page-section-label")].map(
        (e) => getComputedStyle(e).fontSize,
      ),
      headers: document.querySelectorAll("header").length,
      current: [...document.querySelectorAll(".hero-header .nav-links a.current")].map((a) =>
        a.innerText.trim(),
      ),
      text: document.body.innerText + document.documentElement.innerHTML,
    }));
    check(
      `${page.name}: title, description, canonical link, Open Graph title and share image, large Twitter card, with no preview wording`,
      m.title === page.title &&
        m.desc &&
        !/preview|demo/i.test(m.desc) &&
        new URL(m.canonical).pathname === page.canonical &&
        m.ogTitle === page.title &&
        new URL(m.ogImage).pathname === "/opengraph-image" &&
        m.card === "summary_large_image" &&
        new URL(m.twImage).pathname === "/opengraph-image",
      `${m.title} | ${m.canonical} | ${m.ogTitle} | ${m.ogImage} | ${m.card}`,
    );
    check(
      `${page.name}: one h1, two main labels at the approved 15px, one hero + one floating header, '${page.current}' current`,
      m.h1 === 1 &&
        m.labels.length === 2 &&
        m.labels.every((s) => s === "15px") &&
        m.headers === 2 &&
        m.current.join() === page.current,
      JSON.stringify({ ...m, text: "" }),
    );
    check(
      `${page.name}: no preview wording, excluded projects, kiosk references or old employer name in the rendered page`,
      !FORBIDDEN.test(m.text),
      (m.text.match(FORBIDDEN) || []).join(),
    );
    await closeAll(ref, app);
  }
  for (const theme of ["dark", "light"])
    for (const width of WIDTHS) {
      const [ref, app] = await both(b, page, { width, theme });
      const [r, a] = [await measure(ref), await measure(app)];
      const diffs = r
        .map((x, i) =>
          x === a[i] ? null : `\n   V21 ${x.slice(0, 200)}\n   app ${(a[i] || "").slice(0, 200)}`,
        )
        .filter(Boolean);
      check(
        `${page.name} ${theme} @${width}: all ${a.length} elements same position, size and ${PROPS.length} styles as V21`,
        diffs.length === 0 && r.length === a.length,
        diffs.slice(0, 2).join(""),
      );
      const over = await app.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      check(
        `${page.name} ${theme} @${width}: no horizontal overflow, no console errors`,
        over <= 0 && app.errs.length === 0,
        `overflow ${over}px ${app.errs.join(" | ")}`,
      );
      const shots = [];
      for (const q of [ref, app]) {
        await q.addStyleTag({ content: NO_HEADERS });
        shots.push(await q.screenshot({ fullPage: true, animations: "disabled" }));
      }
      const d = await pixelDiff(b, shots[0], shots[1]);
      check(`${page.name} ${theme} @${width}: full-page pixels`, ok(d), fmt(d));
      await closeAll(ref, app);
    }
  for (const theme of ["dark", "light"])
    for (const width of [1440, 768, 390]) {
      const q = await open(b, appPage(page.route), { width, theme });
      const r = await new AxeBuilder({ page: q }).withTags(AXE_TAGS).analyze();
      check(
        `${page.name} ${theme} @${width}: zero accessibility violations`,
        r.violations.length === 0,
        r.violations
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)
          .join(" ;; "),
      );
      await q.context().close();
    }
  for (const width of [1440, 390]) {
    const [ref, app] = await both(b, page, { width });
    const [rs, as] = [await tabStops(ref, true), await tabStops(app, false)];
    const key = (f) => `${f.tag} "${f.label}" ${f.href}`;
    const [r, a] = [rs.map(key), as.map(key)];
    const bad = as.filter((f) => !(f.ring || f.field) || !f.inView || f.hidden).map(key);
    check(
      `${page.name} @${width}: skip link, then ${a.length} Tab stops in V21's order; each visibly focused, in view and not hidden`,
      as[0].label === "Skip to main content" &&
        JSON.stringify(r) === JSON.stringify(a) &&
        bad.length === 0,
      r
        .map((x, i) => (x === a[i] ? null : `${i}: V21 ${x} | app ${a[i]}`))
        .filter(Boolean)
        .concat(bad.map((x) => `no focus style / hidden: ${x}`))
        .join(" ;; "),
    );
    await closeAll(ref, app);
  }
  for (const motion of ["no-preference", "reduce"]) {
    const read = (p) =>
      p.evaluate(() =>
        [...document.querySelectorAll("main *")]
          .filter((e) => !e.closest("header.hero-header"))
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
    const [ref, app] = await both(b, page, { motion });
    const [r, a] = [await read(ref), await read(app)];
    check(
      `${page.name} motion=${motion}: the same ${a.length} animated or transitioning elements as V21`,
      JSON.stringify(r) === JSON.stringify(a),
      r
        .filter((x, i) => x !== a[i])
        .slice(0, 2)
        .join(" | "),
    );
    await closeAll(ref, app);
  }
}

// Behaviour that only one page has.
const BEHAVIOUR = {
  async projects(b, page) {
    const [ref, app] = await both(b, page, { motion: "no-preference" });
    const read = (q) =>
      q.locator(".bento-card").evaluate((e) => {
        const s = getComputedStyle(e);
        return `${s.transform} ${s.borderColor} ${s.boxShadow}`;
      });
    await ref.hover(".bento-card");
    await app.hover(".bento-card");
    await app.waitForTimeout(500);
    const [r, a] = [await read(ref), await read(app)];
    check("project card: same hover lift, border and shadow as V21", r === a && /-4/.test(a), a);
    await closeAll(ref, app);
    for (const width of [1440, 900, 390]) {
      const q = await open(b, appPage(page.route), { width });
      const s = await q.evaluate(() => {
        const card = document.querySelector(".bento-card").getBoundingClientRect();
        const box = document.querySelector(".bento-grid").getBoundingClientRect();
        return {
          cards: document.querySelectorAll(".bento-card").length,
          c: card.width,
          w: box.width,
        };
      });
      check(
        `project card @${width}: one card, full grid width`,
        s.cards === 1 && s.c === s.w,
        JSON.stringify(s),
      );
      await q.context().close();
    }
    const q = await open(b, appPage(page.route));
    await q.click(".bento-card");
    await q.waitForURL("**/projects/personal-portfolio", { timeout: 8000 }).catch(() => {});
    // Cache Components keeps visited routes in the DOM with display:none, so only
    // the visible h1 belongs to the current page.
    await q.waitForTimeout(300);
    check(
      "project card opens its case study",
      q.url().endsWith("/projects/personal-portfolio") &&
        (await q.locator("h1:visible").innerText()) === "Personal Portfolio.",
      q.url(),
    );
    await q.context().close();
  },
  async detail(b, page) {
    const q = await open(b, appPage(page.route));
    const gh = await q.locator(".project-actions a[target]").evaluate((a) => ({
      href: a.href,
      rel: a.rel,
      target: a.target,
    }));
    check(
      "GitHub link goes to the verified public repository in a new tab, with rel=noopener noreferrer",
      gh.href === REPO && gh.rel === "noopener noreferrer" && gh.target === "_blank",
      JSON.stringify(gh),
    );
    check(
      "no screenshot panel until real screenshots exist",
      (await q.locator(".mini-preview").count()) === 0,
    );
    await q.click(".project-actions a[href='/projects']");
    await q.waitForURL("**/projects", { timeout: 8000 }).catch(() => {});
    check("'Back to Projects' returns to /projects", q.url().endsWith("/projects"), q.url());
    await q.context().close();
    const miss = await open(b, appPage("projects/not-a-project"));
    const res = await miss.request.get(appPage("projects/not-a-project"));
    check(
      "an unknown project shows the site's 404 page with status 404",
      res.status() === 404 && (await miss.locator("h1").innerText()) === "This page doesn't exist.",
      String(res.status()),
    );
    await miss.context().close();
  },
  async experience(b, page) {
    const q = await open(b, appPage(page.route));
    const t = await q.evaluate(() => ({
      roles: [...document.querySelectorAll(".timeline-item h3")].map((e) =>
        e.textContent.replace(" (opens in a new tab)", ""),
      ),
      links: [...document.querySelectorAll(".timeline a")].map(
        (a) =>
          `${a.firstChild.textContent} ${a.href} ${a.target} ${a.rel} ${a.className} ${a.parentElement.tagName}`,
      ),
    }));
    const link = q.locator(".timeline a").first();
    const before = await link.evaluate((a) => getComputedStyle(a).color);
    await link.hover();
    await q.waitForTimeout(350);
    const hovered = await link.evaluate((a) => getComputedStyle(a).color);
    const orange = await q.evaluate(
      () => getComputedStyle(document.querySelector(".timeline-item .time")).color,
    );
    check(
      "timeline: IT Project Manager · Aman Bank and Software Developer · AlphaSoft360; only the employer names link to their websites in a new tab and turn orange on hover",
      t.roles.join("|") === "IT Project Manager · Aman Bank|Software Developer · AlphaSoft360" &&
        t.links.join("|") ===
          "Aman Bank https://www.aman-bank.com/ _blank noopener noreferrer about-company-link H3|AlphaSoft360 https://www.alphasoft360.com/ _blank noopener noreferrer about-company-link H3" &&
        before !== hovered &&
        hovered === orange,
      JSON.stringify({ ...t, before, hovered, orange }),
    );
    const view = await q.evaluate(() => {
      const a = document.querySelector(".experience-cv-actions a.btn-primary");
      const d = document.querySelector(".experience-cv-actions a.cv-trigger");
      const [ra, rd] = [a.getBoundingClientRect(), d.getBoundingClientRect()];
      return {
        attrs: `${a.getAttribute("href")} ${a.target} ${a.rel} ${a.hasAttribute("download")}`,
        name: a.textContent,
        sideBySide: Math.round(ra.top) === Math.round(rd.top) && ra.right < rd.left,
      };
    });
    const [tab] = await Promise.all([
      q.context().waitForEvent("page"),
      q.click(".experience-cv-actions a.btn-primary"),
    ]);
    await tab.waitForLoadState("domcontentloaded").catch(() => {});
    const tabUrl = new URL(tab.url()).pathname;
    await tab.close();
    await q.click(".page-content a.cv-trigger");
    await q.waitForTimeout(200);
    const opened = await q.locator("#cvModal.open").count();
    await q.keyboard.press("Escape");
    await q.waitForTimeout(200);
    const refocused = await q.evaluate(() =>
      document.activeElement.matches(".page-content a.cv-trigger"),
    );
    check(
      "'View CV' opens the PDF in a new tab, beside 'Download CV', which opens the CV modal; Escape closes it and returns focus",
      view.attrs === "/cv/Faizan-Ali-CV.pdf _blank noopener noreferrer false" &&
        view.name === "View CV ↗ (PDF, opens in a new tab)" &&
        view.sideBySide &&
        tabUrl === "/cv/Faizan-Ali-CV.pdf" &&
        opened === 1 &&
        refocused &&
        (await q.locator("#cvModal.open").count()) === 0,
      JSON.stringify({ ...view, tabUrl }),
    );
    await q.context().close();
  },
  async contact(b, page) {
    {
      // Approved 2026-11-23: one line where it fits, otherwise two whole phrases.
      const lines = [];
      for (const width of [1440, 620, 480, 390, 360]) {
        const p = await open(b, appPage(page.route), { width });
        lines.push(
          await p.evaluate(() => {
            const label = document.querySelector(".contact-hero-label");
            const rows = new Set(
              [...label.querySelectorAll(".eyebrow-phrase")].flatMap((s) =>
                [...s.getClientRects()].map((r) => Math.round(r.top)),
              ),
            );
            const phrases = [...label.querySelectorAll(".eyebrow-phrase")].map(
              (s) => s.getClientRects().length,
            );
            const line = getComputedStyle(label.querySelector(".eyebrow-line")).display;
            return `${rows.size}:${phrases.join("")}:${line}`;
          }),
        );
        await p.context().close();
      }
      check(
        "hero label: one line with the divider at 620px+, two whole phrases without it at 480px and below",
        lines.join() === "1:11:inline-block,1:11:inline-block,2:11:none,2:11:none,2:11:none",
        lines.join(),
      );
    }
    const q = await open(b, appPage(page.route));
    const mailto = [];
    const cdp = await q.context().newCDPSession(q);
    await cdp.send("Page.enable");
    cdp.on("Page.frameRequestedNavigation", (e) => {
      if (e.url.startsWith("mailto:")) mailto.push(e.url);
    });
    const requests = [];
    q.on("request", (r) => {
      if (r.method() !== "GET") requests.push(r.url());
    });
    const status = () =>
      q.locator(".form-status").evaluate((e) => ({ hidden: e.hidden, text: e.textContent }));
    const invalid = () =>
      q.evaluate(() => [...document.querySelectorAll("form :invalid")].map((e) => e.name));
    await q.click(".send-btn");
    await q.waitForTimeout(200);
    check(
      "empty form: the browser blocks it on name, email and message; nothing opens",
      (await invalid()).join() === "name,email,message" &&
        mailto.length === 0 &&
        (await status()).hidden,
      (await invalid()).join(),
    );
    await q.fill("#contact-name", "   ");
    await q.fill("#contact-email", "alex@example.com");
    await q.fill("#contact-message", "   ");
    await q.click(".send-btn");
    await q.waitForTimeout(200);
    check(
      "spaces-only name and message are rejected",
      (await invalid()).join() === "name,message" && mailto.length === 0,
      (await invalid()).join(),
    );
    await q.fill("#contact-name", "Alex");
    await q.fill("#contact-email", "not-an-email");
    await q.fill("#contact-message", "Hello");
    await q.click(".send-btn");
    await q.waitForTimeout(200);
    check(
      "a badly formed email address is rejected",
      (await invalid()).join() === "email" && mailto.length === 0,
      (await invalid()).join(),
    );
    await q.fill("#contact-name", " Alex Morgan ");
    await q.fill("#contact-email", "alex@example.com");
    await q.fill("#contact-phone", "+1 555 0100");
    await q.fill("#contact-message", "Hello & welcome?\nSecond line");
    await q.click(".send-btn");
    await q.waitForTimeout(400);
    const u = new URL(mailto[0] || "mailto:none");
    const body = u.searchParams.get("body") || "";
    check(
      "valid form opens a prefilled email to faizandevx@gmail.com, encoding special characters",
      mailto.length === 1 &&
        u.pathname === "faizandevx@gmail.com" &&
        u.searchParams.get("subject") === "Portfolio enquiry from Alex Morgan" &&
        body.includes("Name: Alex Morgan") &&
        body.includes("Email: alex@example.com") &&
        body.includes("Phone: +1 555 0100") &&
        body.includes("Hello & welcome?") &&
        body.includes("Second line"),
      mailto[0],
    );
    const s = await status();
    check(
      "status message says the email app should open, gives the address, and never claims the message was sent",
      !s.hidden &&
        s.text.includes("email app should open") &&
        s.text.includes("faizandevx@gmail.com") &&
        !/\bsent\b/i.test(s.text),
      s.text,
    );
    await q.fill("#contact-subject", "A role");
    await q.click(".send-btn");
    await q.waitForTimeout(300);
    check(
      "the visitor's subject is used when given; the form posts nothing to any server",
      new URL(mailto[1] || "mailto:none").searchParams.get("subject") === "A role" &&
        requests.length === 0,
      requests.join(", "),
    );
    // Direct delivery is off without RESEND_API_KEY (as on this dev server): the API says so
    // and the page keeps the mailto form unchanged (tests/contact-delivery covers it on).
    const api = await q.evaluate(async () => {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      return `${r.status} ${(await r.json()).error}`;
    });
    check(
      "no delivery key: /api/contact answers 503 not_configured; the form stays mailto (no spam trap)",
      api === "503 not_configured" &&
        (await q.locator(".contact-trap").count()) === 0 &&
        (await q.locator(".send-btn").innerText()).startsWith("Send via email"),
      api,
    );
    // Without an email app, the visitor can copy the address from the status message.
    await q.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await q.click(".form-status .copy-email");
    await q.waitForTimeout(200);
    check(
      "'Copy email address' copies faizandevx@gmail.com and says so; the address stays visible",
      (await q.evaluate(() => navigator.clipboard.readText())) === "faizandevx@gmail.com" &&
        (await q.locator(".form-status .copy-email").innerText()) === "Address copied" &&
        (await q.locator(".form-status").innerText()).includes("faizandevx@gmail.com"),
      await q.locator(".form-status").innerText(),
    );
    const card = await q.locator("main a.connect-feature").evaluate((a) => ({
      href: a.getAttribute("href"),
      target: a.target,
      rel: a.rel,
      text: a.innerText.replace(/\s+/g, " "),
    }));
    check(
      "WhatsApp card opens https://wa.me/923473057550 in a new tab and shows +92 347 3057550; email links to mailto; LinkedIn opens the confirmed profile; no other WhatsApp link",
      card.href === "https://wa.me/923473057550" &&
        card.target === "_blank" &&
        card.rel === "noopener noreferrer" &&
        card.text.includes("+92 347 3057550") &&
        !/coming soon/i.test(card.text) &&
        (await q.locator('a.contact-method[href="mailto:faizandevx@gmail.com"]').count()) === 1 &&
        (await q
          .locator(
            'main a.contact-method[href="https://www.linkedin.com/in/faizan-ali-5aa430380"][target="_blank"][rel="noopener noreferrer"]',
          )
          .count()) === 1 &&
        (await q.locator('main a[href*="whatsapp" i], main a[href*="wa.me" i]').count()) === 1,
      JSON.stringify(card),
    );
    await q.context().close();
    const [ref, app] = await both(b, page, { motion: "no-preference" });
    const read = (p, sel) =>
      p.locator(sel).evaluate((e) => {
        const c = getComputedStyle(e);
        return `${c.transform} ${c.borderColor} ${c.boxShadow} ${c.backgroundColor}`;
      });
    await ref.focus("#contact-name");
    await app.focus("#contact-name");
    await app.waitForTimeout(400);
    check(
      "field focus style matches V21",
      (await read(ref, "#contact-name")) === (await read(app, "#contact-name")),
    );
    await ref.hover('a.contact-method[href^="mailto:"]');
    await app.hover('a.contact-method[href^="mailto:"]');
    await app.waitForTimeout(500);
    check(
      "email method hover matches V21",
      (await read(ref, 'a.contact-method[href^="mailto:"]')) ===
        (await read(app, 'a.contact-method[href^="mailto:"]')),
    );
    // The WhatsApp card is a link now: it lifts 2px on hover and shows the orange focus
    // outline from the keyboard (V21's card was static, so the app is checked alone).
    const look = () =>
      app.locator("a.connect-feature").evaluate((e) => {
        const c = getComputedStyle(e);
        return {
          transform: c.transform,
          outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor}`,
          orange: getComputedStyle(document.documentElement).getPropertyValue("--orange").trim(),
        };
      });
    await app.mouse.move(1, 1);
    const idle = await look();
    await app.hover("a.connect-feature");
    await app.waitForTimeout(500);
    const hovered = await look();
    await app.mouse.move(1, 1);
    await app.locator("a.connect-feature").focus();
    await app.keyboard.press("Shift+Tab");
    await app.keyboard.press("Tab");
    await app.waitForTimeout(300);
    const focused = await look();
    check(
      "WhatsApp card: still at rest, lifts 2px on hover, orange outline on keyboard focus",
      idle.transform === "none" &&
        hovered.transform === "matrix(1, 0, 0, 1, 0, -2)" &&
        focused.outline.startsWith("solid 2px"),
      JSON.stringify({ idle, hovered, focused }),
    );
    // Email card (2026-11-27): the whole card is the mailto link, and "Copy email" is a
    // sibling button for visitors whose computer has no email app.
    const emailCard = 'a.contact-method[href^="mailto:"]';
    const mailNav = [];
    const emailCdp = await app.context().newCDPSession(app);
    await emailCdp.send("Page.enable");
    emailCdp.on("Page.frameRequestedNavigation", (e) => mailNav.push(e.url));
    await app.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const structure = await app.evaluate((sel) => {
      const a = document.querySelector(sel);
      const btn = document.querySelector(".method-copy-btn");
      const ar = a.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      return {
        nested: a.contains(btn) || !!a.querySelector("a, button"),
        sibling: btn.parentElement === a.parentElement,
        inCard:
          br.left >= ar.left && br.right <= ar.right && br.top >= ar.top && br.bottom <= ar.bottom,
        name: btn.textContent,
        type: btn.type,
      };
    }, emailCard);
    await app.mouse.move(1, 1);
    await app.click(`${emailCard} .method-copy strong`);
    await app.waitForTimeout(300);
    check(
      "Email card: the whole card is the mailto link (a click opens mailto:faizandevx@gmail.com); 'Copy email' sits in the card as a sibling button, not inside the link",
      mailNav.join() === "mailto:faizandevx@gmail.com" &&
        !structure.nested &&
        structure.sibling &&
        structure.inCard &&
        structure.name === "Copy email" &&
        structure.type === "button",
      JSON.stringify({ structure, mailNav }),
    );
    await app.locator(emailCard).focus();
    await app.keyboard.press("Tab");
    const copyFocus = await app.evaluate(() => {
      const e = document.activeElement;
      const c = getComputedStyle(e);
      return { cls: e.className, outline: `${c.outlineStyle} ${c.outlineWidth}` };
    });
    await app.keyboard.press("Enter");
    await app.waitForTimeout(300);
    const copied = {
      clipboard: await app.evaluate(() => navigator.clipboard.readText()),
      text: await app.locator(".method-copy-btn").innerText(),
      live: await app.locator(".contact-method-email [aria-live=polite]").textContent(),
    };
    check(
      "'Copy email' is the next Tab stop after the card, with the orange outline on keyboard focus; Enter copies faizandevx@gmail.com, shows 'Copied' and announces it",
      copyFocus.cls === "method-copy-btn" &&
        copyFocus.outline.startsWith("solid 2px") &&
        copied.clipboard === "faizandevx@gmail.com" &&
        copied.text === "Copied" &&
        copied.live === "Email address copied.",
      JSON.stringify({ copyFocus, copied }),
    );
    const lift = () =>
      app.evaluate(
        (sel) => ({
          card: getComputedStyle(document.querySelector(sel)).transform,
          button: getComputedStyle(document.querySelector(".method-copy-btn")).transform,
        }),
        emailCard,
      );
    await app.locator(emailCard).blur();
    await app.mouse.move(1, 1);
    await app.waitForTimeout(500);
    const rest = await lift();
    await app.hover(emailCard);
    await app.waitForTimeout(500);
    const overCard = await lift();
    await app.hover(".method-copy-btn");
    await app.waitForTimeout(500);
    const overButton = await lift();
    check(
      "Email card and 'Copy email' rest together and lift 2px together, whether the card or the button is hovered",
      rest.card === "none" &&
        rest.button === "none" &&
        [overCard, overButton].every(
          (l) => l.card === "matrix(1, 0, 0, 1, 0, -2)" && l.button === "matrix(1, 0, 0, 1, 0, -2)",
        ),
      JSON.stringify({ rest, overCard, overButton }),
    );
    await closeAll(ref, app);
  },
  async faq(b, page) {
    const state = (p) =>
      p.evaluate(() =>
        [...document.querySelectorAll(".faq-item")]
          .map((i) => {
            const t = i.querySelector(".faq-trigger"),
              f = i.querySelector(".faq-panel");
            return `${i.classList.contains("is-open")}/${t.getAttribute("aria-expanded")}/${f.getAttribute("aria-hidden")}/${f.inert}`;
          })
          .join(" "),
      );
    const [ref, app] = await both(b, page);
    let same = (await state(ref)) === (await state(app));
    const closed = await state(app);
    check(
      "FAQ starts with all 8 answers closed and inert",
      same &&
        closed.split(" ").every((x) => x === "false/false/true/true") &&
        closed.split(" ").length === 8,
      closed,
    );
    for (const step of [1, 4, 4, 8]) {
      for (const p of [ref, app]) await p.click(`.faq-item:nth-child(${step}) .faq-trigger`);
      await app.waitForTimeout(100);
      same &&= (await state(ref)) === (await state(app));
    }
    check(
      "open, switch, re-close: only one answer open at a time, same states as V21",
      same &&
        (await state(app))
          .split(" ")
          .map((x) => x.startsWith("true/true"))
          .lastIndexOf(true) === 7 &&
        (await state(app)).split(" ").filter((x) => x.startsWith("true/true")).length === 1,
      await state(app),
    );
    await closeAll(ref, app);
    const q = await open(b, appPage(page.route));
    await q.focus(".faq-item:nth-child(2) .faq-trigger");
    await q.keyboard.press("Enter");
    await q.waitForTimeout(100);
    const enter = await q.locator(".faq-item:nth-child(2)").getAttribute("class");
    await q.keyboard.press("Space");
    await q.waitForTimeout(100);
    const space = await q.locator(".faq-item:nth-child(2)").getAttribute("class");
    check(
      "keyboard: Enter opens and Space closes an answer",
      enter.includes("is-open") && !space.includes("is-open"),
    );
    const panel = await q.locator("#faq-panel-1").evaluate((e) => ({
      role: e.getAttribute("role"),
      name: document.getElementById(e.getAttribute("aria-labelledby"))?.innerText,
    }));
    check(
      "each answer is a region named by its question",
      panel.role === "region" && panel.name.includes("What kind of work does Faizan do?"),
      JSON.stringify(panel),
    );
    await q.context().close();
    const m = await open(b, appPage(page.route), { motion: "no-preference" });
    await m.click(".faq-item:nth-child(1) .faq-trigger");
    await m.waitForTimeout(800);
    const h = await m.locator("#faq-panel-1").evaluate((e) => e.getBoundingClientRect().height);
    check("an opened answer expands to its full height", h > 40, `${h}px`);
    await m.context().close();
    const red = await open(b, appPage(page.route));
    await red.click(".faq-item:nth-child(1) .faq-trigger");
    const dur = await red
      .locator("#faq-panel-1")
      .evaluate((e) => getComputedStyle(e).transitionDuration);
    check("reduced motion: the accordion does not animate", /^0s/.test(dur), dur);
    await red.context().close();
  },
};

async function siteChecks(b) {
  console.log("\n=== Site-wide: navigation, SEO, 404, production ===");
  const ROUTES = [
    "",
    "about",
    "projects",
    "projects/personal-portfolio",
    "experience",
    "contact",
    "faq",
  ];
  const req = (await b.newContext()).request;
  const seen = new Set();
  for (const r of ROUTES) {
    const q = await open(b, appPage(r));
    const hrefs = await q.evaluate(() => [
      ...new Set(
        [...document.querySelectorAll("a[href]")]
          .map((a) => a.getAttribute("href"))
          .filter((h) => /^\/|^#/.test(h) && h !== "#cv-preview" && h !== "#main-content"),
      ),
    ]);
    const bad = [];
    for (const h of hrefs) {
      const u = new URL(h, appPage(r));
      const res = await q.request.get(u.origin + u.pathname);
      if (res.status() !== 200) bad.push(`${h} ${res.status()}`);
      if (u.hash && !(await res.text()).includes(`id="${u.hash.slice(1)}"`))
        bad.push(`${h} no target`);
      seen.add(u.pathname);
    }
    const text = await q.evaluate(() => document.body.innerText + document.body.innerHTML);
    check(
      `/${r}: every internal link works; no kiosk references or excluded projects`,
      bad.length === 0 && !/kiosk|POS Management|SkillOrbit/i.test(text),
      bad.join(" | "),
    );
    const skip = await q.evaluate(() => {
      const e = document.querySelector(".skip-link");
      return e.getBoundingClientRect().bottom <= 0;
    });
    await q.keyboard.press("Tab");
    const focused = await q.evaluate(() => {
      const e = document.activeElement,
        s = e.getBoundingClientRect();
      return e.matches(".skip-link") && s.top >= 0 && s.bottom <= innerHeight;
    });
    await q.keyboard.press("Enter");
    await q.waitForTimeout(150);
    await q.keyboard.press("Tab");
    const next = await q.evaluate(() => !!document.activeElement.closest("main"));
    check(
      `/${r}: skip link is off-screen until focused, then moves keyboard focus into <main>`,
      skip && focused && next && q.url().endsWith("#main-content"),
      `${skip} ${focused} ${next} ${q.url()}`,
    );
    const theme = q.locator(".hero-header:visible .theme-toggle");
    await q.evaluate(() => scrollTo(0, 0));
    await q.waitForTimeout(150);
    const before = await q.evaluate(() => document.documentElement.dataset.theme);
    await theme.click();
    const after = await q.evaluate(() => ({
      t: document.documentElement.dataset.theme,
      s: localStorage.getItem("fa-theme"),
    }));
    check(
      `/${r}: theme toggle switches and saves the theme`,
      before === "dark" && after.t === "light" && after.s === "light",
      JSON.stringify(after),
    );
    await q.context().close();
  }
  check(
    "the site links to no unbuilt page: all of /, /about, /projects, /experience, /contact, /faq are reached",
    ["/", "/about", "/projects", "/experience", "/contact", "/faq"].every((p) => seen.has(p)),
    [...seen].join(" "),
  );
  {
    const q = await open(b, appPage("no-such-page"));
    const res = await q.request.get(appPage("no-such-page"));
    const m = await q.evaluate(() => ({
      h1: document.querySelector("h1").innerText,
      robots: document.querySelector('meta[name="robots"]')?.content,
      header: !!document.querySelector(".inside-hero .hero-header"),
      footer: !!document.querySelector(".site-footer"),
      links: [...document.querySelectorAll("main .btn")].map((a) => a.getAttribute("href")).join(),
    }));
    check(
      "404 page: status 404, noindex, the site's header and footer, and links back into the site",
      res.status() === 404 &&
        m.h1 === "This page doesn't exist." &&
        /noindex/.test(m.robots) &&
        m.header &&
        m.footer &&
        m.links === "/,/projects",
      JSON.stringify(m),
    );
    const axe = await new AxeBuilder({ page: q }).withTags(AXE_TAGS).analyze();
    check(
      "404 page: zero accessibility violations",
      axe.violations.length === 0,
      axe.violations.map((v) => v.id).join(),
    );
    await q.context().close();
  }
  {
    // Approved 2026-11-23: on tall screens the 404 hero grows so the footer reaches the
    // bottom of the window; after leaving the 404, the home page is laid out as before.
    const fills = [];
    for (const [width, height] of [
      [1440, 1600],
      [1920, 1080],
      [390, 1100],
      [1440, 600],
    ]) {
      const p = await open(b, appPage("no-such-page"), { width, height });
      fills.push(
        await p.evaluate(() => {
          const foot = document.querySelector(".site-footer").getBoundingClientRect().bottom;
          const doc = document.documentElement.scrollHeight;
          return Math.abs(foot + window.scrollY - doc) <= 1 && doc >= innerHeight;
        }),
      );
      await p.context().close();
    }
    const p = await open(b, appPage("no-such-page"), { width: 1440, height: 1600 });
    await p.locator("main:visible a.btn-primary").click();
    await p.waitForURL((url) => url.pathname === "/");
    await p.waitForTimeout(400);
    const home = await p.evaluate(() => {
      const hidden = document.querySelector("main.not-found-main");
      return {
        body: getComputedStyle(document.body).display,
        hidden404: !hidden || getComputedStyle(hidden).display === "none",
      };
    });
    await p.context().close();
    check(
      "404 page: the footer reaches the bottom of tall windows; other pages keep the normal body layout",
      fills.every(Boolean) && home.body === "block" && home.hidden404,
      JSON.stringify({ fills, home }),
    );
  }
  {
    const sitemap = await (await req.get(appPage("sitemap.xml"))).text();
    const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    // Each listed page names its own sitemap URL as its canonical link, and its
    // structured data (the site graph, then the page's own) describes that URL.
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    const SITE = locs[0];
    const canonicals = [];
    const pageLd = [];
    for (const loc of locs) {
      const page = await (await req.get(appPage(new URL(loc).pathname.slice(1)))).text();
      canonicals.push(page.match(/<link rel="canonical" href="([^"]+)"/)?.[1]);
      const blocks = [...page.matchAll(/application\/ld\+json">(.*?)<\/script>/g)].map((m) =>
        JSON.parse(m[1]),
      );
      const [webPage, crumbs] = blocks[1]?.["@graph"] || [];
      const title = page.match(/<title>(.*?)<\/title>/)?.[1].replace(/&amp;/g, "&");
      pageLd.push({
        blocks: blocks.length,
        type: webPage?.["@type"],
        url: webPage?.url,
        site: webPage?.isPartOf?.["@id"],
        title: webPage?.name === title,
        crumbs: crumbs?.itemListElement?.map((c) => c.item).join(" "),
      });
    }
    const types = {
      "/": "WebPage",
      "/about": "ProfilePage",
      "/projects": "CollectionPage",
      "/projects/personal-portfolio": "WebPage",
      "/experience": "WebPage",
      "/contact": "ContactPage",
      "/faq": "FAQPage",
    };
    check(
      "sitemap.xml lists the six pages and the case study; each page's canonical link, page type, structured-data URL and breadcrumbs match it",
      JSON.stringify(urls.sort()) === JSON.stringify(ROUTES.map((r) => `/${r}`).sort()) &&
        locs.every((loc, i) => {
          const path = new URL(loc).pathname;
          const d = pageLd[i];
          const trail =
            path === "/"
              ? undefined
              : path === "/projects/personal-portfolio"
                ? [SITE, `${SITE}/projects`, loc].join(" ")
                : [SITE, loc].join(" ");
          return (
            canonicals[i] === loc &&
            d.blocks === 2 &&
            d.type === types[path] &&
            d.url === loc &&
            d.site === `${SITE}/#website` &&
            d.title &&
            d.crumbs === trail
          );
        }),
      urls.join(" ") + " | " + JSON.stringify(pageLd.map((d, i) => ({ c: canonicals[i], ...d }))),
    );
    const robots = await (await req.get(appPage("robots.txt"))).text();
    check(
      "robots.txt allows crawling and names the sitemap",
      /Allow: \//.test(robots) && /Sitemap: .*\/sitemap\.xml/.test(robots),
      robots.replace(/\n/g, " "),
    );
    const og = await req.get(appPage("opengraph-image"));
    check(
      "Open Graph image is a PNG",
      og.status() === 200 && og.headers()["content-type"] === "image/png",
      og.headers()["content-type"],
    );
    const home = await req.get(APP_URL);
    const html = await home.text();
    const graph = JSON.parse(html.match(/application\/ld\+json">(.*?)<\/script>/)?.[1] || "{}");
    const ld = graph["@graph"]?.find((n) => n["@type"] === "Person") || {};
    const site = graph["@graph"]?.find((n) => n["@type"] === "WebSite") || {};
    check(
      "structured data describes Faizan Ali and the website with public details only",
      ld["@id"] === `${SITE}/#person` &&
        site.url === SITE &&
        site.publisher?.["@id"] === ld["@id"] &&
        ld.name === "Faizan Ali" &&
        ld.address?.addressCountry === "PK" &&
        !/worksFor|award|rating|review|alumniOf|kiosk/i.test(JSON.stringify(graph)) &&
        ld.email === "mailto:faizandevx@gmail.com" &&
        ld.sameAs?.join() ===
          "https://github.com/faizandevx,https://www.linkedin.com/in/faizan-ali-5aa430380" &&
        !("telephone" in ld),
      JSON.stringify(ld),
    );
    const h = home.headers();
    check(
      "security headers are sent and the framework is not advertised",
      h["x-content-type-options"] === "nosniff" &&
        h["x-frame-options"] === "DENY" &&
        h["content-security-policy"] ===
          "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" &&
        h["referrer-policy"] === "strict-origin-when-cross-origin" &&
        /camera=\(\)/.test(h["permissions-policy"] || "") &&
        !h["x-powered-by"],
      JSON.stringify(h),
    );
  }
  {
    // Visited routes stay in the DOM, hidden. The header and skip link must act on the
    // visible page after moving around with client-side navigation.
    const q = await open(b, appPage("projects"));
    await q.click(".bento-card");
    await q.waitForURL("**/projects/personal-portfolio");
    await q.waitForTimeout(400);
    await q.click(".hero-header:visible .nav-links a[href='/experience']");
    await q.waitForURL("**/experience");
    await q.waitForTimeout(400);
    const top = await q.evaluate(() => scrollY);
    const h1 = await q.locator("h1:visible").allInnerTexts();
    await q.evaluate(() => scrollTo(0, 900));
    await q.waitForTimeout(500);
    const down = await q.evaluate(() => ({
      float: document.querySelector(".floating-header").classList.contains("visible"),
      current: document.querySelector(".floating-header .nav-links a.current")?.innerText.trim(),
    }));
    await q.evaluate(() => scrollTo(0, 0));
    await q.waitForTimeout(500);
    const up = await q.evaluate(
      () => !document.querySelector(".floating-header").classList.contains("visible"),
    );
    check(
      "after client-side navigation: starts at the top, one visible h1, header hands over on scroll",
      top === 0 &&
        h1.join() === "The work behind the experience." &&
        down.float &&
        down.current === "Experience" &&
        up,
      JSON.stringify({ top, h1, down, up }),
    );
    await q.focus(".skip-link");
    await q.keyboard.press("Enter");
    await q.waitForTimeout(150);
    await q.keyboard.press("Tab");
    const inVisibleMain = await q.evaluate(() => {
      const e = document.activeElement;
      return e.closest("main")?.checkVisibility() && e.checkVisibility();
    });
    check("after client-side navigation: the skip link lands in the visible page", inVisibleMain);
    // The skip link added a #main-content history entry, so the first Back stays on the page.
    await q.goBack();
    await q.waitForTimeout(200);
    await q.goBack();
    await q.waitForURL("**/projects/personal-portfolio");
    await q.waitForTimeout(400);
    check(
      "browser Back shows the previous page",
      (await q.locator("h1:visible").allInnerTexts()).join() === "Personal Portfolio.",
    );
    await q.context().close();
  }
  {
    const q = await open(b, appPage("faq"), { width: 390 });
    await q.focus(".hero-header .hamburger");
    await q.keyboard.press("Enter");
    await q.waitForTimeout(400);
    const opened = await q.locator(".hero-header .mobile-drawer.open").count();
    await q.keyboard.press("Escape");
    await q.waitForTimeout(400);
    const s = await q.evaluate(() => ({
      focus: document.activeElement.matches(".hero-header .hamburger"),
      open: document.querySelectorAll(".mobile-drawer.open").length,
    }));
    check(
      "mobile drawer: Escape closes it and focus returns to the menu button",
      opened === 1 && s.focus && s.open === 0,
      JSON.stringify(s),
    );
    await q.context().close();
  }
}

(async () => {
  const b = await launch();
  for (const page of PAGES) {
    await pageChecks(b, page);
    await BEHAVIOUR[page.name](b, page);
  }
  if (!only || only.includes("site")) await siteChecks(b);
  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
