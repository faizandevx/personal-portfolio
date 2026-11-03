import Link from "next/link";
import TechVisual from "@/components/home/TechVisual";

// The V21 home "About me" section (design-reference/index.html, #home-about).
// Approved Phase 2 changes: the label has no "01 /" prefix and uses the larger
// home-section-label size, and only the Tech Visual is shown (the review-only
// "Preview the look" switch and second-photo panel are not ported).
export default function AboutHomeSection() {
  return (
    <section className="section about-home-v15" id="home-about" aria-labelledby="home-about-title">
      <div className="container">
        <div className="about-home-intro">
          <div className="eyebrow home-section-label">ABOUT ME</div>
        </div>
        <div className="about-home-columns">
          <div className="about-home-copy">
            <h2 id="home-about-title">
              Hi, I&apos;m <span className="accent">Faizan Ali.</span>
            </h2>
            <p className="about-home-lead">
              I&apos;m a <strong>Software Engineer &amp; IT Project Manager</strong> working across
              full-stack development, digital banking, and technology delivery.
            </p>
            <p>
              My background brings together building applications and APIs with coordinating
              cross-functional technology initiatives. I enjoy turning complicated requirements into
              straightforward, useful experiences.
            </p>
            <p>
              I&apos;ve worked as a Software Developer at{" "}
              <strong>
                <a
                  className="about-company-link"
                  href="https://www.alphasoft360.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AlphaSoft360<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </strong>{" "}
              and as an IT Project Manager at{" "}
              <strong>
                <a
                  className="about-company-link"
                  href="https://www.aman-bank.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Aman Bank<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </strong>
              , bringing both engineering and delivery perspectives to the table.
            </p>
            <Link className="btn btn-primary about-home-cta" href="/about">
              More About Me <span aria-hidden="true">↗</span>
            </Link>
            <div className="about-home-caption">
              <span className="caption-dot"></span>Detailed career story, skills and education are
              on the About page.
            </div>
          </div>
          <div className="about-home-media">
            <TechVisual />
          </div>
        </div>
        <div className="about-home-bento" aria-label="Professional expertise overview">
          <article className="about-strong-card">
            <div className="about-mini-icon" aria-hidden="true">
              ⌘
            </div>
            <h3>Software Engineering</h3>
            <p>Building practical digital solutions</p>
          </article>
          <article className="about-strong-card">
            <div className="about-mini-icon" aria-hidden="true">
              ◇
            </div>
            <h3>Digital Banking</h3>
            <p>Banking technology initiatives</p>
          </article>
          <article className="about-strong-card">
            <div className="about-mini-icon" aria-hidden="true">
              ▤
            </div>
            <h3>IT Project Management</h3>
            <p>Planning, tracking and delivery</p>
          </article>
          <article className="about-strong-card">
            <div className="about-mini-icon" aria-hidden="true">
              ♧
            </div>
            <h3>Stakeholder Coordination</h3>
            <p>Collaborating across teams and vendors</p>
          </article>
        </div>
      </div>
    </section>
  );
}
