import Link from "next/link";
import MiniAiPreview from "@/components/home/MiniAiPreview";
import WhatsAppChat from "@/components/home/WhatsAppChat";

// The V21 home "Contact" section (design-reference/index.html, #home-contact).
// Approved Phase 2 change: the label has no "04 /" prefix and uses the larger
// home-section-label size. The WhatsApp button and the Ask Faizan AI card are
// honest placeholders until a public number and a real assistant exist.
export default function HomeContactSection() {
  return (
    <section
      className="section home-contact-v7"
      id="home-contact"
      aria-labelledby="home-contact-heading"
    >
      <div className="container contact-showcase">
        <div className="contact-showcase-copy">
          <div className="eyebrow home-section-label">CONTACT</div>
          <h2 id="home-contact-heading">
            Let&apos;s build something
            <br />
            <span className="accent">meaningful.</span>
          </h2>
          <p className="section-intro">
            Have a project, role, or collaboration in mind? Let&apos;s connect and turn great ideas
            into meaningful work.
          </p>
          <div className="actions contact-showcase-actions">
            <WhatsAppChat />
            <Link href="/contact" className="btn btn-secondary">
              Send a Message <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="contact-reassurance">
            <span className="availability-indicator" aria-hidden="true"></span> Open to
            conversations about interesting opportunities
          </div>
        </div>
        <MiniAiPreview />
      </div>
    </section>
  );
}
