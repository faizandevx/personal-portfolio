const { launch, APP_URL } = require("./harness.cjs");
const APP = APP_URL;
let failures = 0;
const check = (n, ok, d = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};
(async () => {
  // Real classic scrollbars, as in Chrome on Windows (Playwright hides them by default).
  const b = await launch({ ignoreDefaultArgs: ["--hide-scrollbars"] });
  for (const width of [1440, 1024, 768]) {
    const ctx = await b.newContext({ viewport: { width, height: 800 }, reducedMotion: "reduce" });
    const q = await ctx.newPage();
    await q.goto(APP, { waitUntil: "networkidle" });
    const sb = await q.evaluate(() => innerWidth - document.documentElement.clientWidth);
    await q.evaluate(() =>
      window.scrollTo({
        top: document.getElementById("hero").offsetHeight + 300,
        behavior: "instant",
      }),
    );
    await q.waitForTimeout(1500);
    const measure = () =>
      q.evaluate(() => {
        const r = document.querySelector(".floating-header .navbar").getBoundingClientRect();
        return `navbar x=${r.x.toFixed(2)} w=${r.width.toFixed(2)}, main w=${document.querySelector("main").getBoundingClientRect().width}`;
      });
    const before = await measure();
    await q.click(".floating-header .cv-btn");
    await q.waitForTimeout(250);
    const during = await measure();
    const y = await q.evaluate(() => scrollY);
    await q.mouse.move(20, 400);
    await q.mouse.wheel(0, 800);
    await q.waitForTimeout(300);
    const yAfterWheel = await q.evaluate(() => scrollY);
    await q.keyboard.press("Escape");
    await q.waitForTimeout(250);
    const afterClose = await measure();
    check(
      `${width}px with a ${sb}px scrollbar: no sideways shift while open or after closing`,
      sb > 0 && before === during && before === afterClose,
      `${before} | open: ${during} | closed: ${afterClose}`,
    );
    check(
      `${width}px: background does not scroll while open`,
      yAfterWheel === y,
      `scrollY ${y} -> ${yAfterWheel}`,
    );
    await ctx.close();
  }
  await b.close();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
