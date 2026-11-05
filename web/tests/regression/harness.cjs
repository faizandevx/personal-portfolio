// Shared settings for the regression suites, so nothing depends on one machine.
// Every value can be overridden with an environment variable:
//   APP_URL        the Next.js app            (default http://localhost:3000)
//   REFERENCE_URL  the served V21 reference   (default http://localhost:4100)
//   PW_CHANNEL     installed browser to use   (default "chrome"; "msedge" also works)
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const trimSlash = (url) => url.replace(/\/+$/, "");

// The web/ folder (this file lives in web/tests/regression/).
const WEB_DIR = path.resolve(__dirname, "../..");
const APP_URL = `${trimSlash(process.env.APP_URL || "http://localhost:3000")}/`;
const REFERENCE_URL = `${trimSlash(process.env.REFERENCE_URL || "http://localhost:4100")}/index.html`;
const CHANNEL = process.env.PW_CHANNEL || "chrome";
// Other pages: appPage("about") -> <app>/about, referencePage("about") -> <V21>/about.html.
const appPage = (route) => `${trimSlash(APP_URL)}/${route}`;
const referencePage = (name) => `${new URL(REFERENCE_URL).origin}/${name}.html`;

// Comparison screenshots written by some suites (git-ignored via /test-results/).
const SHOTS_DIR = path.join(WEB_DIR, "test-results", "regression", "screenshots");
fs.mkdirSync(SHOTS_DIR, { recursive: true });

// The user-approved deviations from V21 (CLAUDE.md, "Approved design changes"), plus
// Tailwind's sr-only utility, which the V21 page does not have.
const APPROVED_CSS =
  fs.readFileSync(path.join(WEB_DIR, "src", "styles", "approved-changes.css"), "utf8") +
  ".sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border-width:0}";

// Launches the installed browser; the project never downloads Playwright's Chromium.
// Every context it creates applies the approved changes to pages from the V21
// reference server (never to the app), so the suites compare everything else
// against V21. Pass { rawReference: true } to newContext() for the untouched V21.
async function launch(options = {}) {
  const browser = await chromium.launch({ channel: CHANNEL, ...options });
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async ({ rawReference = false, ...contextOptions } = {}) => {
    const context = await newContext(contextOptions);
    if (!rawReference) {
      await context.addInitScript(
        ({ origin, css }) => {
          if (location.origin !== origin) return;
          // Appended to <head> after the V21 stylesheet, like the app's own import order.
          document.addEventListener("DOMContentLoaded", () => {
            const style = document.createElement("style");
            style.dataset.approvedChanges = "";
            style.textContent = css;
            document.head.appendChild(style);
            // Approved site-wide changes in the markup (CLAUDE.md, changes 18-21).
            const main = document.querySelector("main");
            if (main) main.id = "main-content";
            document.body.insertAdjacentHTML(
              "afterbegin",
              '<a class="skip-link" href="#main-content">Skip to main content</a>',
            );
            const pending = document.querySelector("#hero .hero-social-pending");
            if (pending) pending.setAttribute("aria-disabled", "true");
            const wording = {
              "#home-work .section-intro": "A look at my project work and professional experience.",
              "#home-work .bento-card.wide p":
                "Explore my project work, including how it was designed, built and tested.",
              "#journey .section-intro":
                "A brief overview here; the Experience page has the full timeline.",
            };
            for (const [selector, text] of Object.entries(wording)) {
              const element = document.querySelector(selector);
              if (element) element.textContent = text;
            }
          });
        },
        { origin: new URL(REFERENCE_URL).origin, css: APPROVED_CSS },
      );
    }
    return context;
  };
  return browser;
}

// The only console message the suites ignore: V21 has no favicon, so the reference
// server answers /favicon.ico with a 404. Every app message (including any 404) counts.
const isReferenceFavicon = (message) =>
  message.location().url === `${new URL(REFERENCE_URL).origin}/favicon.ico`;

module.exports = {
  WEB_DIR,
  APP_URL,
  REFERENCE_URL,
  CHANNEL,
  SHOTS_DIR,
  APPROVED_CSS,
  launch,
  isReferenceFavicon,
  appPage,
  referencePage,
};
