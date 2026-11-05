import Link from "next/link";
import FaqList from "@/components/faq/FaqList";
import InsideHero from "@/components/hero/InsideHero";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "FAQ | Faizan Ali",
  "Frequently asked questions about Faizan Ali’s software engineering, projects and professional opportunities.",
  "/faq",
);

// FAQ page (design-reference/faq.html), with visitor-facing wording.
export default function FaqPage() {
  return (
    <main id="main-content">
      <InsideHero className="faq-inside-hero">
        <div className="container">
          <div className="eyebrow page-section-label">COMMON QUESTIONS / FAQ</div>
          <h1>
            Answers, without the <span className="accent">guesswork.</span>
          </h1>
          <p>Quick, honest answers about my work, projects, opportunities, and ways to connect.</p>
        </div>
      </InsideHero>
      <section className="section faq-page-content" id="questions">
        <div className="container faq-page-grid">
          <div className="faq-section-intro">
            <div className="eyebrow page-section-label">GOOD TO KNOW</div>
            <h2>
              Frequently asked
              <br />
              <span className="accent">questions.</span>
            </h2>
            <p>
              Choose a question to reveal its answer. For specific opportunities, you can always
              contact me directly.
            </p>
            <Link className="faq-contact-link" href="/contact">
              Get in touch <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <FaqList />
        </div>
      </section>
      <section className="section faq-end-cta">
        <div className="container faq-end-inner">
          <div>
            <div className="eyebrow">STILL CURIOUS?</div>
            <h2>
              Let&apos;s start a <span className="accent">conversation.</span>
            </h2>
            <p>Have a question that&apos;s not answered here? I&apos;d love to hear from you.</p>
          </div>
          <Link className="btn btn-primary" href="/contact">
            Send a Message <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
