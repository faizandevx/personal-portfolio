// The approved V21 "From idea to impact" Tech Visual (tech-v16) from the home
// About section. Markup and classes match design-reference/index.html exactly;
// all of its styling and hover motion comes from the legacy stylesheet.
export default function TechVisual() {
  return (
    <div
      className="about-showcase visual-mode tech-v16"
      id="aboutVisual"
      aria-label="Professional software engineering visual: interfaces, APIs and project delivery"
    >
      <div className="tech-v16-meta">
        <span className="tech-v16-live-dot" aria-hidden="true"></span> ENGINEERING × DELIVERY{" "}
        <span className="tech-v16-mark" aria-hidden="true">
          ✳
        </span>
      </div>
      <div className="tech-v16-heading">
        From idea to <span>impact.</span>
      </div>
      <p className="tech-v16-caption">Connecting design, systems and delivery.</p>
      <div className="tech-v16-process" aria-label="My development approach">
        <div className="tech-v16-phase">
          <span className="tech-v16-phaseicon" aria-hidden="true">
            ▣
          </span>
          <strong>Frontend</strong>
          <small>Build the experience</small>
        </div>
        <span className="tech-v16-arrow" aria-hidden="true">
          <span>→</span>
        </span>
        <div className="tech-v16-phase">
          <span className="tech-v16-phaseicon" aria-hidden="true">
            {"{ }"}
          </span>
          <strong>Backend</strong>
          <small>Connect the systems</small>
        </div>
        <span className="tech-v16-arrow" aria-hidden="true">
          <span>→</span>
        </span>
        <div className="tech-v16-phase">
          <span className="tech-v16-phaseicon" aria-hidden="true">
            ◇
          </span>
          <strong>Delivery</strong>
          <small>Ship with confidence</small>
        </div>
      </div>
      <div className="tech-v16-editor" aria-label="Example technology stack visualization">
        <div className="tech-v16-editorbar">
          <div className="tech-v16-dots" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </div>
          <span>solution.ts</span>
          <span className="tech-v16-filetype">TYPE SCRIPT</span>
        </div>
        <div className="tech-v16-code" aria-hidden="true">
          <div>
            <span className="code-line-no">01</span>
            <span className="code-violet">const</span> <span className="code-cream">portfolio</span>{" "}
            <span className="code-muted">=</span> <span className="code-muted">{"{"}</span>
          </div>
          <div>
            <span className="code-line-no">02</span>
            {"  "}
            <span className="code-blue">frontend</span>
            <span className="code-muted">:</span>{" "}
            <span className="code-orange">&apos;Next.js + React&apos;</span>
            <span className="code-muted">,</span>
          </div>
          <div>
            <span className="code-line-no">03</span>
            {"  "}
            <span className="code-blue">backend</span>
            <span className="code-muted">:</span>{" "}
            <span className="code-orange">&apos;Node.js + APIs&apos;</span>
            <span className="code-muted">,</span>
          </div>
          <div>
            <span className="code-line-no">04</span>
            {"  "}
            <span className="code-blue">approach</span>
            <span className="code-muted">:</span>{" "}
            <span className="code-orange">&apos;Plan → Build → Deliver&apos;</span>
          </div>
          <div>
            <span className="code-line-no">05</span>
            <span className="code-muted">{"};"}</span>
            <span className="tech-v16-caret" aria-hidden="true"></span>
          </div>
        </div>
        <div className="tech-v16-editorfoot">
          <span>
            <span className="tech-v16-statusdot" aria-hidden="true"></span> SYSTEM THINKING
          </span>
          <span>FAIZAN / WORKSPACE</span>
        </div>
      </div>
      <div className="tech-v16-bottom">
        <span>FOCUS AREAS</span>
        <div className="tech-v16-tags" aria-label="Key technologies and disciplines">
          <span>React</span>
          <span>Next.js</span>
          <span>REST APIs</span>
          <span>Agile</span>
        </div>
      </div>
      <div className="tech-v16-cornerglow" aria-hidden="true"></div>
    </div>
  );
}
