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
│  ├─ tests/e2e/       Playwright behaviour tests
│  ├─ tests/visual/    Playwright screenshot parity tests vs design-reference/
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

| Phase | Scope                                                                        | Status                                     |
| ----- | ---------------------------------------------------------------------------- | ------------------------------------------ |
| 0     | Project initialisation, tooling, docs                                        | ✅ Complete (approved)                     |
| 1     | Design system + shell (CSS, theme, header, footer, CV modal)                 | ✅ Complete (approved)                     |
| 2     | Home page                                                                    | Steps 2A–2D complete (approved); 2E next   |
| 3     | About page                                                                   | Not started                                |
| 4     | Projects, project detail, Experience                                         | Not started                                |
| 5     | Contact + FAQ                                                                | Not started                                |
| 6     | Hardening (performance, a11y, SEO, 404)                                      | Not started                                |
| 7     | Replace demo functionality (CV, LinkedIn, WhatsApp, contact backend, photos) | Not started, each item approved separately |

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
- 2E: homepage parity and behaviour tests in `tests/`, docs, Phase 2 report (next).

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

### Regression scripts not yet tracked in Git

The 563 Phase 2 regression checks, across 11 Playwright scripts, are **not yet in Git**. They
compare every homepage section, the shell and the modals against V21. The repository's
`web/tests/` currently holds only the e2e smoke tests.

Until Phase 2 Step 2E moves the scripts into `web/tests/`, they are kept on the development
machine in `.local/regression-2e/`. That folder is excluded locally through
`.git/info/exclude` and is never pushed, and its own `README.md` explains how to run them.

### Known minor issues

- **No favicon.** The browser's automatic `/favicon.ico` request returns a 404 and logs one
  console error. V21 has no favicon either. To fix later (Phase 6 hardening), without changing
  the design.
- **Low contrast on one label (light theme).** The orange 11px "LET'S CHAT" eyebrow in the
  WhatsApp modal scores 2.78:1 on white (axe `color-contrast`; WCAG AA needs 4.5:1). This is
  the V21 design, identical in `design-reference/`. Any colour change needs approval
  (Phase 6).
