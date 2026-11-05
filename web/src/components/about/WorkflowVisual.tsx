import { Fragment } from "react";

// The approved V21 "From idea to impact" workflow card (design-reference/about.html,
// .v21-workflow). Markup matches V21 exactly: the steps and arrows must stay
// interleaved siblings, because the step reveal is staggered with
// .v21-step:nth-child(3/5/7). All motion, hover and reduced-motion handling is CSS.
const steps = [
  {
    className: "step-understand",
    title: "Understand",
    lines: ["Analyse requirements", "and identify solutions"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18h6m-5 3h4M8.8 15.5A7 7 0 1 1 15.3 15c-.8.7-1.2 1.4-1.3 2H10c-.1-.8-.4-1.3-1.2-2Z" />
      </svg>
    ),
  },
  {
    className: "step-build",
    title: "Build",
    lines: ["Develop practical", "digital solutions"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m8 5-6 7 6 7m8-14 6 7-6 7m-3-17-2 20" />
      </svg>
    ),
  },
  {
    className: "step-coordinate",
    title: "Coordinate",
    lines: ["Work with teams", "and stakeholders"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="8" r="3" />
        <circle cx="17.5" cy="9" r="2.5" />
        <path d="M3.5 20v-2.2c0-2.6 2.2-4.6 5.5-4.6s5.5 2 5.5 4.6V20H3.5Zm12.5-6.1c3.1.1 4.6 1.7 4.6 4V20h-4" />
      </svg>
    ),
  },
  {
    className: "step-deliver",
    title: "Deliver",
    lines: ["Validate outcomes", "and support delivery"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 15c-2.1 1.8-2.4 4-2 5 1 .4 3.2.1 5-2M8 16l-2-4 5-5c3-3 6-3.5 10-4-.4 4-1.1 7-4 10l-5 5-4-2Z" />
        <circle cx="15.5" cy="8.5" r="1.4" />
        <path d="m8 16-1 2m7-8 3 3" />
      </svg>
    ),
  },
];

export default function WorkflowVisual() {
  return (
    <div
      className="about-v18-hero-visual v21-workflow"
      aria-label="From idea to impact: Understand, Build, Coordinate, Deliver"
    >
      <div className="v21-card-top">
        <strong>FROM IDEA TO IMPACT</strong>
        <span>
          ENGINEER <i>•</i> COORDINATE <i>•</i> DELIVER
        </span>
      </div>
      <div className="v21-card-main">
        <svg
          className="v21-connect-arcs"
          viewBox="0 0 480 74"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M25 55 C80 1 116 1 182 55 S282 1 354 55 S420 10 462 42"
            fill="none"
            stroke="#ff8b4d"
            strokeWidth="1.1"
            strokeDasharray="2 4"
            strokeLinecap="round"
            opacity=".75"
          />
          <path
            d="M30 58 C125 14 140 18 228 56 S350 5 455 49"
            fill="none"
            stroke="#a88bd9"
            strokeWidth=".8"
            strokeDasharray="2 5"
            opacity=".38"
          />
        </svg>
        <div className="v21-flow">
          {steps.map((step, index) => (
            <Fragment key={step.className}>
              {index > 0 && (
                <span className="v21-arrow" aria-hidden="true">
                  →
                </span>
              )}
              <div className={`v21-step ${step.className}`}>
                <span className="v21-icon">{step.icon}</span>
                <strong>{step.title}</strong>
                <small>
                  {step.lines[0]}
                  <br />
                  {step.lines[1]}
                </small>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="v21-card-foot">
        <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
          <rect x="3" y="19" width="6" height="10" rx="2" />
          <rect x="13" y="12" width="6" height="17" rx="2" />
          <rect x="23" y="4" width="6" height="25" rx="2" />
        </svg>
        <span>
          Combining software engineering with structured project delivery to create practical
          digital solutions.
        </span>
      </div>
    </div>
  );
}
