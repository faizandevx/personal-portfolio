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
5. Hero photo panel (approved 2026-11-03). Keep the V21 frame and avatar outline. Remove the
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

How they are applied: label text, plus modifier classes (`.home-section-label`,
`.photo-label-muted`) styled in `web/src/styles/approved-changes.css`, which loads after the
legacy file. The label size is 15px. Plain `.eyebrow` elements elsewhere stay at 11px.
Removing the About switch makes the intro row shorter. The About content therefore starts about
21px higher, or about 56px higher at ≤760px, where the switch had its own row. This is expected.

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

- Next.js **16.4** (Turbopack by default). Read `web/AGENTS.md` and the bundled docs in
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
