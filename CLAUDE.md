# CLAUDE.md — working rules for this repository

Project: personal portfolio for **Faizan Ali — Software Engineer & IT Project Manager**.
This is a migration of the approved V21 static design (`design-reference/`) to Next.js in `web/`.
See `README.md` for commands and phase status.

## Non-negotiable rules

1. **`design-reference/` is read-only.** Never edit, move, rename, reformat or delete anything in
   it, including the ZIP. Tests may only read it and serve it (`npm run reference`).
2. **Work one phase at a time.** Do only the phase the user has authorised. At the end of each
   phase, report the files changed, the commands, and the build/lint/typecheck/test results, then
   **stop and wait for approval**.
3. **Preserve the approved design.** Do not change the header, footer, page layouts, colour
   schemes, animations or responsive behaviour. Make no unnecessary visual changes.
4. **No extra chrome.** Never add an extra header, toolbar, navigation layer or review control.
   The site has one navigation bar. Like the reference, it is rendered as a hero header that
   glides away and a floating header that slides in after the hero. That two-stage behaviour is
   the approved sticky behaviour.
5. **No fake functionality.** Demo-only features (CV download, WhatsApp, contact delivery, AI)
   must be clearly marked as unavailable or scripted until they are really connected.
6. **No confidential data.** Never publish private repository URLs, client or banking
   implementation details, internal names, or credentials. Private projects get summaries only.
7. **Keep the docs accurate.** Update `README.md` (phase status, commands, structure) and this
   file at the end of every phase.

## CSS strategy (hybrid)

- `web/src/app/globals.css` imports Tailwind's **theme and utilities layers only**. Preflight is
  deliberately left out because it would reset styles the V21 CSS relies on.
- In Phase 1 the approved `styles.css` is copied **intact, as one file, in its original source
  order** to `web/src/styles/legacy/styles.css`. It is imported after Tailwind and left
  **unlayered**, so it always wins over utilities. Prettier ignores that folder.
- **Source of truth for byte-identity is the V21 ZIP** (`design-reference/Faizan_Ali_Portfolio_Multipage_V21.zip`).
  Every extracted file in `design-reference/` and `web/src/styles/legacy/styles.css` must match it
  exactly. The root `.prettierignore` stops editor format-on-save or "Format Document" from
  touching `design-reference/` and `web/src/styles/legacy/`.
- **Build-compatibility fixes** (Phase 2 Step 2A). Neither one changes the design:
  - `globals.css` has `@source not inline("container")` and `@source not inline("visible")`.
    These are the only V21 class names that are also Tailwind utilities (checked against every
    class in `design-reference/`). Tailwind's `.container` added a `max-width` that narrowed
    every V21 container at 840–1023px.
  - `web/src/styles/legacy-compat.css` is imported right after the legacy file. It re-declares
    V21 values that Lightning CSS drops. Currently that is the two navbar `backdrop-filter` rules,
    where the `backdrop-filter` + `-webkit-backdrop-filter` pair was collapsed to the prefixed
    form only, which Chrome ignores. Only exact V21 values go there, never design changes.
- Do not split or rewrite the legacy CSS early. A later, gradual Tailwind conversion happens one
  component at a time, and only when the screenshot parity tests still pass.
- Keep the reference DOM structure. Selectors depend on it: `.inside-hero:has(+ …)`,
  `.v21-step:nth-child(n)`, child combinators (`>`), `body.menu-open`. Use fragments, not wrapper
  divs.
- Font: the reference font stack is used as-is (Inter → system-ui). Do not add `next/font` or web
  fonts without approval.

## Review-only elements (not ported)

These are not ported: the "Design preview" note ribbon, the Home "PREVIEW THE LOOK" A/B switch
and second-photo panel, the photo-upload controls, and "design preview" disclaimer wording.

Approved UI that is kept: the CV button, the WhatsApp button, the scripted "Ask Faizan AI" card
(labelled as scripted), the contact form, and the photo panel frame. Each one gets honest
not-yet-available behaviour.

## Approved design changes (apply only in the named phase)

These are user-approved deviations from V21. Parity tests must mask them and list them as
intentional differences.

**Phase 2: Home page** (approved 2026-11-02; do NOT apply earlier)

1. Remove the `01 /`, `02 /`, `03 /`, `04 /` numbering from the four homepage section labels
   (eyebrows). They read ABOUT ME, SELECTED WORK, EXPERTISE and CONTACT.
2. Make those four eyebrow labels consistently a little larger, about 15–16px (V21 uses 11px).
   Keep every other eyebrow style (orange colour, uppercase, letter-spacing, weight). Do not resize
   the main headings.
3. Remove the "Tech visual / Second photo" toggle, the "PREVIEW THE LOOK" caption and the
   second-photo panel from the homepage About section. Keep the approved Tech Visual (`tech-v16`)
   unchanged.
4. Housekeeping (not a design change): remove the TEMPORARY scroll-test spacer `<section>` in
   `web/src/app/page.tsx` that was added in Phase 1 Step F. (Done in Step 2B.)
5. Hero photo panel (approved 2026-11-03; the label was replaced by the photo in change 25).
   Keep the V21 frame and avatar outline. Remove the
   upload control, the instructions and the "Photo-ready hero" tag. Show only the label
   "Professional photo coming soon", slightly smaller and muted (14px, or 13px at ≤620px; weight
   600; `--muted`).

6. Home About spacing refinement (approved 2026-11-03), scoped to `.about-home-v15`:
   - The label row's gap drops from 24px to 14px.
   - The columns are top-aligned instead of centred. Centring had pushed the heading 49–75px
     below the label on desktop.
   - Paragraphs are capped at `35em` (V21: 610px).

   Heading size, text, colours and the Tech Visual are unchanged.

7. Home About employer links (approved 2026-11-03):
   - The name "AlphaSoft K60" is corrected to **AlphaSoft360**.
   - **AlphaSoft360** (`https://www.alphasoft360.com/`) and **Aman Bank**
     (`https://www.aman-bank.com/`) become external links. They open in a new tab with
     `rel="noopener noreferrer"`, and each has a visually hidden "(opens in a new tab)".
   - They stay bold and turn orange on hover and keyboard focus, with a 0.22s transition that
     is turned off for reduced motion.

8. Home Contact wording (approved 2026-11-03). This replaces review-only text with honest text
   for visitors:
   - **WhatsApp modal body:** "WhatsApp chat isn't available yet. In the meantime, you're welcome
     to get in touch through the Contact page or by email at faizandevx@gmail.com."
   - **Ask Faizan AI subtitle:** "Portfolio guide · Scripted demo".
   - **Hidden accessible labels:** "Let's Chat on WhatsApp (coming soon)" and "Ask Faizan AI
     (scripted demo)".
   - Never add a WhatsApp number, a `wa.me` link or a live AI call without approval.

**Phase 6: homepage accessibility** (approved 2026-11-03)

9. WCAG 2.1 AA fixes. The approved V21 look is otherwise unchanged.
   - **Light theme only:** orange text uses `--orange: #b84604` (normal text, 4.75:1 or more).
     Large headline accents (`h1 .line-accent`, `h2 .accent`, `.tech-v16-heading span`,
     `.footer-reference-brand span`) use `--orange-large: #e56122` (3.06:1 or more). Both keep
     V21's OKLCH hue and chroma (h 42.3, C 0.179); only the lightness is lower.
   - Decorative orange (dots, underlines, dividers, the avatar outline) is reset to
     `--orange-brand: #f97338`. Buttons and the dark theme are unchanged.
   - The light-theme footer timezone has `opacity: 1` (4.75:1).
   - The pending footer LinkedIn icon is `role="img"`. It is not focusable and not a link until
     its URL is confirmed.
   - Brand links: `aria-label="FA Faizan Ali, go to homepage"`, plus a space between the two
     spans. The space is not rendered (flex container).
   - Favicon: `web/src/app/icon.svg` (the FA brand icon).
   - The suites apply these changes to V21 too, through `harness.cjs`, which injects
     `approved-changes.css` into every V21 page.

**Phase 3: About page** (approved 2026-11-04)

10. The five numbered About section labels ("01 / About me" … "05 / Education") lose their
    numbers and use the 15px section-label size (`.about-section-label`, same rule as
    `.home-section-label`). Unnumbered small labels stay as in V21.
11. "AlphaSoft K60" is corrected to AlphaSoft360 in both places (Step 3C). In the story
    paragraph, AlphaSoft360 and "Aman Bank for Commerce & Investment" use the same external
    links as the homepage. Career-card names stay plain text.
12. The light-theme large-accent orange (`--orange-large`) also applies to `h1 .accent`
    ("Beyond the delivery.") and `.about-v18-identity h3 .accent` ("One approach.").
13. The hero workflow card follows V21 exactly: dark navy in the dark theme, warm white in
    the light theme.
14. The meta description uses visitor-facing text. V21's says "interactive design preview".
15. About hero spacing (approved 2026-11-04, CSS only, markup unchanged).
    - The label → heading gap is 22px at every width (h1 `margin-top: 3px`). V21 had 31px
      stacked and 63–83px on desktop.
    - Desktop two-column layout (1041px and up): the label joins the text column, and label,
      heading, text and buttons are centred together against the workflow card. Column sizes,
      the gap, the card and the breakpoints are V21's.

16. Education note (approved 2026-11-04, Step 3E): "The degree most relevant to my professional
    work." V21's second sentence ("Earlier qualifications are intentionally not displayed in this
    portfolio.") is removed. Never invent other education details.

**Content correction: no kiosk references** (approved 2026-11-05)

17. "kiosks" is removed from the Ask Faizan AI banking answer, which now reads "He has worked on
    digital banking projects involving customer channels, service integrations, and coordination
    across technical teams." Never add kiosk-related information to any portfolio page. V21's
    `app.js` keeps the old text because `design-reference/` is read-only. The `contact` suite applies
    the correction to the V21 page before comparing, and checks that `web/src` has no "kiosk".

**Phases 4–7: final delivery** (approved 2026-11-05)

18. Wording. Home Selected work intro: "A look at my project work and professional experience."
    Full-stack Applications card: "Explore my project work, including how it was designed, built and
    tested." (still links to `/projects`). About journey intro: "A brief overview here; the Experience
    page has the full timeline."
19. Projects (`content/projects.ts`). Only Personal Portfolio is shown, as one full-width wide card
    (`.bento-grid-single`). The case study has Overview, Architecture, Results and a link to the public
    repository, and no screenshot panel until real screenshots exist. New labels use
    `.page-section-label` (15px). Experience uses V21's text with AlphaSoft360, names as plain text.
20. Contact and FAQ. No mail service or credentials exist, so the form validates and then opens the
    visitor's own email app with a prefilled message; it never claims a message was sent. FAQ answers
    that described the preview are reworded (`content/faq.ts`), and each answer is a named region.
21. Phase 6 shell. A skip link is the first Tab stop (off-screen until focused; every `<main>` has
    `id="main-content"`). Escape on the mobile drawer returns focus to the menu button. The pending
    hero LinkedIn button is `aria-disabled`. Also added: custom 404 page, canonical and Open Graph
    metadata (`pageMetadata` in `lib/site.ts`), sitemap, robots, Open Graph image, Person JSON-LD and
    security headers. `src/proxy.ts` gives unknown project URLs a real 404 status, because the partially
    prerendered case-study route has already started its response when `notFound()` runs (and
    `dynamicParams` is unavailable with Cache Components). `SITE_URL` (`lib/site.ts`) is `NEXT_PUBLIC_SITE_URL`, then Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, then localhost (see README, "Before and after deployment").

**Final pre-deployment improvements** (approved 2026-11-23)

22. Contact hero label. "LET'S CONNECT — OPEN TO OPPORTUNITIES" needs 435px on one line. Each
    phrase is now a nowrap `.eyebrow-phrase` inside `.contact-hero-label`. At 480px and below,
    the phrases stack on two lines without the divider; V21 broke "OPEN TO / OPPORTUNITIES".
23. 404 on tall screens. The hero grows so the footer reaches the bottom of the window. It is
    scoped with `body:has(> main.not-found-main:not([style*="display: none"]))`, because a hidden
    404 stays in the DOM after client-side navigation.
24. CV download (approved 2026-11-23). The user's original PDF is `web/public/cv/Faizan_CV.pdf`
    (one page, 69,075 bytes, SHA-256 `d90f308d…`). Never edit or replace it. `CV_FILE` in
    `lib/site.ts` points to it.
    - Every CV button (navbar, floating navbar, hero, mobile drawer, Experience) opens the V21 CV
      modal, which now reads "Download CV (PDF)".
    - The modal has a secondary "Close" button and a primary "Download PDF" link on the right,
      where V21's button was. The link downloads the file as `Faizan-Ali-CV.pdf`. Focus starts on
      it, and the modal closes as the download starts.
    - FAQ #5 now explains where to download the CV.
    - WhatsApp stays inactive until a verified number is supplied.
25. Professional photos (approved 2026-11-23). They are the user's own unedited files in
    `web/public/images/`: `faizan-ali-hero.png` (blue suit, 1070×1470) and
    `faizan-ali-about.png` (grey suit, 1122×1402). They are set in `content/photos.ts` and
    rendered by `ui/ProfileImage` (`next/image`, `object-fit: cover`). Never edit, regenerate or
    replace them.
    - Home hero: the photo fills the V21 frame. The gradient border, padding and 23px corners
      stay. It has no caption and no avatar outline, so it replaces change 5's label. The panel
      is 4:5 (`.photo-panel-filled`): about 450px tall on desktop, as in V21, and 418px instead
      of 350px at ≤620px. The photo is cropped from the bottom (`object-position: 50% 0%`) and
      loads eagerly with high priority.
    - About: a 4:3 photo in the "At a glance" card, between its label row and its heading
      (`.about-glance-photo`, 18px corners, no border, glow or added background). It loads
      lazily. The card's content and the hero workflow card are unchanged. On wide screens the
      card is taller than the story column; V21's card was already 63px taller.
    - Tests: `harness.cjs` adds an empty photo element with the same markup to the V21 pages.
      Pixel comparisons mask the photo (`#hero .photo-panel`, `.about-glance-photo`), and
      separate checks verify it.

26. LinkedIn (confirmed by the user on 2026-11-24): `https://www.linkedin.com/in/faizan-ali-5aa430380`
    (`LINKEDIN_PROFILE_URL` in `lib/site.ts`, the URL on the CV). V21's pending items become links
    like GitHub's, opening in a new tab with `rel="noopener noreferrer"`. This replaces the pending
    LinkedIn parts of changes 9 and 21.
    - The hero icon and the footer icon are links at full opacity, with no pending classes.
    - The Contact "Professional network" card is a link like the email card (`↗` arrow, and a hidden
      "(opens in a new tab)").
    - Person JSON-LD `sameAs` lists GitHub and LinkedIn.
    - `harness.cjs` applies the same markup to the V21 pages. AlphaSoft360's dates stay as on the
      site (Mar 2025), by the user's choice.

27. SEO Phase 1 (2026-11-24; metadata only, no visible change). The home page sets its own
    canonical link (`/`) in `app/page.tsx`, not the layout, so that the 404 page has none.
    `pageMetadata` repeats the Open Graph type, site name and share image (`/opengraph-image`)
    and sets a `summary_large_image` Twitter card, because a page's `openGraph`/`twitter` objects
    replace the layout's (shallow merge). The `pages` suite checks each page's share image and card,
    and that every sitemap URL is its page's canonical link.
28. SEO Phase 2 (2026-11-24; head and JSON-LD only, no visible change).
    - Titles and descriptions (each page file, and `SITE_DESCRIPTION`) use only what the pages show:
      Software Engineer / Software Developer (the AlphaSoft360 role), IT Project Manager,
      full-stack, Next.js, Pakistan. Every title and description is different. The home title
      still starts with "Faizan Ali", and About keeps its V21 title. The case-study title comes
      from `metaTitle` in `content/projects.ts`.
    - `og:locale` is `en_US`. About uses the Open Graph `profile` type (first and last name); the
      other pages use `website`.
    - JSON-LD (`lib/structured-data.ts`, rendered by `components/seo/JsonLd.tsx`). The layout's
      `<head>` has a site graph with Person (`/#person`) and WebSite (`/#website`). Each page adds
      its own graph **after `</main>`**, so the DOM inside `<main>` still matches V21. That graph is
      WebPage, ProfilePage (About), CollectionPage (Projects), ContactPage or FAQPage (from
      `content/faq.ts`), plus a BreadcrumbList below the home page. The case study's main entity is
      its public repository (SoftwareSourceCode). Never add ratings, awards, credentials or
      employers (`worksFor`) to it; the `pages` suite checks for them.

`harness.cjs` applies the site-wide markup changes above to every V21 page; `pages.regression.cjs`
applies the page-specific ones. With Cache Components, visited routes stay in the DOM with
`display:none`, so tests after client-side navigation must target visible elements (`h1:visible`).

How they are applied: label text, plus modifier classes (`.home-section-label`,
`.photo-label-muted`) styled in `web/src/styles/approved-changes.css`, which loads after the
legacy file. The label size is 15px. Plain `.eyebrow` elements elsewhere stay at 11px.
Removing the About switch makes the intro row shorter. The About content therefore starts about
21px higher, or about 56px higher at ≤760px, where the switch had its own row. This is expected.

## Current status and handoff

Read this first when resuming after a compaction or in a new session.

- **Done and pushed:** Phases 0, 1, 2 (homepage), Phase 6 homepage accessibility, and Phase 3
  (About page `/about`, Steps 3A–3E). About components live in `web/src/components/about/`, plus
  `hero/InsideHero.tsx`, `ui/EmployerLink.tsx` and `content/experience.ts`. Final verification
  (2026-11-05): 898/898 regression checks, lint, typecheck, format, build, e2e and a production-mode
  `/about` smoke test all pass.
- **Final delivery run (authorised 2026-11-05).** The user approved Phases 4B → 4E, 5, 6 and 7 as one
  continuous run, with one final report and no per-step approvals. This replaces rule 2 for this run.
  Commit, push, deploy, history rewrites and visibility changes still need explicit final approval.
  Decisions: showcase only Personal Portfolio (full-width card; POS and SkillOrbit excluded); the repo
  stays public; verified details only; plain-text employer names on the timeline; 15px main section
  labels; the Full-stack Applications card stays on `/projects`; no kiosk information on public pages;
  professional fallbacks when external details are missing; no paid services. Run targeted tests while
  building and one full regression at the end.
- **Final pre-deployment improvements (started 2026-11-23):** Contact label and 404 fixes, the CV
  download, both professional photos and LinkedIn (changes 22–26). The full regression run waits until the
  final assets are integrated. Commit, push and deploy still need explicit approval.
- **Regression totals:** 1,271 checks (`npm run test:regression`, about 55 min). `about-page` is 284, `pages` is 371. Run only the affected suites during a step
  (`npm run test:regression -- about-page footer`), and the full run at the end of a phase.
- **External details still needed:** WhatsApp number, mail provider and
  the final domain for `NEXT_PUBLIC_SITE_URL` (optional on Vercel; see README). Phases 4–7 are complete and pushed. Deploy only after the user
  approves.
- **Deployment preparation (2026-11-24):** Next.js was upgraded from 16.4.3 to 16.4.6 (approved patch for 7
  moderate `npm audit` advisories), together with `eslint-config-next`. `SITE_URL` falls back to
  Vercel's production address. Vercel: Root Directory `web`, Production Branch `main`, no
  `vercel.json`. Push and deploy only with the user's approval.
- **SEO Phase 3, performance and accessibility (2026-11-25): measured, no code change needed.**
  Lighthouse 13.6.0 (run from a scratch folder, not a project dependency), median of 3 runs, local
  production build: mobile performance 97–99, desktop 100; accessibility, best practices and SEO
  100 on Home, About, Projects and Contact; CLS 0; mobile home LCP 2.3 s (simulated slow 4G),
  the others 0.9–1.2 s. Live production (before Phase 1/2 were deployed) scored the same (mobile
  93–97). The remaining Lighthouse items are left alone on purpose: unused CSS (the single legacy
  file, see "CSS strategy"), unused or legacy JS inside React and the Next.js runtime, and the
  render-blocking stylesheet (only `experimental.inlineCss` would remove it). The hero photo is
  already preloaded with high priority, about 16 KB WebP. axe with WCAG 2.2 AA tags finds no
  violations on the 7 pages or the 404, at 390 and 1440px, in both themes, and nothing scrolls
  sideways. There is no field data (CrUX or INP) yet, so nothing is claimed about real users.
- Keep `.local/regression-2e/` as a backup. Do not delete it.

## Git

- There is one repository, at `personal-portfolio/` (branch `main`). Never create a nested repo
  in `web/`.
- The remote is `origin` (GitHub, `faizandevx/personal-portfolio`, branch `main`). Commit and push
  only when the user explicitly approves. Never force-push or rewrite history.
- `.gitattributes` forces LF line endings and marks `design-reference/**` as `-text`, so Git
  never rewrites the reference files (this machine has `core.autocrlf=true`).
- Never commit `.env*` files (except `.env.example`), credentials or confidential data.

## Visual parity testing

- Tests run in the **installed Google Chrome** (`channel: "chrome"` in
  `web/playwright.config.ts`). Do not download Playwright's bundled Chromium (the network here is
  too slow). The fallback is Microsoft Edge (`channel: "msedge"`), which is also installed.
- Playwright compares each Next route with its `design-reference/*.html` page (served on
  :4100).
- Viewports: 1440, 1280, 1024, 900, 768, 620, 390, 360. Both themes. Reduced motion, with
  animations disabled.
- Documented tolerances: `maxDiffPixelRatio 0.01`, `threshold 0.2` (set in
  `web/playwright.config.ts`).
- Report meaningful differences with an explanation. Never hide them by raising tolerances
  silently. Removed review-only elements are the only expected differences, and they are masked
  explicitly.
- **Regression suites:** `web/tests/regression/` (run with `npm run test:regression`; see its
  README).
  - Each suite applies the approved changes to the V21 page before comparing. Everything else
    must match V21.
  - `run.cjs` fixes the expected check count of every suite. A suite with fewer checks fails.
    Change a count only together with the suite, and explain why.
  - When a page or feature changes, update or extend its suite in the same step. Never weaken a
    check to make it pass: find out whether the app or the test is wrong, and report it.

## Next.js notes

- Next.js **16.4.6** (Turbopack by default). Read `web/AGENTS.md` and the bundled docs in
  `web/node_modules/next/dist/docs/` before using unfamiliar APIs. This version differs from
  older training data.
- `next.config.ts` enables `cacheComponents` (from the scaffold). Uncached dynamic data must sit
  inside `<Suspense>`. Runtime-only values such as the footer year belong in client components.
- Do not set `output: "export"`. Server routes are needed later.
- `LayoutProps` / `PageProps` are generated global types. `npm run typecheck` runs
  `next typegen` first.

## Commands (run in `web/`)

`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm run format:check` ·
`npm run test:e2e` · `npm run test:visual` · `npm run test:regression` · `npm run reference`
