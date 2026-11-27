# Faizan Ali — Personal Portfolio

Portfolio site for **Faizan Ali, Software Engineer & IT Project Manager**.

The approved **V21** design (a static HTML/CSS/JS prototype) is being migrated to
**Next.js (App Router) + TypeScript + Tailwind CSS**, one phase at a time. The goal is to
preserve the approved visual design as closely as possible.

## Repository layout

```
personal-portfolio/
├─ design-reference/   Approved V21 prototype. READ-ONLY: never edit, move or reformat.
├─ web/                Next.js application
│  ├─ src/app/         Routes (App Router), root layout, globals.css
│  ├─ src/components/  layout, hero, ui, home, about, projects, contact, faq, modals, icons
│  ├─ src/hooks/       Client hooks (scroll navigation, theme, menu, …)
│  ├─ src/context/     Shared UI state (menu / modals)
│  ├─ src/content/     Typed site content (projects, experience, FAQ, skills, …)
│  ├─ src/lib/         Helpers (routes, …)
│  ├─ src/styles/legacy/  Approved V21 stylesheet, verbatim (added in Phase 1)
│  ├─ tests/e2e/       Playwright smoke tests
│  ├─ tests/regression/  V21 parity + behaviour suites (1,261 checks; see its README.md)
│  ├─ tests/visual/    Reserved for toHaveScreenshot parity specs (empty)
│  └─ .env.example     Environment variables (all optional: site URL, contact form delivery)
├─ .prettierignore     Stops Prettier (CLI + VS Code) from formatting design-reference/ and legacy CSS
├─ .gitattributes      LF line endings; design-reference/ is never converted
├─ .gitignore
├─ README.md
└─ CLAUDE.md           Working rules for AI-assisted development
```

There is one Git repository, at this root (branch `main`, remote `origin` on GitHub:
`faizandevx/personal-portfolio`). `web/` is not a nested repository.

## Requirements

- Node.js 20.9+ (developed on Node 24.19, npm 11.17)
- Windows, macOS or Linux
- **Google Chrome** for the Playwright tests. They use the installed browser
  (`channel: "chrome"`), so no separate Chromium download is needed.

## Commands

Run every command from `web/`:

```bash
cd web
npm install                 # install dependencies
npm run dev                 # dev server → http://localhost:3000
npm run build               # production build
npm run start               # serve the production build → http://localhost:3000
npm run lint                # ESLint
npm run typecheck           # generate route types, then tsc --noEmit
npm run format              # Prettier (write)
npm run format:check        # Prettier (check only)
npm run reference           # serve design-reference/ read-only → http://localhost:4100
npm run test:e2e            # behaviour tests in installed Chrome (starts the dev + reference servers)
npm run test:visual         # screenshot parity tests
npm test                    # all Playwright tests
npm run test:regression     # V21 parity + behaviour suites, 1,261 checks (about 55 min)
npm run test:regression -- hero contact   # selected suites
npm run test:regression:list              # suites and expected check counts
npm run test:regression:parallel          # same checks, up to 3 suites at once (faster)
npm run test:contact-delivery             # contact form delivery with a mock provider (61 checks, own build)
```

## Tech stack

| Area      | Choice                                                                        |
| --------- | ----------------------------------------------------------------------------- |
| Framework | Next.js 16.4.6 (App Router, Turbopack), React 19.3                            |
| Language  | TypeScript 5.9 (strict)                                                       |
| Styling   | Approved V21 CSS (global, unlayered) + Tailwind CSS 4.3 **without Preflight** |
| Quality   | ESLint 9 (`eslint-config-next`), Prettier 3                                   |
| Testing   | Playwright 1.64, `@axe-core/playwright`                                       |

Rendering uses the default Next.js server build (not a static-only export), so server
routes can be added later for the contact form and the AI assistant.

## Routes

| Route              | Source (design-reference)                   |
| ------------------ | ------------------------------------------- |
| `/`                | index.html                                  |
| `/about`           | about.html                                  |
| `/projects`        | projects.html                               |
| `/projects/[slug]` | project-detail.html (`content/projects.ts`) |
| `/experience`      | experience.html                             |
| `/contact`         | contact.html                                |
| `/faq`             | faq.html                                    |

## Phase status

| Phase | Scope                                                        | Status                                             |
| ----- | ------------------------------------------------------------ | -------------------------------------------------- |
| 0     | Project initialisation, tooling, docs                        | ✅ Complete (approved)                             |
| 1     | Design system + shell (CSS, theme, header, footer, CV modal) | ✅ Complete (approved)                             |
| 2     | Home page                                                    | ✅ Complete (approved, pushed)                     |
| 3     | About page                                                   | ✅ Complete (approved, pushed)                     |
| 4     | Projects, project detail, Experience                         | ✅ Complete (approved, pushed)                     |
| 5     | Contact + FAQ                                                | ✅ Complete (approved, pushed)                     |
| 6     | Hardening (performance, a11y, SEO, 404)                      | ✅ Complete (approved, pushed)                     |
| 7     | Integrations and production preparation                      | ✅ Feasible items done; see external details below |

Each phase finishes with build, lint, typecheck and tests passing and a report, and the next phase waits for approval.

**Phase 0 result:** build, lint, typecheck and format checks pass. The Playwright smoke tests
(`tests/e2e/smoke.spec.ts`, 2 of 2) pass in the installed Google Chrome. `design-reference/` is
verified unchanged against SHA-256 checksums.

**Phase 1 progress:**

- A: repair (exact V21 stylesheet restored from the ZIP)
- B: theme foundation
- C: static header
- D: theme toggle
- E: mobile drawer
- F: two-stage scroll navigation
- G: footer (live year, back to top; LinkedIn non-clickable until its URL is confirmed)
- H: CV modal (accessible dialog; states honestly that the CV is not available yet)

Phase 1 is complete and approved.

**Phase 2 progress:**

- 2A: home hero (Learn-more scroll, hero CV button, GitHub link, LinkedIn pending). The photo
  panel keeps the V21 frame and avatar outline with the label "Professional photo coming soon".
  Also fixes two build issues that affected the Phase 1 shell (see CLAUDE.md, CSS strategy).
- 2B: About section with the "From idea to impact" Tech Visual and the four expertise cards.
  The label reads ABOUT ME at 15px, and the preview switch and second-photo panel are not ported.
  It replaces the temporary spacer. The hero photo label is now smaller and muted.
- 2C: Selected work + Expertise. The labels read SELECTED WORK and EXPERTISE. Cards, chips and
  links use the final routes: `/projects`, `/experience` and `/about`. The featured card goes to
  `/projects` until the case studies exist, and the V21 intro text is kept. Those routes show a
  404 until Phases 3–4, the same as the header links.
- 2D: Contact section, with the label CONTACT.
  - **Ask Faizan AI** is a scripted demo with three pre-written answers. Its subtitle reads
    "Scripted demo", and it shows the DEMO pill and "Scripted responses · No live AI yet". No AI
    service is called.
  - **Let's Chat** opened an accessible "WhatsApp connection coming soon" modal until the public
    number was approved; since 2026-11-26 it opens a WhatsApp chat (see Final assets).
  - The CV modal uses a shared dialog hook (`src/hooks/useModalDialog.ts`).
- 2E: test consolidation and final homepage review.
  - The 563 checks from Phases 1–2D are now tracked in `web/tests/regression/`, with no
    machine-specific paths, a shared harness and the `npm run test:regression` runner.
  - A new whole-homepage review suite adds 39 checks: structure, links, keyboard order and
    focus, axe, animations, horizontal overflow and console errors. That makes 602 in total
    (615 after Phase 6 added 13 accessibility checks).
  - The runner also verifies `design-reference/` against the V21 checksums.

**Phase 3 progress (About page, `/about`):**

- 3B: the route and its metadata, plus the shared `InsideHero` (the inner-page hero with the
  hero header), which later pages reuse.
  - About hero with the "From idea to impact" workflow visual: four steps, a staggered
    reveal, pulsing arrows, icon hover, and reduced-motion support. The card is dark navy in
    the dark theme and warm white in the light theme, as in V21.
  - The label reads ABOUT ME at 15px.
  - Approved spacing refinement: label → heading 22px at every width; on desktop the label
    and text are centred together against the card.
  - A temporary `#my-story` target serves "Discover my story" until 3C. 78 checks in
    `about-page`.
- 3C: Story, the "At a glance" card and Career journey.
  - AlphaSoft360 replaces "AlphaSoft K60" everywhere, and the story's employer names link to
    their websites.
  - The shared `ui/EmployerLink` is now used by both the homepage and the About page.
  - The job data lives in `content/experience.ts`.
  - The label reads CAREER JOURNEY at 15px.
  - The temporary `#my-story` target is replaced by the real section. 145 checks in
    `about-page`.
- 3D: Capabilities (three skill cards), My approach (three numbered steps), Education and the
  closing CTA.
  - The labels read CAPABILITIES, MY APPROACH and EDUCATION at 15px. The approach step
    numbers (01–03) are part of the step design and are kept.
  - The footer "Education" link lands on `/about#education`.
  - The CTA links use `/projects` and `/contact`.
  - 245 checks in `about-page`.
- 3E: Education wording and whole-page review.
  - The Education note reads "The degree most relevant to my professional work." (approved
    Option A; V21's sentence about earlier qualifications is removed).
  - 38 whole-page checks: every section's position, height and padding plus full-page pixels
    at 8 widths × 2 themes; the full keyboard Tab order with visible focus; the mobile drawer
    by keyboard; every animation and transition with and without reduced motion; and every
    link destination. 283 checks in `about-page`, 898 in the full suite.
  - Final verification (2026-11-05): 898 of 898 regression checks passed in 37.1 min, with
    `design-reference/` matching its V21 checksums. Lint, typecheck, format, build and the 2 e2e
    smoke tests also passed. A production-mode check of `/about` (`next start`, 3 widths) confirmed
    that it loads, both themes work, and there are no browser errors beyond the known 404s below.

**Phases 4–7 (final delivery):**

- **Projects:** `/projects` shows one full-width card for Personal Portfolio, and
  `/projects/personal-portfolio` is its case study, linking to the public repository. Project details
  come from `content/projects.ts` and are verified against this repository.
- **Experience:** `/experience` is the V21 timeline. AlphaSoft360 and Aman Bank link to their websites
  (new tab). "View CV" opens the PDF in a new tab, and "Download CV" opens the CV modal.
- **Contact:** two modes, chosen by the server (see "Contact form delivery").
  - **Direct delivery** (when `RESEND_API_KEY` is set): "Send message" posts the form to `/api/contact`,
    which validates it and hands it to Resend. "Message sent" appears only after Resend accepts it;
    otherwise an error keeps the typed text and offers the email app and "Copy email address".
  - **Mailto fallback** (no key, the current production state): the form opens the visitor's own email
    app with a prefilled message ("Send via email"; "Opens your email app"). If no email app opens, the
    status message shows the address with a "Copy email address" button.
  - Nothing is stored on the site in either mode. The orange "Prefer a quick chat?" card opens WhatsApp
    (+92 347 3057550); email and LinkedIn are the other working methods.
- **FAQ:** the V21 single-open accordion, keyboard accessible, with visitor-facing answers.
- **Production:** skip link, drawer focus return, custom 404 page (`src/proxy.ts` gives unknown project
  URLs a real 404 status), canonical and Open Graph metadata,
  sitemap, robots, Open Graph image, Person structured data and security headers, including a
  minimal Content-Security-Policy (`frame-ancestors 'none'; object-src 'none'; base-uri 'self'`,
  no script restrictions, so partial prerendering keeps working).
- **SEO (Phase 1, 2026-11-24):** every indexable page, home included, has a canonical link equal to
  its `sitemap.xml` URL. Every page shares the Open Graph image with a large Twitter card
  (`pageMetadata` in `src/lib/site.ts`). The 404 page is `noindex` with status 404.
- **SEO (Phase 2, 2026-11-24):** each page has its own keyword-relevant title and description, based on
  visible content only. Open Graph uses the `en_US` locale, and About uses the `profile` type.
  Structured data (`src/lib/structured-data.ts`): Person and WebSite on every page, plus the
  page's own type (WebPage, ProfilePage, CollectionPage, ContactPage or FAQPage) and breadcrumbs.
  The Schema.org validator reports no errors or warnings on any of the 7 pages.

## Performance (lab measurements, 2026-11-25)

Lighthouse 13.6.0, median of 3 runs on the local production build (`next start`):

| Page     | Mobile perf | Desktop perf | A11y / BP / SEO | Mobile LCP | Mobile TBT | CLS |
| -------- | ----------- | ------------ | --------------- | ---------- | ---------- | --- |
| Home     | 97          | 100          | 100 / 100 / 100 | 2.3 s      | 150 ms     | 0   |
| About    | 99          | 100          | 100 / 100 / 100 | 1.2 s      | 120 ms     | 0   |
| Projects | 99          | 100          | 100 / 100 / 100 | 0.9 s      | 100 ms     | 0   |
| Contact  | 99          | 100          | 100 / 100 / 100 | 0.9 s      | 130 ms     | 0   |

These are lab results with simulated throttling. They are not field data: there is no Chrome UX
Report data yet, so INP and real-user Core Web Vitals are unknown.

## Search engines

- **Google Search Console:** URL-prefix property `https://faizanalidevx.vercel.app/`, verified by the
  HTML tag in `src/app/layout.tsx` (`verification.google`). Keep the tag, or the property loses
  verification. Sitemap: `https://faizanalidevx.vercel.app/sitemap.xml`.
- **Bing Webmaster Tools:** imported from Search Console (site and sitemap).
- **Weekly check:** indexed pages (7 expected), impressions, clicks, CTR, average position; queries
  for the name, "software developer", "full stack", "Next.js" and "IT project manager"; Core Web
  Vitals once Google has enough real-user data.

## Before and after deployment

The site's public address (canonical links, Open Graph, `sitemap.xml`, `robots.txt`) comes from
`src/lib/site.ts`, in this order:

1. `NEXT_PUBLIC_SITE_URL`, when it is set.
2. On Vercel, the project's production address (`VERCEL_PROJECT_PRODUCTION_URL`, set by Vercel at
   build time). Even the first deployment, and every preview, points to the production address,
   never to localhost.
3. Locally, `http://localhost:3000`.

Production address: `https://faizanalidevx.vercel.app` (deployed 2026-11-24). It comes from
`VERCEL_PROJECT_PRODUCTION_URL`; `NEXT_PUBLIC_SITE_URL` is not set.

Once the final address is known, set `NEXT_PUBLIC_SITE_URL` in Vercel (Production and Preview) to
it, with `https://` and no trailing slash, and redeploy. The value is read at build time.

Vercel settings: Framework Next.js, Root Directory `web`, default build (`next build`) and install
(`npm install`, from `package-lock.json`) commands, Production Branch `main`. No `vercel.json` is
needed. Next.js 16.4.6 needs Node.js 20.9 or later.

## Contact form delivery

**Choice (2026-11-27):** a Next.js route handler (`src/app/api/contact/route.ts`) that sends through
[Resend](https://resend.com)'s REST API with plain `fetch`. No new dependency, no database, no CAPTCHA.

- **Why Resend:** the free plan allows 100 emails a day and 3,000 a month, and Resend's shared sender
  `onboarding@resend.dev` works without owning a domain. The API key stays on the server, and the
  route controls validation, Reply-To and spam filtering.
- **Why not Formspree:** its free plan allows 50 submissions a month, and messages pass through and are
  stored by a third party.
- **Why not Gmail SMTP:** it needs a Gmail app password on the server and an SMTP library.
- **Mailto** stays as the automatic fallback whenever no key is configured.

How it works: the browser validates the fields and posts JSON to `/api/contact`. The server then:

1. accepts only same-origin JSON requests of 10 KB or less;
2. validates every field again (required name, email and message, the form's length limits, a valid
   email address, phone characters) and strips control characters and line breaks from one-line
   fields, so they cannot inject email headers;
3. rejects spam: a hidden honeypot field, a form submitted less than 3 seconds after it appeared,
   and more than 3 links;
4. limits each IP address to 5 messages per 10 minutes. This limit is kept in memory, so each
   server instance counts separately; Resend's daily quota is the hard limit;
5. sends a plain-text email (never HTML) to `CONTACT_TO_EMAIL`, with the subject "Portfolio enquiry
   from <name>[: <subject>]", **Reply-To set to the visitor's address**, and an `Idempotency-Key`
   from the page, so a retried message is never delivered twice;
6. answers "sent" only when Resend returns a message id. Errors are logged by status only, never
   with the message.

### Setup (once, by the site owner)

1. **Create a Resend account** at https://resend.com with **faizandevx@gmail.com** (free plan). This
   address matters: Resend's shared sender `onboarding@resend.dev` delivers **only to the email
   address of the Resend account**. Any other recipient gets a 403 ("You can only send testing emails
   to your own email address"), which the site reports as a failed send. So `CONTACT_TO_EMAIL` must
   stay the account's address. Resend calls `resend.dev` a testing domain; to send to another
   recipient or from your own address, verify a domain under **Domains** (add the DNS records it
   shows) and set `CONTACT_FROM_EMAIL`, for example `Portfolio Contact <contact@your-domain>`.
2. In Resend, open **API Keys → Create API Key**. Give it a name (for example `portfolio-contact`) and
   the **Sending access** permission. Copy the key (it starts with `re_`); it is shown only once.
3. **Locally:** create `web/.env.local` (git-ignored) with `RESEND_API_KEY=re_…`. Then run
   `npm run build && npm start` or `npm run dev`. The Contact page now shows "Send message".
4. **On Vercel:** go to Project → Settings → Environment Variables and add `RESEND_API_KEY` for
   **Production** (and Preview if wanted), marked **Sensitive**. `CONTACT_TO_EMAIL` and
   `CONTACT_FROM_EMAIL` are optional. **Redeploy**: the contact page is prerendered, so the
   form's mode is decided at build time.
5. **Send one real test message:** on the live Contact page, fill in your own name, a second email
   address you can read (so you can test Reply-To), and a short message. Wait at least 3 seconds,
   then click "Send message". You should see "Message sent successfully!" with a green check.
6. **Confirm delivery in Gmail:** in faizandevx@gmail.com, look for "Portfolio enquiry from <your
   name>" from "Portfolio Contact <onboarding@resend.dev>". Check **Spam** the first time and mark
   it "Not spam". Click **Reply** and check that it goes to the address you entered. Resend's
   **Emails** page also shows the message as Delivered.
7. If it fails: the page shows an error and keeps the text. Resend's **Logs** show the API request.
   In Vercel, open **Logs** and look for "Contact delivery failed: provider status …". A 401 means
   a wrong key. A 403 means the recipient is not the Resend account's address (see step 1) or the
   sender's domain is not verified. A 429 means Resend's rate limit or daily quota was reached.

Tests: `npm run test:contact-delivery` builds the site with a mock provider (no real email, no real
key) and checks the API and the form at 1440 and 390px in both themes. The `pages` regression suite
covers the mailto fallback.

## Not connected yet (by design)

These need details only the site owner can supply. Each one is labelled honestly on the site, and none
is ever shown as working:

| Item                | Current behaviour                               | Needed                    |
| ------------------- | ----------------------------------------------- | ------------------------- |
| Direct form sending | Built; mailto until `RESEND_API_KEY` is set     | A Resend API key (above)  |
| Ask Faizan AI       | Labelled scripted demo with pre-written answers | An AI provider, if wanted |

### Final assets

- **Professional photos (integrated 2026-11-23):** `web/public/images/faizan-ali-hero.png` (blue
  suit) fills the home hero frame, and `web/public/images/faizan-ali-about.png` (grey suit) sits in
  the About "At a glance" card. They are set in `src/content/photos.ts` and served by `next/image`.
- **CV (integrated 2026-11-23):** `web/public/cv/Faizan-Ali-CV.pdf` is the original file, and it is set as
  `CV_FILE` in `src/lib/site.ts`. Every CV button opens the CV modal, whose "Download PDF" link
  saves it as `Faizan-Ali-CV.pdf`. FAQ #5 points to it.
- **LinkedIn (integrated 2026-11-24):** `https://www.linkedin.com/in/faizan-ali-5aa430380` is linked
  from the hero, the footer, the Contact page and the structured data.
- **WhatsApp (integrated 2026-11-26):** the approved public number +92 347 3057550 (`WHATSAPP_NUMBER`
  and `WHATSAPP_URL` = `https://wa.me/923473057550` in `src/lib/site.ts`). Home "Let's Chat" and the
  Contact card open the chat in a new tab (`rel="noopener noreferrer"`): the app on a phone, WhatsApp
  Web or the desktop app on a computer. No message is prefilled or sent, and no WhatsApp API or paid
  service is used. The Ask Faizan AI contact answer and FAQ #6 show the number.

### Accessibility (Phase 6)

The axe findings from the Step 2E review were in the V21 design itself. They are fixed, and
the regression suites now require **zero** axe violations (WCAG 2.1 A/AA) on the homepage in
both themes:

- **Light-theme contrast.** Orange text uses V21's hue and chroma at a lower lightness:
  `#b84604` for normal text (4.75:1 or more) and `#e56122` for large headline accents
  (3.06:1 or more). Decorative orange and the whole dark theme keep `#f97338`. The footer
  timezone drops its `.87` opacity in the light theme (4.75:1).
- **Pending footer LinkedIn icon:** now a labelled image (`role="img"`). It is not a link
  or a focusable control until the URL is confirmed.
- **Brand link:** its accessible name is "FA Faizan Ali, go to homepage", which starts with
  the visible text (WCAG 2.5.3).
- **Favicon:** `src/app/icon.svg`, the FA brand icon, so there is no more `/favicon.ico` 404.

All pages require zero axe violations (WCAG 2.1 A/AA) at the tested widths in both themes.
