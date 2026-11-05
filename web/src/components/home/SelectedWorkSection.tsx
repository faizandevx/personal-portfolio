import Link from "next/link";

// The V21 home "Selected work" section (design-reference/index.html, #home-work).
// Approved Phase 2 change: the label has no "02 /" prefix and uses the larger
// home-section-label size. Links use the final routes. Approved Phase 4 wording
// replaces the intro and featured-card text that described the design preview.
export default function SelectedWorkSection() {
  return (
    <section className="section" id="home-work">
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow home-section-label">Selected work</div>
            <h2>Built with intent.</h2>
            <p className="section-intro">A look at my project work and professional experience.</p>
          </div>
          <Link href="/projects" className="link-inline">
            All projects ↗
          </Link>
        </div>
        <div className="bento-grid">
          <Link href="/projects" className="bento-card wide">
            <div className="card-icon">⌘</div>
            <div className="eyebrow">Featured case study</div>
            <h3>Full-stack applications</h3>
            <p>Explore my project work, including how it was designed, built and tested.</p>
            <div className="card-illustration" aria-hidden="true">
              ⌘
            </div>
            <span className="card-arrow">↗</span>
          </Link>
          <Link href="/experience" className="bento-card">
            <div className="card-icon">◈</div>
            <h3>Digital banking</h3>
            <p>Technology coordination, integrations and complex project delivery.</p>
            <span className="card-arrow">↗</span>
          </Link>
          <Link href="/about" className="bento-card">
            <div className="card-icon">✳</div>
            <h3>Ask Faizan AI</h3>
            <p>
              Planned: an AI-powered assistant to guide recruiters through verified portfolio
              content.
            </p>
            <span className="card-arrow">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
