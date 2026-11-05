// Runs the regression suites and checks the totals.
//
//   npm run test:regression                  all suites
//   npm run test:regression -- hero about    selected suites
//   npm run test:regression -- --list        list suites and expected check counts
//   npm run test:regression -- --jobs 3      run up to 3 suites at once (see TIMING)
//
// Each suite compares the app with the served V21 reference and prints one
// "PASS"/"FAIL" line per check. A suite passes only when it has no failures AND
// reports exactly its expected number of checks, so coverage cannot shrink
// silently. If the app or reference server is not running, it is started here
// (and stopped afterwards). Full logs: test-results/regression/logs/.
const { spawn, spawnSync } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { WEB_DIR, APP_URL, REFERENCE_URL, CHANNEL } = require("./harness.cjs");

// Expected number of checks per suite. Change a count only together with the
// suite itself, and say why in the change description.
const SUITES = [
  // 88 checks from Step 2D + 1 for the approved "no kiosks" content correction.
  ["contact", 89, "Phase 2D: Contact section, Ask Faizan AI, WhatsApp modal"],
  ["work-skills", 72, "Phase 2C: Selected work + Expertise"],
  ["about", 87, "Phase 2B: About section and Tech Visual"],
  ["company-links", 44, "Phase 2B: AlphaSoft360 / Aman Bank links"],
  ["hero", 86, "Phase 2A: home hero"],
  ["toggle", 28, "Phase 1: theme toggle"],
  ["drawer", 22, "Phase 1: mobile drawer"],
  ["scroll", 40, "Phase 1: two-stage scroll navigation"],
  ["footer", 36, "Phase 1: footer"],
  ["cv-modal", 54, "Phase 1: CV modal"],
  ["cv-scrollbar", 6, "Phase 1: CV modal scroll lock with classic scrollbars"],
  // 39 checks from Step 2E + 13 added in Phase 6 (contrast in default/hover/focus states,
  // decorative colours, favicon, footer LinkedIn, brand accessible name).
  [
    "homepage",
    52,
    "Phase 2E + 6: whole homepage (structure, links, keyboard, axe, motion, overflow, a11y fixes)",
  ],
  [
    "about-page",
    283,
    "Phase 3: /about page (3B hero + workflow visual; 3C story, at a glance, career journey; 3D capabilities, approach, education, CTA; 3E whole page)",
  ],
];
// The first 11 suites are the 564 checks from Phases 1-2D (563 + the kiosk correction);
// "homepage" (Step 2E) and "about-page" (Phase 3) are reported separately.
const ORIGINAL = SUITES.filter(([name]) => !["homepage", "about-page"].includes(name)).map(
  ([name]) => name,
);
// Suites with checks that measure timing (scroll damping, animation replay,
// transitions, classic scrollbars). With --jobs they still run one at a time,
// after the others, so CPU contention cannot affect their results.
const TIMING = ["contact", "scroll", "toggle", "drawer", "cv-scrollbar", "about-page"];

const REPO_DIR = path.resolve(WEB_DIR, "..");
const LOG_DIR = path.join(WEB_DIR, "test-results", "regression", "logs");
const CHECKSUMS = path.join(__dirname, "fixtures", "design-reference.sha256");

const argv = process.argv.slice(2);
const jobsIndex = argv.findIndex((a) => a === "--jobs" || a.startsWith("--jobs="));
const jobsValue =
  jobsIndex < 0
    ? "1"
    : argv[jobsIndex].includes("=")
      ? argv[jobsIndex].split("=")[1]
      : argv[jobsIndex + 1];
const JOBS = Number(jobsValue);
if (!Number.isInteger(JOBS) || JOBS < 1) {
  console.error(`--jobs needs a whole number of 1 or more (got "${jobsValue}").`);
  process.exit(2);
}
// The remaining arguments are suite names (and --list).
const jobsArgs =
  jobsIndex < 0 ? [] : argv[jobsIndex].includes("=") ? [jobsIndex] : [jobsIndex, jobsIndex + 1];
const args = argv.filter((a, i) => !jobsArgs.includes(i));
if (args.includes("--list")) {
  for (const [name, count, about] of SUITES)
    console.log(`${name.padEnd(14)} ${String(count).padStart(3)}  ${about}`);
  console.log(`${"total".padEnd(14)} ${SUITES.reduce((n, [, c]) => n + c, 0)}`);
  process.exit(0);
}
const unknown = args.filter((a) => !SUITES.some(([name]) => name === a));
if (unknown.length) {
  console.error(`Unknown suite(s): ${unknown.join(", ")}. Use --list.`);
  process.exit(2);
}
const selected = args.length ? SUITES.filter(([name]) => args.includes(name)) : SUITES;

const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

// design-reference/ must stay byte-identical to the approved V21 ZIP, and the
// legacy stylesheet must be the verbatim V21 styles.css.
function checkReferenceIntegrity() {
  const lines = fs.readFileSync(CHECKSUMS, "utf8").split("\n").filter(Boolean);
  const problems = [];
  for (const line of lines) {
    const [hash, name] = line.split(/\s+\*?/);
    const file = path.join(REPO_DIR, name);
    if (!fs.existsSync(file)) problems.push(`missing ${name}`);
    else if (sha256(file) !== hash) problems.push(`changed ${name}`);
  }
  const listed = new Set(lines.map((l) => path.basename(l.split(/\s+\*?/)[1])));
  for (const name of fs.readdirSync(path.join(REPO_DIR, "design-reference"))) {
    if (!listed.has(name)) problems.push(`unexpected design-reference/${name}`);
  }
  const legacy = path.join(WEB_DIR, "src", "styles", "legacy", "styles.css");
  if (sha256(legacy) !== sha256(path.join(REPO_DIR, "design-reference", "styles.css"))) {
    problems.push("web/src/styles/legacy/styles.css differs from the V21 styles.css");
  }
  return { files: lines.length, problems };
}

async function reachable(url) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    return response.ok;
  } catch {
    return false;
  }
}

const started = [];
async function ensureServer(name, url, script) {
  if (await reachable(url)) return console.log(`${name}: using the running server at ${url}`);
  console.log(`${name}: not running, starting "npm run ${script}"…`);
  const child = spawn("npm", ["run", script], {
    cwd: WEB_DIR,
    shell: true,
    stdio: "ignore",
    detached: process.platform !== "win32",
  });
  started.push(child);
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (await reachable(url)) return console.log(`${name}: ready at ${url}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`${name} did not start at ${url} within 120s`);
}

function stopStartedServers() {
  for (const child of started) {
    if (process.platform === "win32")
      spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else {
      try {
        process.kill(-child.pid);
      } catch {
        // Already stopped.
      }
    }
  }
}

function runSuite(name) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(process.execPath, [path.join(__dirname, `${name}.regression.cjs`)], {
      cwd: WEB_DIR,
    });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("close", (code) => {
      fs.writeFileSync(path.join(LOG_DIR, `${name}.log`), output);
      const lines = output.split(/\r?\n/);
      resolve({
        code,
        passed: lines.filter((l) => l.startsWith("PASS  ")).length,
        failed: lines.filter((l) => l.startsWith("FAIL  ")),
        seconds: Math.round((Date.now() - startedAt) / 1000),
      });
    });
  });
}

(async () => {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const integrity = checkReferenceIntegrity();
  console.log(
    integrity.problems.length === 0
      ? `design-reference: ${integrity.files}/${integrity.files} files identical to the V21 ZIP; legacy styles.css verbatim`
      : `design-reference: PROBLEMS\n  ${integrity.problems.join("\n  ")}`,
  );

  await ensureServer("app", APP_URL, "dev");
  await ensureServer("V21 reference", REFERENCE_URL, "reference");
  console.log(`browser channel: ${CHANNEL}; jobs: ${JOBS}\n`);

  const runStarted = Date.now();
  let ok = integrity.problems.length === 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let originalPassed = 0;
  const report = (name, expected, r) => {
    const good = r.code === 0 && r.failed.length === 0 && r.passed === expected;
    ok &&= good;
    totalPassed += r.passed;
    totalFailed += r.failed.length;
    if (ORIGINAL.includes(name)) originalPassed += r.passed;
    const note =
      r.passed !== expected && r.failed.length === 0 ? `  (expected ${expected} checks)` : "";
    console.log(
      `${name.padEnd(14)} ${good ? "ok  " : "FAIL"}  ${String(r.passed).padStart(3)} passed, ${r.failed.length} failed${note}  ${r.seconds}s`,
    );
    for (const line of r.failed) console.log(`      ${line.slice(0, 300)}`);
    if (r.code !== 0 && r.failed.length === 0)
      console.log(`      exited with code ${r.code}; see test-results/regression/logs/${name}.log`);
  };

  // With --jobs > 1, the non-timing suites share a pool of workers; the
  // timing-sensitive ones then run one at a time.
  const pooled = JOBS > 1 ? selected.filter(([name]) => !TIMING.includes(name)) : [];
  const serial = selected.filter((suite) => !pooled.includes(suite));
  const queue = [...pooled];
  const worker = async () => {
    while (queue.length) {
      const [name, expected] = queue.shift();
      report(name, expected, await runSuite(name));
    }
  };
  await Promise.all(Array.from({ length: Math.min(JOBS, pooled.length) }, worker));
  for (const [name, expected] of serial) report(name, expected, await runSuite(name));

  const expectedTotal = selected.reduce((n, [, c]) => n + c, 0);
  const expectedOriginal = selected
    .filter(([name]) => ORIGINAL.includes(name))
    .reduce((n, [, c]) => n + c, 0);
  const minutes = ((Date.now() - runStarted) / 60000).toFixed(1);
  console.log(
    `\n${totalPassed} passed, ${totalFailed} failed (expected ${expectedTotal} checks) in ${minutes} min`,
  );
  if (expectedOriginal)
    console.log(`  Phases 1-2D suites: ${originalPassed}/${expectedOriginal} passed`);
  console.log(ok ? "REGRESSION SUITE PASSED" : "REGRESSION SUITE FAILED");
  stopStartedServers();
  process.exitCode = ok ? 0 : 1;
})().catch((error) => {
  console.error(error);
  stopStartedServers();
  process.exitCode = 1;
});
