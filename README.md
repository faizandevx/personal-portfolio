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
│  ├─ tests/regression/  V21 parity + behaviour suites (1,268 checks; see its README.md)
│  ├─ tests/visual/    Reserved for toHaveScreenshot parity specs (empty)
│  └─ .env.example     Environment variables (`NEXT_PUBLIC_SITE_URL` is used; the rest are reserved)
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
npm run test:regression     # V21 parity + behaviour suites, 1,268 checks (about 55 min)
npm run test:regression -- hero contact   # selected suites
npm run test:regression:list              # suites and expected check counts
npm run test:regression:parallel          # same checks, up to 3 suites at once (faster)
```

## Tech stack

| Area      | Choice                                                                        |
| --------- | ----------------------------------------------------------------------------- |
| Framework | Next.js 16.4 (App Router, Turbopack), React 19.3                              |
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
  - **Let's Chat** opens an accessible "WhatsApp connection coming soon" modal. No number is
    published and no chat is opened.
  - The CV and WhatsApp modals share one dialog hook (`src/hooks/useModalDialog.ts`).
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
- **Experience:** `/experience` is the V21 timeline with AlphaSoft360 and Aman Bank as plain text, plus
  the CV button.
- **Contact:** the form validates and then opens the visitor's own email app with a prefilled message.
  No message passes through this site, and nothing is stored. Email is the working contact method.
- **FAQ:** the V21 single-open accordion, keyboard accessible, with visitor-facing answers.
- **Production:** skip link, drawer focus return, custom 404 page (`src/proxy.ts` gives unknown project
  URLs a real 404 status), canonical and Open Graph metadata,
  sitemap, robots, Open Graph image, Person structured data and security headers.

## Before and after deployment

Set `NEXT_PUBLIC_SITE_URL` to the public address when deploying. Without it, canonical links, the
sitemap and robots.txt point to `http://localhost:3000`.

## Not connected yet (by design)

These need details only the site owner can supply. Each one is labelled honestly on the site, and none
is ever shown as working:

| Item                | Current behaviour                                    | Needed                      |
| ------------------- | ---------------------------------------------------- | --------------------------- |
| CV download         | Modal says the CV isn't available yet                | The final CV PDF            |
| Professional photo  | Frame with "Professional photo coming soon"          | The photo                   |
| LinkedIn            | Marked as coming soon; not a link                    | The profile URL             |
| WhatsApp            | Modal says chat isn't available yet; no number shown | A public number             |
| Direct form sending | Form opens the visitor's email app instead           | A mail provider and API key |
| Ask Faizan AI       | Labelled scripted demo with pre-written answers      | An AI provider, if wanted   |

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
