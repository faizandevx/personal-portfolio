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
├─ .gitattributes      LF line endings; design-reference/ is never converted
├─ .gitignore
├─ README.md
└─ CLAUDE.md           Working rules for AI-assisted development
```

There is one Git repository, at this root (branch `main`, local only, no remote yet). `web/` is
not a nested repository.

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
| 1     | Design system + shell (CSS, theme, header, footer, CV modal)                 | Not started                                |
| 2     | Home page                                                                    | Not started                                |
| 3     | About page                                                                   | Not started                                |
| 4     | Projects, project detail, Experience                                         | Not started                                |
| 5     | Contact + FAQ                                                                | Not started                                |
| 6     | Hardening (performance, a11y, SEO, 404)                                      | Not started                                |
| 7     | Replace demo functionality (CV, LinkedIn, WhatsApp, contact backend, photos) | Not started, each item approved separately |

Each phase finishes with build, lint, typecheck and tests passing and a report, and the next phase waits for approval.

**Phase 0 result:** build, lint, typecheck and format checks pass. The Playwright smoke tests
(`tests/e2e/smoke.spec.ts`, 2 of 2) pass in the installed Google Chrome. `design-reference/` is
verified unchanged against SHA-256 checksums. Phase 1 has not started and waits for approval.

## Not yet functional (by design)

The site is still a scaffold. The CV download, WhatsApp chat, LinkedIn link,
contact-form delivery and AI assistant are not connected. They will never be shown as
working until they really are.
