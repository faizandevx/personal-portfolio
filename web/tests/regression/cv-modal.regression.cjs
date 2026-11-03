const { launch, APP_URL, REFERENCE_URL, SHOTS_DIR, isReferenceFavicon } = require("./harness.cjs");
const APP = APP_URL,
  REF = REFERENCE_URL;
const SHOTS = SHOTS_DIR;
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};
async function open(b, url, o = {}) {
  const ctx = await b.newContext({
    viewport: { width: o.width || 1440, height: o.height || 800 },
    reducedMotion: "reduce",
  });
  if (o.theme) await ctx.addInitScript((t) => localStorage.setItem("fa-theme", t), o.theme);
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
const state = (p) =>
  p.evaluate(() => {
    const m = document.getElementById("cvModal");
    return {
      open: m.classList.contains("open"),
      shown: getComputedStyle(m).display === "flex",
      focus:
        document.activeElement?.textContent?.trim().slice(0, 20) || document.activeElement?.tagName,
      focusInModal: m.contains(document.activeElement),
      url: location.href,
      menuOpen: document.body.classList.contains("menu-open"),
      rootOverflow: getComputedStyle(document.documentElement).overflow,
    };
  });
const toBottom = (p) =>
  p.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
(async () => {
  const b = await launch();

  console.log("=== 1. Every CV trigger opens the same modal ===");
  const triggers = [
    { name: "hero header '↓ CV' (desktop 1440)", width: 1440, sel: ".hero-header .cv-btn" },
    {
      name: "floating header '↓ CV' (desktop, scrolled)",
      width: 1440,
      scroll: true,
      sel: ".floating-header .cv-btn",
    },
    { name: "hero header '↓ CV' (tablet 768)", width: 768, sel: ".hero-header .cv-btn" },
    {
      name: "hero mobile drawer '↓ Download CV' (390)",
      width: 390,
      menu: ".hero-header",
      sel: ".hero-header .mobile-drawer .cv-trigger",
    },
    {
      name: "floating mobile drawer '↓ Download CV' (390, scrolled)",
      width: 390,
      scroll: true,
      menu: ".floating-header",
      sel: ".floating-header .mobile-drawer .cv-trigger",
    },
  ];
  for (const t of triggers) {
    const p = await open(b, APP, { width: t.width });
    if (t.scroll) {
      await toBottom(p);
      await p.waitForTimeout(1500);
    }
    if (t.menu) {
      await p.click(`${t.menu} .hamburger`);
      await p.waitForTimeout(500);
    }
    const url = p.url();
    await p.click(t.sel);
    await p.waitForTimeout(250);
    const s = await state(p);
    check(
      t.name,
      s.open && s.shown && s.focus === "Understood ✓" && s.url === url && !s.menuOpen,
      `open=${s.open} focus="${s.focus}" urlUnchanged=${s.url === url}${t.menu ? " drawerClosed=" + !s.menuOpen : ""}`,
    );
    await p.keyboard.press("Escape");
    await p.waitForTimeout(250);
    const after = await p.evaluate(() => ({
      cls: document.activeElement?.className,
      closed: !document.getElementById("cvModal").classList.contains("open"),
    }));
    const expectFocus = t.menu ? "hamburger" : "cv-btn";
    check(
      `  ...Escape closes it and focus returns to the ${t.menu ? "hamburger (drawer is closed)" : "CV button"}`,
      after.closed && String(after.cls).includes(expectFocus),
      `focus on .${after.cls}`,
    );
    check("  ...no console errors", p.errs.length === 0, p.errs.join(" | "));
    await p.context().close();
  }

  console.log("\n=== 2. Closing, focus, scroll lock (1440) ===");
  const p = await open(b, APP);
  const dlg = await p.evaluate(() => {
    const m = document.getElementById("cvModal");
    return {
      role: m.getAttribute("role"),
      modal: m.getAttribute("aria-modal"),
      name: document.getElementById(m.getAttribute("aria-labelledby"))?.textContent,
      desc: document.getElementById(m.getAttribute("aria-describedby"))?.textContent,
      haspopup: document.querySelector(".cv-btn").getAttribute("aria-haspopup"),
    };
  });
  check(
    "dialog semantics: role=dialog, aria-modal, named by its heading, described by its text",
    dlg.role === "dialog" &&
      dlg.modal === "true" &&
      dlg.name === "Download CV (coming soon)" &&
      !!dlg.desc,
    JSON.stringify(dlg),
  );
  check("CV buttons announce that they open a dialog (aria-haspopup)", dlg.haspopup === "dialog");
  check(
    "closed modal is not in the accessibility tree (display:none)",
    (await p.evaluate(() => getComputedStyle(document.getElementById("cvModal")).display)) ===
      "none",
  );

  await p.evaluate(() => window.scrollTo({ top: 1000, behavior: "instant" }));
  await p.waitForTimeout(1500);
  const headerBefore = await p.evaluate(() => {
    const r = document.querySelector(".floating-header .navbar").getBoundingClientRect();
    return [r.x, r.width].map((v) => v.toFixed(2)).join(",");
  });
  const bodyWidthBefore = await p.evaluate(
    () => document.querySelector("main").getBoundingClientRect().width,
  );
  await p.click(".floating-header .cv-btn");
  await p.waitForTimeout(250);
  const headerDuring = await p.evaluate(() => {
    const r = document.querySelector(".floating-header .navbar").getBoundingClientRect();
    return [r.x, r.width].map((v) => v.toFixed(2)).join(",");
  });
  const bodyWidthDuring = await p.evaluate(
    () => document.querySelector("main").getBoundingClientRect().width,
  );
  check(
    "no sideways layout shift when the scrollbar is locked",
    headerBefore === headerDuring && bodyWidthBefore === bodyWidthDuring,
    `header x,w ${headerBefore} -> ${headerDuring}; main width ${bodyWidthBefore} -> ${bodyWidthDuring}`,
  );
  const y0 = await p.evaluate(() => scrollY);
  await p.mouse.move(100, 400);
  await p.mouse.wheel(0, 900);
  await p.keyboard.press("PageDown");
  await p.keyboard.press("ArrowDown");
  await p.keyboard.press("End");
  await p.waitForTimeout(400);
  check(
    "background does not scroll while open (wheel, PageDown, ArrowDown, End)",
    (await p.evaluate(() => scrollY)) === y0,
    `scrollY stays ${y0}`,
  );
  for (let i = 0; i < 4; i++) await p.keyboard.press("Tab");
  let s = await state(p);
  check("Tab keeps focus inside the dialog", s.focusInModal, `focus "${s.focus}"`);
  await p.keyboard.press("Shift+Tab");
  s = await state(p);
  check("Shift+Tab keeps focus inside the dialog", s.focusInModal);
  await p.click("#cvModal .modal h2");
  await p.waitForTimeout(150);
  check("clicking inside the card does NOT close it", (await state(p)).open);
  await p.mouse.click(15, 400);
  await p.waitForTimeout(250);
  s = await state(p);
  check("clicking the dimmed backdrop closes it", !s.open && !s.shown);
  check(
    "focus returns to the floating '↓ CV' button",
    await p.evaluate(
      () => document.activeElement === document.querySelector(".floating-header .cv-btn"),
    ),
  );
  check(
    "scroll lock released and position kept",
    s.rootOverflow !== "hidden" && (await p.evaluate(() => scrollY)) === y0,
  );
  await p.mouse.wheel(0, 300);
  await p.waitForTimeout(400);
  check("page scrolls normally again after closing", (await p.evaluate(() => scrollY)) > y0);
  await p.click(".floating-header .cv-btn");
  await p.waitForTimeout(200);
  await p.click("#cvModal [data-close-cv]");
  await p.waitForTimeout(250);
  check("'Understood ✓' button closes it", !(await state(p)).open);
  await p.keyboard.press("Tab");
  await p.keyboard.press("Shift+Tab");
  await p.keyboard.press("Enter");
  await p.waitForTimeout(250);
  check("keyboard only: focus the CV button + Enter opens the modal", (await state(p)).open);
  await p.keyboard.press("Enter");
  await p.waitForTimeout(250);
  check("keyboard only: Enter on the focused 'Understood ✓' closes it", !(await state(p)).open);

  console.log("\n=== 3. Honest content: no download, no review wording ===");
  const c = await p.evaluate(() => {
    const m = document.getElementById("cvModal");
    return {
      links: [...m.querySelectorAll("a")].length,
      download: !!m.querySelector("[download]"),
      pdf: /\.pdf/i.test(m.innerHTML),
      text: m.innerText,
    };
  });
  check(
    "no download link, no download attribute, no .pdf reference",
    c.links === 0 && !c.download && !c.pdf,
  );
  check("says clearly the CV is not available yet", /not available to download yet/.test(c.text));
  check(
    "no design-preview wording",
    !/preview|design demo|supply the final|final website/i.test(c.text),
    c.text.replace(/\s+/g, " "),
  );
  check("no console errors", p.errs.length === 0, p.errs.join(" | "));
  await p.context().close();

  console.log("\n=== 4. Appearance vs V21 (layout + styles; text intentionally changed) ===");
  const SEL = [
    "#cvModal",
    "#cvModal .modal",
    "#cvModal .eyebrow",
    "#cvModal h2",
    "#cvModal h2 .accent",
    "#cvModal p",
    "#cvModal .modal-actions",
    "#cvModal [data-close-cv]",
  ];
  const PROPS = [
    "display",
    "position",
    "z-index",
    "align-items",
    "justify-content",
    "padding",
    "background-color",
    "backdrop-filter",
    "border",
    "border-radius",
    "box-shadow",
    "max-width",
    "font-family",
    "font-size",
    "font-weight",
    "line-height",
    "letter-spacing",
    "text-transform",
    "color",
    "margin-top",
    "gap",
  ];
  for (const theme of ["dark", "light"])
    for (const width of [1440, 1024, 768, 390, 360]) {
      const res = {};
      for (const [k, url] of [
        ["ref", REF],
        ["app", APP],
      ]) {
        const q = await open(b, url, { width, theme });
        await q.addStyleTag({ content: ".note-ribbon{display:none!important}" });
        await q.click(".hero-header .cv-btn");
        await q.waitForTimeout(300);
        res[k] = await q.evaluate(
          ([SEL, PROPS]) =>
            SEL.map((s) => {
              const e = document.querySelector(s);
              const c = getComputedStyle(e);
              return s + " " + PROPS.map((p) => p + ":" + c.getPropertyValue(p)).join(";");
            }),
          [SEL, PROPS],
        );
        res[k + "Box"] = await q.evaluate(() => {
          const m = document.querySelector("#cvModal .modal").getBoundingClientRect();
          const btn = document.querySelector("#cvModal [data-close-cv]").getBoundingClientRect();
          return {
            cardX: Math.round(m.x),
            cardW: Math.round(m.width),
            cardCentreY: Math.round(m.y + m.height / 2),
            btnW: Math.round(btn.width),
            btnH: Math.round(btn.height),
            btnRightGap: Math.round(m.right - btn.right),
          };
        });
        if (width === 1440 || width === 390)
          await q.screenshot({ path: `${SHOTS}/cv-${theme}-${width}-${k}.png` });
        await q.context().close();
      }
      const diffs = res.ref
        .map((r, i) =>
          r === res.app[i]
            ? null
            : `\n   ref ${r.slice(0, 160)}\n   app ${res.app[i].slice(0, 160)}`,
        )
        .filter(Boolean);
      const rb = res.refBox,
        ab = res.appBox;
      const sameBox =
        rb.cardX === ab.cardX &&
        rb.cardW === ab.cardW &&
        rb.btnW === ab.btnW &&
        rb.btnH === ab.btnH &&
        rb.btnRightGap === ab.btnRightGap &&
        Math.abs(rb.cardCentreY - ab.cardCentreY) <= 1;
      check(
        `${theme} @${width}px: same styles on ${SEL.length} modal elements (${PROPS.length} properties each)`,
        diffs.length === 0,
        diffs.slice(0, 2).join(""),
      );
      check(
        `${theme} @${width}px: card position/width, centring, button size + alignment`,
        sameBox,
        `V21 ${JSON.stringify(rb)} app ${JSON.stringify(ab)}`,
      );
    }
  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
