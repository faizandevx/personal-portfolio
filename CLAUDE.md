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

## Git

- There is one repository, at `personal-portfolio/` (branch `main`). Never create a nested repo
  in `web/`.
- It is local only. Do not add a remote or push without explicit approval. Commit only when the
  user asks.
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
`npm run test:e2e` · `npm run test:visual` · `npm run reference`
