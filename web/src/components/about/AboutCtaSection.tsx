import Link from "next/link";

// The V21 About page closing call to action (design-reference/about.html,
// .about-v18-cta). The links use the final routes (V21: projects.html,
// contact.html).
export default function AboutCtaSection() {
  return (
    <section className="section about-v18-cta">
      <div className="container">
        <div className="about-v18-cta-inner">
          <div>
            <div className="eyebrow">What&apos;s next?</div>
            <h2>
              Curious about <span className="accent">my work?</span>
            </h2>
            <p>
              Explore selected projects and the experience behind them, or send me a message to
              start a conversation.
            </p>
          </div>
          <div className="about-v18-cta-actions">
            <Link className="btn btn-primary" href="/projects">
              Explore projects ↗
            </Link>
            <Link className="btn btn-secondary" href="/contact">
              Get in touch ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
