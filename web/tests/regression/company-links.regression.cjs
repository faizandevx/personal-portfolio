const { launch, APP_URL, REFERENCE_URL, WEB_DIR } = require("./harness.cjs");
const fs = require("fs");
const APP = APP_URL,
  REF = REFERENCE_URL;
const APPROVED = fs.readFileSync(WEB_DIR + "/src/styles/approved-changes.css", "utf8");
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};
const P = "#home-about .about-home-copy p:nth-of-type(3)";
async function open(b, url, width, theme, motion = "reduce") {
  const ctx = await b.newContext({ viewport: { width, height: 800 }, reducedMotion: motion });
  await ctx.addInitScript((t) => localStorage.setItem("fa-theme", t), theme);
  const p = await ctx.newPage();
  p.errs = [];
  p.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") p.errs.push(m.text());
  });
  p.on("pageerror", (e) => p.errs.push(e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.addStyleTag({
    content: ".note-ribbon,nextjs-portal{display:none!important}" + (url === REF ? APPROVED : ""),
  });
  await p.waitForTimeout(200);
  return p;
}
(async () => {
  const b = await launch();
  {
    const p = await open(b, APP, 1440, "dark", "no-preference");
    const info = await p.evaluate((P) => {
      const para = document.querySelector(P);
      const vis = para.cloneNode(true);
      vis.querySelectorAll(".sr-only").forEach((e) => e.remove());
      return {
        text: vis.textContent.replace(/\s+/g, " ").trim(),
        links: [...para.querySelectorAll("a")].map((a) => ({
          text: a.childNodes[0].textContent,
          href: a.href,
          target: a.target,
          rel: a.rel,
          name: a.textContent,
          inStrong: a.parentElement.tagName,
          weight: getComputedStyle(a).fontWeight,
          color: getComputedStyle(a).color,
          strongColor: getComputedStyle(a.parentElement).color,
          transition: getComputedStyle(a).transition,
          deco: getComputedStyle(a).textDecorationLine,
          sr: (() => {
            const s = a.querySelector(".sr-only"),
              c = getComputedStyle(s);
            return `${c.position} ${c.width} ${c.height} ${c.overflow} ${c.clip}`;
          })(),
        })),
      };
    }, P);
    check(
      "visible text: 'I've worked as a Software Developer at AlphaSoft360 and as an IT Project Manager at Aman Bank, bringing …'",
      info.text ===
        "I've worked as a Software Developer at AlphaSoft360 and as an IT Project Manager at Aman Bank, bringing both engineering and delivery perspectives to the table.",
      info.text,
    );
    const [a1, a2] = info.links;
    check(
      "AlphaSoft360 → https://www.alphasoft360.com/, new tab, noopener noreferrer",
      a1.href === "https://www.alphasoft360.com/" &&
        a1.target === "_blank" &&
        a1.rel === "noopener noreferrer" &&
        a1.text === "AlphaSoft360",
    );
    check(
      "Aman Bank → https://www.aman-bank.com/, new tab, noopener noreferrer",
      a2.href === "https://www.aman-bank.com/" &&
        a2.target === "_blank" &&
        a2.rel === "noopener noreferrer" &&
        a2.text === "Aman Bank",
    );
    check(
      "accessible names announce the new tab",
      a1.name === "AlphaSoft360 (opens in a new tab)" &&
        a2.name === "Aman Bank (opens in a new tab)",
      `${a1.name} | ${a2.name}`,
    );
    check(
      "the '(opens in a new tab)' text is visually hidden (Tailwind sr-only)",
      info.links.every((l) => l.sr.startsWith("absolute 1px 1px hidden")),
      a1.sr,
    );
    check(
      "still bold inside <strong> (weight 730), same colour as the other bold text, no underline",
      info.links.every(
        (l) =>
          l.inStrong === "STRONG" &&
          l.weight === "730" &&
          l.color === l.strongColor &&
          l.deco === "none",
      ),
      JSON.stringify({ w: a1.weight, c: a1.color, s: a1.strongColor }),
    );
    check(
      "colour transition 0.22s (within 200–250ms)",
      /color 0\.22s/.test(a1.transition),
      a1.transition,
    );
    await p.context().close();
  }
  for (const theme of ["dark", "light"]) {
    const p = await open(b, APP, 1440, theme, "no-preference");
    // The orange used for normal-size text (a section label). Since Phase 6 the light
    // theme has a separate, brighter orange for large headline accents.
    const orange = await p.evaluate(
      () =>
        getComputedStyle(document.querySelector("#home-about .about-home-intro .eyebrow")).color,
    );
    const base = await p.evaluate(
      (P) => getComputedStyle(document.querySelector(P + " a")).color,
      P,
    );
    await p.hover(P + " a");
    await p.waitForTimeout(400);
    const hover = await p.evaluate(
      (P) => getComputedStyle(document.querySelector(P + " a")).color,
      P,
    );
    await p.mouse.move(5, 5);
    await p.waitForTimeout(400);
    await p.evaluate(() => document.activeElement?.blur());
    await p.focus(P + " a:nth-of-type(1)");
    await p.keyboard.press("Shift+Tab");
    await p.keyboard.press("Tab");
    await p.waitForTimeout(400);
    const focus = await p.evaluate((P) => {
      const a = document.activeElement,
        c = getComputedStyle(a);
      return {
        isLink: a === document.querySelector(P + " a"),
        color: c.color,
        outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor}`,
        offset: c.outlineOffset,
      };
    }, P);
    check(`${theme}: hover turns the name orange (${hover})`, hover === orange && base !== orange);
    check(
      `${theme}: keyboard focus turns it orange and shows the V21 2px orange outline`,
      focus.isLink &&
        focus.color === orange &&
        focus.outline === `solid 2px ${orange}` &&
        focus.offset === "3px",
      JSON.stringify(focus),
    );
    await p.context().close();
  }
  {
    const p = await open(b, APP, 1440, "dark", "reduce");
    check(
      "reduced motion: no transition",
      await p.evaluate(
        (P) =>
          /^(all 0s|color 0s|none)/.test(
            getComputedStyle(document.querySelector(P + " a")).transition,
          ) || getComputedStyle(document.querySelector(P + " a")).transitionDuration === "0s",
        P,
      ),
    );
    await p.context().close();
  }
  for (const theme of ["dark", "light"])
    for (const width of [1440, 1280, 1024, 900, 768, 620, 390, 360]) {
      const g = (p) =>
        p.evaluate((P) => {
          const e = document.querySelector(P),
            r = e.getBoundingClientRect(),
            c = getComputedStyle(e);
          const lines = Math.round(r.height / parseFloat(c.lineHeight));
          return {
            w: Math.round(r.width),
            h: Math.round(r.height),
            lines,
            fs: c.fontSize,
            lh: c.lineHeight,
            mb: c.marginBottom,
            color: c.color,
          };
        }, P);
      const [r, a] = await Promise.all([open(b, REF, width, theme), open(b, APP, width, theme)]);
      const [gr, ga] = [await g(r), await g(a)];
      check(
        `${theme} @${width}: paragraph same width, height (${ga.lines} lines), font, spacing and colour as V21`,
        JSON.stringify(gr) === JSON.stringify(ga),
        `V21 ${JSON.stringify(gr)} app ${JSON.stringify(ga)}`,
      );
      check(`${theme} @${width}: no console errors`, a.errs.length === 0, a.errs.join(" | "));
      await r.context().close();
      await a.context().close();
    }
  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
