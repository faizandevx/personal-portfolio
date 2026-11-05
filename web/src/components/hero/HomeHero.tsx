import Link from "next/link";
import CvTrigger from "@/components/layout/CvTrigger";
import LearnMoreLink from "@/components/hero/LearnMoreLink";

// The V21 home hero content (design-reference/index.html). It renders as a
// fragment inside <section class="hero-zone">, after the hero header, so the
// section's children match the reference exactly. The photo panel keeps the
// approved frame and avatar outline; the review-only upload control,
// instructions and "Photo-ready hero" tag are not ported.
export default function HomeHero() {
  return (
    <>
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="pill">
            <span className="orange-dot"></span>Software Engineer &amp; IT Project Manager
          </span>
          <h1>
            Building digital products with <span className="line-accent">purpose.</span>
          </h1>
          <p className="lead">
            Hi, I&apos;m <b style={{ color: "var(--fg)" }}>Faizan Ali.</b> I work across full-stack
            development, digital banking and intelligent applications — combining thoughtful
            engineering with real-world delivery.
          </p>
          <div className="actions hero-actions">
            <Link href="/about" className="btn btn-primary">
              About Me <span aria-hidden="true">↗</span>
            </Link>
            <CvTrigger className="btn btn-secondary cv-trigger">↓ Download CV</CvTrigger>
          </div>
          <div className="hero-social-row" aria-label="Social profiles">
            <a
              className="hero-social-link"
              href="https://github.com/faizandevx"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub — FaizanDevX"
              aria-label="Visit Faizan Ali on GitHub"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-4.3 1.3-4.3-2.3-6-2.7" />
                <path
                  d="M15 21v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 3.77 5.07 5.07 0 0 0 18.91 0S17.73-.35 15 1.48a13.38 13.38 0 0 0-7 0C5.27-.35 4.09 0 4.09 0A5.07 5.07 0 0 0 4 3.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 8 17.13V21"
                  transform="translate(1.0,1.0) scale(.90)"
                />
              </svg>
            </a>
            {/* Not a link until the LinkedIn URL is confirmed (as in V21). */}
            <button
              type="button"
              className="hero-social-link hero-social-pending"
              title="LinkedIn profile link coming soon"
              aria-label="LinkedIn profile link pending"
              aria-disabled="true"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </button>
          </div>
        </div>
        <div className="hero-photo">
          <div className="photo-panel">
            <div className="avatar-circle">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="33" r="18" />
                <path d="M18 91c1-20 12-34 32-34s31 14 32 34" />
              </svg>
            </div>
            <div className="photo-label photo-label-muted">Professional photo coming soon</div>
          </div>
        </div>
      </div>
      <LearnMoreLink />
    </>
  );
}
