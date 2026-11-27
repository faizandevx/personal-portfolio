// Contact form direct delivery, tested against a production build with a mock email
// provider (no real email is sent and no real API key is used).
// Run with: npm run test:contact-delivery   (about 3 minutes)
//
// 1. Starts a mock of Resend's send-email API on :4300 that records every request and
//    can be told to succeed, fail, rate-limit or answer slowly.
// 2. Builds the site with RESEND_API_KEY=re_test_mock and RESEND_API_URL pointing at
//    the mock, so the contact page renders the direct-delivery form, and serves it on
//    :3002 (`next start`).
// 3. Checks the API (origin, validation, spam traps, rate limit, provider failures,
//    the email it hands to the provider) and the form in the browser at 1440 and
//    390px, dark and light (sending state, no duplicates, success, errors, retry).
// 4. Rebuilds the site without the test variables, so .next is a normal build again.
// The mailto fallback (no key) is covered by the `pages` regression suite.
const http = require("node:http");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const { AxeBuilder } = require("@axe-core/playwright");
const { launch, SHOTS_DIR } = require("../regression/harness.cjs");

const WEB_DIR = path.resolve(__dirname, "../..");
const APP = "http://localhost:3002";
const MOCK_PORT = 4300;
const ENV = {
  ...process.env,
  RESEND_API_KEY: "re_test_mock",
  RESEND_API_URL: `http://127.0.0.1:${MOCK_PORT}/emails`,
};
const CSP = "frame-ancestors 'none'; object-src 'none'; base-uri 'self'";
let failures = 0;
let total = 0;
const check = (name, ok, detail = "") => {
  total++;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- Mock provider ---------------------------------------------------------------
const mock = { status: 200, body: null, delay: 0, requests: [] };
const provider = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", async () => {
    mock.requests.push({ headers: req.headers, body: JSON.parse(raw || "{}") });
    if (mock.delay) await sleep(mock.delay);
    res.writeHead(mock.status, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        mock.body ??
          (mock.status === 200 ? { id: `mock-${mock.requests.length}` } : { message: "error" }),
      ),
    );
  });
});
const setMock = (o = {}) => Object.assign(mock, { status: 200, body: null, delay: 0 }, o);

// --- API helper ------------------------------------------------------------------
let ipCounter = 0;
const VALID = {
  name: "Alex Morgan",
  email: "alex@example.com",
  phone: "+1 555 0100",
  subject: "A role",
  message: "Hello Faizan,\nI'd like to talk about a role.",
  website: "",
  elapsedMs: 5000,
};
// Each call gets its own client IP unless one is given, so the rate limit only
// applies where a check means it to.
async function post(body, { ip, origin = APP, type = "application/json", raw } = {}) {
  const headers = { "Content-Type": type, "X-Forwarded-For": ip ?? `203.0.113.${++ipCounter}` };
  if (origin) headers.Origin = origin;
  const r = await fetch(`${APP}/api/contact`, {
    method: "POST",
    headers,
    body: raw ?? JSON.stringify(body),
  });
  return { status: r.status, body: await r.json().catch(() => null), headers: r.headers };
}

function run(cmd, args, env) {
  const r = spawnSync(cmd, args, { cwd: WEB_DIR, env, stdio: "inherit", shell: true });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
}

(async () => {
  // A server left on :3002 would answer instead of this build (with its own rate limits).
  if (
    await fetch(APP)
      .then(() => true)
      .catch(() => false)
  )
    throw new Error(`${APP} is already in use; stop that server first.`);
  await new Promise((r) => provider.listen(MOCK_PORT, "127.0.0.1", r));
  console.log("Building with the mock provider configuration…");
  run("npx", ["next", "build"], ENV);
  const server = spawn("npx", ["next", "start", "-p", "3002"], {
    cwd: WEB_DIR,
    env: ENV,
    shell: true,
    stdio: "ignore",
  });
  try {
    for (let i = 0; i < 60; i++) {
      if (
        await fetch(APP)
          .then((r) => r.ok)
          .catch(() => false)
      )
        break;
      await sleep(500);
    }

    console.log("\n=== API ===");
    {
      setMock();
      mock.requests = [];
      const r = await post({ ...VALID, submissionId: "test-0001-abcdef" });
      const sent = mock.requests[0];
      check(
        "valid message: 200 ok after the provider accepts it (one provider request)",
        r.status === 200 && r.body?.ok === true && mock.requests.length === 1,
        JSON.stringify(r.body),
      );
      check(
        "provider request: Bearer key from the environment, JSON, Idempotency-Key from the page",
        sent.headers.authorization === "Bearer re_test_mock" &&
          sent.headers["content-type"] === "application/json" &&
          sent.headers["idempotency-key"] === "test-0001-abcdef",
        JSON.stringify(sent.headers),
      );
      check(
        "email: to faizandevx@gmail.com, from the default sender, Reply-To the visitor, professional subject, plain text only",
        JSON.stringify(sent.body.to) === '["faizandevx@gmail.com"]' &&
          sent.body.from === "Portfolio Contact <onboarding@resend.dev>" &&
          sent.body.reply_to === "alex@example.com" &&
          sent.body.subject === "Portfolio enquiry from Alex Morgan: A role" &&
          !("html" in sent.body) &&
          sent.body.text.includes("Name: Alex Morgan") &&
          sent.body.text.includes("Phone: +1 555 0100") &&
          sent.body.text.includes("Hello Faizan,\nI'd like to talk about a role."),
        JSON.stringify(sent.body),
      );
      check(
        "API responses: no-store, and the site's security headers incl. CSP",
        r.headers.get("cache-control") === "no-store" &&
          r.headers.get("content-security-policy") === CSP &&
          r.headers.get("x-frame-options") === "DENY" &&
          r.headers.get("x-content-type-options") === "nosniff",
      );
      mock.requests = [];
      await post({ ...VALID, subject: "", submissionId: "x" });
      check(
        "no subject: 'Portfolio enquiry from <name>'; a malformed Idempotency-Key is not forwarded",
        mock.requests[0]?.body.subject === "Portfolio enquiry from Alex Morgan" &&
          !("idempotency-key" in mock.requests[0].headers),
      );
      mock.requests = [];
      await post({
        ...VALID,
        name: "Alex\r\nBcc: victim@example.com",
        subject: "Hi\nCc: x@example.com",
        message: "<script>alert(1)</script> <b>bold</b>\u0000",
      });
      const inj = mock.requests[0]?.body ?? {};
      check(
        "header injection and markup: line breaks removed from name and subject; HTML stays inert plain text",
        inj.subject ===
          "Portfolio enquiry from Alex Bcc: victim@example.com: Hi Cc: x@example.com" &&
          !/[\r\n]/.test(inj.subject) &&
          JSON.stringify(inj.to) === '["faizandevx@gmail.com"]' &&
          !("bcc" in inj) &&
          !("cc" in inj) &&
          !("html" in inj) &&
          inj.text.includes("<script>alert(1)</script> <b>bold</b>") &&
          !inj.text.includes("\u0000"),
        JSON.stringify(inj),
      );
    }
    {
      setMock();
      mock.requests = [];
      const results = {
        cross: await post(VALID, { origin: "https://evil.example" }),
        noOrigin: await post(VALID, { origin: null }),
        nullOrigin: await post(VALID, { origin: "null" }),
        type: await post(VALID, { type: "text/plain" }),
        big: await post({ ...VALID, message: "x".repeat(12000) }),
        json: await post(null, { raw: "{not json" }),
        email: await post({ ...VALID, email: "not-an-email" }),
        missing: await post({ ...VALID, name: "   ", message: "" }),
        long: await post({ ...VALID, message: "y".repeat(3001) }),
        phone: await post({ ...VALID, phone: "<b>123</b>" }),
        honeypot: await post({ ...VALID, website: "https://spam.example" }),
        fast: await post({ ...VALID, elapsedMs: 800 }),
        noTime: await post({ ...VALID, elapsedMs: undefined }),
        links: await post({
          ...VALID,
          message: "http://a.example http://b.example http://c.example www.d.example",
        }),
      };
      const s = Object.fromEntries(
        Object.entries(results).map(([k, v]) => [k, `${v.status} ${v.body?.error ?? ""}`]),
      );
      check(
        "another site, no Origin or an opaque null Origin: 403; wrong content type: 415; oversized body: 413; broken JSON: 400",
        s.cross === "403 forbidden" &&
          s.noOrigin === "403 forbidden" &&
          s.nullOrigin === "403 forbidden" &&
          s.type === "415 unsupported" &&
          s.big === "413 too_large" &&
          s.json === "400 invalid",
        JSON.stringify(s),
      );
      check(
        "server-side validation names the fields: bad email, empty name/message, too long, bad phone",
        s.email === "400 invalid" &&
          JSON.stringify(results.email.body.fields) === '["email"]' &&
          JSON.stringify(results.missing.body.fields) === '["name","message"]' &&
          JSON.stringify(results.long.body.fields) === '["message"]' &&
          JSON.stringify(results.phone.body.fields) === '["phone"]',
        JSON.stringify(Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.body]))),
      );
      check(
        "spam: honeypot filled, sent under 3 s, no timing, more than 3 links: rejected",
        ["honeypot", "fast", "noTime", "links"].every((k) => s[k] === "400 rejected"),
        JSON.stringify(s),
      );
      check(
        "none of the rejected requests reached the email provider",
        mock.requests.length === 0,
        String(mock.requests.length),
      );
      const get = await fetch(`${APP}/api/contact`);
      check("GET /api/contact: 405", get.status === 405, String(get.status));
    }
    {
      const statuses = [];
      for (let i = 0; i < 6; i++) statuses.push((await post(VALID, { ip: "198.51.100.7" })).status);
      const other = await post(VALID, { ip: "198.51.100.8" });
      check(
        "rate limit: 5 messages per 10 minutes per IP, the 6th gets 429; other visitors are unaffected",
        statuses.join() === "200,200,200,200,200,429" && other.status === 200,
        statuses.join(),
      );
    }
    {
      const outcome = async (o) => {
        setMock(o);
        const r = await post(VALID);
        return `${r.status} ${r.body?.error ?? ""}`;
      };
      const r500 = await outcome({ status: 500 });
      const r429 = await outcome({ status: 429, body: { name: "daily_quota_exceeded" } });
      const r401 = await outcome({ status: 401 });
      const noId = await outcome({ status: 200, body: { ok: true } });
      provider.close();
      await sleep(200);
      const down = await (async () => {
        const r = await post(VALID);
        return `${r.status} ${r.body?.error ?? ""}`;
      })();
      await new Promise((r) => provider.listen(MOCK_PORT, "127.0.0.1", r));
      check(
        "provider failure (500), quota (429), bad key (401), no message id, provider unreachable: never reported as sent",
        r500 === "502 delivery_failed" &&
          r429 === "503 delivery_failed" &&
          r401 === "502 delivery_failed" &&
          noId === "502 delivery_failed" &&
          down === "502 delivery_failed",
        JSON.stringify({ r500, r429, r401, noId, down }),
      );
      setMock();
    }

    console.log("\n=== Browser ===");
    const b = await launch();
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
    ])
      for (const theme of ["dark", "light"]) {
        const tag = `${theme} @${width}`;
        // Each run is its own visitor (IP), so the 5-per-10-minutes limit applies per run.
        const ctx = await b.newContext({
          viewport: { width, height },
          extraHTTPHeaders: {
            "X-Forwarded-For": `192.0.2.${width === 1440 ? 10 : 20}${theme === "dark" ? 1 : 2}`,
          },
        });
        await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: APP });
        await ctx.addInitScript((t) => {
          localStorage.setItem("fa-theme", t);
          window.__csp = [];
          document.addEventListener("securitypolicyviolation", (e) =>
            window.__csp.push(e.violatedDirective),
          );
        }, theme);
        const p = await ctx.newPage();
        const errs = [];
        p.on("pageerror", (e) => errs.push(e.message));
        p.on("console", (m) => {
          // The deliberate failures below log a failed /api/contact request; nothing else may.
          if (m.type() === "error" && !/status of (4|5)\d\d/.test(m.text())) errs.push(m.text());
        });
        const mailto = [];
        const cdp = await ctx.newCDPSession(p);
        await cdp.send("Page.enable");
        cdp.on("Page.frameRequestedNavigation", (e) => {
          if (e.url.startsWith("mailto:")) mailto.push(e.url);
        });
        await p.goto(`${APP}/contact`, { waitUntil: "networkidle" });
        const status = () => p.locator(".form-status").innerText();
        const fill = async (message = "Hello from the delivery test.") => {
          await p.fill("#contact-name", "Alex Morgan");
          await p.fill("#contact-email", "alex@example.com");
          await p.fill("#contact-message", message);
        };

        const ui = await p.evaluate(() => {
          const trap = document.querySelector(".contact-trap");
          const r = trap.getBoundingClientRect();
          return {
            button: document.querySelector(".send-btn").textContent.trim(),
            note: document.querySelector(".privacy-note").textContent.trim(),
            trapHidden: trap.getAttribute("aria-hidden") === "true" && r.right <= 0,
            trapTab: document.getElementById("contact-website").tabIndex,
            overflow: document.documentElement.scrollWidth - innerWidth,
          };
        });
        check(
          `${tag}: direct form: 'Send message ↗', inbox note, spam trap off-screen, aria-hidden and out of the Tab order, no overflow`,
          ui.button === "Send message ↗" &&
            ui.note === "◇ Goes straight to my inbox. Nothing is stored on this site." &&
            ui.trapHidden &&
            ui.trapTab === -1 &&
            ui.overflow <= 0,
          JSON.stringify(ui),
        );

        // Invalid input never leaves the page.
        mock.requests = [];
        await p.click(".send-btn");
        await p.waitForTimeout(200);
        check(
          `${tag}: empty form is stopped by the browser; nothing is posted`,
          mock.requests.length === 0 && (await p.locator(".form-status").isHidden()),
        );

        // Submitting within 3 seconds of loading counts as automated: an honest error.
        await p.reload({ waitUntil: "networkidle" });
        await fill("Too fast.");
        await p.click(".send-btn");
        await p.waitForTimeout(600);
        check(
          `${tag}: instant submission is refused with an error; the text stays in the form`,
          (await status()).startsWith("Your message couldn't be sent right now.") &&
            (await p.inputValue("#contact-message")) === "Too fast." &&
            mock.requests.length === 0,
          await status(),
        );

        // Success: sending state, no duplicate on a second click or Enter, reset afterwards.
        await p.reload({ waitUntil: "networkidle" });
        await p.waitForTimeout(3100);
        await fill();
        setMock({ delay: 1200 });
        mock.requests = [];
        await p.click(".send-btn");
        await p.waitForTimeout(150);
        const during = await p.evaluate(() => ({
          text: document.querySelector(".send-btn").textContent.trim(),
          disabled: document.querySelector(".send-btn").disabled,
          busy: document.querySelector("form").getAttribute("aria-busy"),
          status: document.querySelector(".form-status").textContent,
        }));
        await p
          .locator(".contact-submit-row")
          .screenshot({ path: `${SHOTS_DIR}/contact-delivery-sending-${theme}-${width}.png` });
        await p.click(".send-btn", { force: true }).catch(() => {});
        await p.focus("#contact-name");
        await p.keyboard.press("Enter");
        await p.waitForTimeout(1600);
        const after = await p.evaluate(() => ({
          role: document.querySelector(".form-status").getAttribute("role"),
          live: document.querySelector(".form-status").getAttribute("aria-live"),
          busy: document.querySelector("form").getAttribute("aria-busy"),
          values: ["name", "email", "message"].map(
            (n) => document.querySelector(`[name=${n}]`).value,
          ),
          button: document.querySelector(".send-btn").textContent.trim(),
        }));
        check(
          `${tag}: while sending: 'Sending…', disabled, aria-busy, announced`,
          during.text === "Sending… ↗" &&
            during.disabled &&
            during.busy === "true" &&
            during.status === "Sending your message…",
          JSON.stringify(during),
        );
        check(
          `${tag}: a second click and Enter while sending do not send twice`,
          mock.requests.length === 1,
          String(mock.requests.length),
        );
        check(
          `${tag}: success only after the provider accepted it; polite status; form reset`,
          (await status()) ===
            "Thank you, your message has been sent. I'll reply to alex@example.com as soon as I can." &&
            after.role === "status" &&
            after.live === "polite" &&
            after.busy === null &&
            after.values.every((v) => v === "") &&
            after.button === "Send message ↗",
          JSON.stringify(after),
        );

        await p
          .locator(".contact-form-card")
          .screenshot({ path: `${SHOTS_DIR}/contact-delivery-sent-${theme}-${width}.png` });
        // Failure: honest error, text kept, mailto and copy as ways out; retry keeps the key.
        await p.waitForTimeout(3100);
        await fill("Please keep this text.");
        setMock({ status: 500 });
        mock.requests = [];
        await p.click(".send-btn");
        await p.waitForTimeout(800);
        const failed = await status();
        const shot = (state) =>
          p
            .locator(".contact-form-card")
            .screenshot({ path: `${SHOTS_DIR}/contact-delivery-${state}-${theme}-${width}.png` });
        await shot("error");
        check(
          `${tag}: provider failure: error message, no 'sent', text kept`,
          failed.startsWith(
            "Your message couldn't be sent right now. Your text is still in the form.",
          ) &&
            !/has been sent/.test(failed) &&
            (await p.inputValue("#contact-message")) === "Please keep this text.",
          failed,
        );
        await p.click(".form-status button:has-text('open it in your email app')");
        await p.waitForTimeout(300);
        await p.click(".form-status .copy-email:has-text('Copy email address')");
        await p.waitForTimeout(200);
        check(
          `${tag}: error offers the email app (prefilled mailto) and copies the address`,
          mailto.length === 1 &&
            decodeURIComponent(mailto[0]).includes("Please keep this text.") &&
            (await p.evaluate(() => navigator.clipboard.readText())) === "faizandevx@gmail.com" &&
            (await status()).includes("Address copied"),
          mailto[0],
        );
        setMock();
        await p.click(".send-btn");
        await p.waitForTimeout(800);
        const keys = mock.requests.map((r) => r.headers["idempotency-key"]);
        check(
          `${tag}: retry succeeds with the same Idempotency-Key (no duplicate if the first had arrived)`,
          keys.length === 2 &&
            keys[0] &&
            keys[0] === keys[1] &&
            (await status()).startsWith("Thank you"),
          keys.join(" "),
        );

        // Rate limited: a clear message.
        await p.waitForTimeout(3100);
        await fill();
        await p.route("**/api/contact", (r) =>
          r.fulfill({
            status: 429,
            contentType: "application/json",
            body: '{"error":"rate_limited"}',
          }),
        );
        await p.click(".send-btn");
        await p.waitForTimeout(500);
        check(
          `${tag}: rate limit: 'wait a few minutes' message; text kept`,
          (await status()).startsWith("You've sent several messages in a short time.") &&
            (await p.inputValue("#contact-message")) === "Hello from the delivery test.",
          await status(),
        );
        await p.unroute("**/api/contact");

        const axe = await new AxeBuilder({ page: p })
          .include(".contact-form-card")
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        const csp = await p.evaluate(() => window.__csp);
        check(
          `${tag}: zero axe violations with an error showing; no CSP violations or browser errors`,
          axe.violations.length === 0 && csp.length === 0 && errs.length === 0,
          `${axe.violations.map((v) => v.id).join(",")} ${csp.join(",")} ${errs.join(" | ")}`,
        );
        await ctx.close();
      }
    await b.close();
  } finally {
    // Kill the whole tree (shell -> npx -> next) before anything else, or next is orphaned.
    if (process.platform === "win32")
      spawnSync("taskkill", ["/F", "/T", "/PID", String(server.pid)], { stdio: "ignore" });
    else server.kill();
    provider.close();
    console.log("\nRebuilding without the test variables…");
    const env = { ...process.env };
    delete env.RESEND_API_KEY;
    delete env.RESEND_API_URL;
    run("npx", ["next", "build"], env);
  }
  console.log(`\n${total - failures}/${total} passed`);
  console.log(failures === 0 ? "CONTACT DELIVERY CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
  process.exitCode = failures ? 1 : 0;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
