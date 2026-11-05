import Link from "next/link";
import WorkflowVisual from "@/components/about/WorkflowVisual";

// The V21 About page hero content (design-reference/about.html). It renders
// inside <InsideHero>, after the hero header, so the section matches V21 and
// .inside-hero:has(.about-v18-hero-inner) applies. Approved change: the label
// has no "01 /" prefix and uses the larger section-label size.
export default function AboutHero() {
  return (
    <div className="container about-v18-hero-inner">
      <div className="eyebrow about-section-label">About me</div>
      <div className="about-v18-hero-grid">
        <div>
          <h1>
            Behind the code.
            <br />
            <span className="accent">Beyond the delivery.</span>
          </h1>
          <p>
            I&apos;m <strong>Faizan Ali</strong> — a Software Engineer and IT Project Manager
            bringing together hands-on development and real-world technology delivery.
          </p>
          <div className="about-v18-hero-actions">
            <a href="#my-story" className="btn btn-primary">
              Discover my story <span aria-hidden="true">↘</span>
            </a>
            <Link href="/projects" className="btn btn-secondary">
              Explore my work <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
        <WorkflowVisual />
      </div>
    </div>
  );
}
