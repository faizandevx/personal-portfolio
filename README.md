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
│  ├─ tests/regression/  V21 parity + behaviour suites (615 checks; see its README.md)
│  ├─ tests/visual/    Reserved for toHaveScreenshot parity specs (empty)
│  └─ .env.example     Reserved environment variables (none are used yet)
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
npm run test:regression     # V21 parity + behaviour suites, 615 checks (about 22 min)
npm run test:regression -- hero contact   # selected suites
npm run test:regression:list              # suites and expected check counts
npm run test:regression:parallel          # same checks, up to 3 suites at once (about 14 min)
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

## Routes (planned)

| Route              | Source (design-reference)                |
| ------------------ | ---------------------------------------- |
| `/`                | index.html                               |
| `/about`           | about.html                               |
| `/projects`        | projects.html                            |
| `/projects/[slug]` | project-detail.html (typed project data) |
| `/experience`      | experience.html                          |
| `/contact`         | contact.html                             |
| `/faq`             | faq.html                                 |

## Phase status

| Phase | Scope                                                                        | Status                                                |
| ----- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| 0     | Project initialisation, tooling, docs                                        | ✅ Complete (approved)                                |
| 1     | Design system + shell (CSS, theme, header, footer, CV modal)                 | ✅ Complete (approved)                                |
| 2     | Home page                                                                    | Steps 2A–2D complete (approved); 2E next              |
| 3     | About page                                                                   | Not started                                           |
| 4     | Projects, project detail, Experience                                         | Not started                                           |
| 5     | Contact + FAQ                                                                | Not started                                           |
| 6     | Hardening (performance, a11y, SEO, 404)                                      | Homepage accessibility fixes built; awaiting approval |
| 7     | Replace demo functionality (CV, LinkedIn, WhatsApp, contact backend, photos) | Not started, each item approved separately            |

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

## Not yet functional (by design)

The site is still a scaffold. The CV download, WhatsApp chat, LinkedIn link,
contact-form delivery and AI assistant are not connected. They will never be shown as
working until they really are.

### Links to pages not built yet

Only `/` exists so far. These links already use their final routes and show a 404 until the
page is migrated:

| Route         | Linked from                                                                                                    | Arrives in |
| ------------- | -------------------------------------------------------------------------------------------------------------- | ---------- |
| `/about`      | Header, footer, hero "About Me", About "More About Me", "Ask Faizan AI" card, Expertise "More about my skills" | Phase 3    |
| `/projects`   | Header, footer, "All projects", "Featured case study" card (moves to a `/projects/[slug]` case study later)    | Phase 4    |
| `/experience` | Header, footer, "Digital banking" card                                                                         | Phase 4    |
| `/contact`    | Header, footer, Contact "Send a Message", Ask Faizan AI "Contact Faizan"                                       | Phase 5    |
| `/faq`        | Header, footer                                                                                                 | Phase 5    |

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

No known minor issues remain on the homepage.
