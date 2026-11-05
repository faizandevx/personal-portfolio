# Regression suites (V21 parity and behaviour)

These suites compare the Next.js app with the approved V21 prototype in `design-reference/`,
which is served read-only. They check markup, layout, computed styles, pixels (with the
documented tolerances), hover states, animations, keyboard use, focus handling, accessibility
(axe) and the scripted demo features. They cover 8 widths (1440, 1280, 1024, 900, 768, 620,
390, 360) in both themes.

## Run

```bash
cd web
npm run test:regression                    # all suites, one at a time (about 37 minutes)
npm run test:regression -- hero contact    # selected suites
npm run test:regression:list               # suites and expected check counts
npm run test:regression:parallel           # up to 3 suites at once (same checks, estimated 25 minutes)
npm run test:regression -- --jobs 2        # choose the number of parallel suites
```

`--jobs` runs only the suites that compare layout, styles, pixels, links and focus in
parallel. The suites whose checks measure timing still run one at a time, after the others:
`contact`, `scroll`, `toggle`, `drawer`, `cv-scrollbar` and `about-page`. They check animation replay,
scroll damping, transitions and real scrollbars. Coverage and tolerances are the same in
both modes.

Keep the machine otherwise idle during a run. Running `npm run typecheck` (which writes into
`.next/`), a build or other heavy work at the same time slows the dev server a lot.

The runner reuses servers that are already running on `:3000` (`npm run dev`) and `:4100`
(`npm run reference`). If they aren't running, it starts them and stops them at the end.
Before the suites run, it checks that every file in `design-reference/` still matches the V21
ZIP checksums (`fixtures/design-reference.sha256`), and that
`src/styles/legacy/styles.css` is still the verbatim V21 stylesheet.

A suite passes only when it has **no failures and exactly its expected number of checks**.
The counts are listed in `run.cjs`, so coverage can't shrink without anyone noticing. Change
a count only together with the suite itself, and explain why in the commit message.

Outputs (git-ignored): `test-results/regression/logs/<suite>.log`, with one PASS/FAIL line per
check, and `test-results/regression/screenshots/`. Any Playwright run (such as `npm run test:e2e`)
clears `test-results/`, so copy the logs first if you need to keep them.

## Settings

| Variable        | Default                 | Purpose                                      |
| --------------- | ----------------------- | -------------------------------------------- |
| `APP_URL`       | `http://localhost:3000` | The Next.js app (dev server)                 |
| `REFERENCE_URL` | `http://localhost:4100` | The served V21 reference                     |
| `PW_CHANNEL`    | `chrome`                | Installed browser (`msedge` is the fallback) |

The suites use the installed Google Chrome. Playwright's bundled Chromium is never
downloaded. Run them against the dev server: the suites hide the dev-only Next.js badge, and
the production build's CSS minification causes small, accepted anti-aliasing differences
(see CLAUDE.md).

## Approved differences

V21 is the baseline. Where the user approved a deviation (CLAUDE.md, "Approved design
changes"), the suite applies that same change to the V21 page before comparing. Examples are
injecting `src/styles/approved-changes.css` and setting the approved label text. Everything
else must still match V21. The review-only elements that were removed (the note ribbon, the
About switch and second-photo panel, the photo upload) are dropped from the V21 page before
comparing.

## Suites

| Suite           | Checks | Covers                                                                                                                                                                                                           |
| --------------- | -----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contact`       |     88 | 2D: Contact section, Ask Faizan AI (scripted), WhatsApp modal, axe                                                                                                                                               |
| `work-skills`   |     72 | 2C: Selected work + Expertise                                                                                                                                                                                    |
| `about`         |     87 | 2B: About section, Tech Visual, spacing refinement                                                                                                                                                               |
| `company-links` |     44 | 2B: AlphaSoft360 / Aman Bank links                                                                                                                                                                               |
| `hero`          |     86 | 2A: home hero, Learn more, photo panel                                                                                                                                                                           |
| `toggle`        |     28 | 1: theme toggle                                                                                                                                                                                                  |
| `drawer`        |     22 | 1: mobile drawer                                                                                                                                                                                                 |
| `scroll`        |     40 | 1: two-stage scroll navigation                                                                                                                                                                                   |
| `footer`        |     36 | 1: footer                                                                                                                                                                                                        |
| `cv-modal`      |     54 | 1: CV modal                                                                                                                                                                                                      |
| `cv-scrollbar`  |      6 | 1: CV modal scroll lock with classic scrollbars                                                                                                                                                                  |
| `homepage`      |     52 | 2E + 6: whole page (structure, links, Tab order, axe, motion, overflow, a11y fixes)                                                                                                                              |
| `about-page`    |    283 | 3: `/about` vs `about.html` (3B hero, workflow, spacing; 3C story, at a glance, journey; 3D capabilities, approach, education, CTA; 3E whole page: sections, full-page pixels, keyboard, drawer, motion, routes) |

The first 11 suites are the 563 checks built during Phases 1–2D. `homepage` was added in
Step 2E (39 checks); Phase 6 added 13 accessibility checks (contrast in default, hover and focus
states, decorative colours, favicon, footer LinkedIn, brand name). The axe checks require zero
violations in the app.
