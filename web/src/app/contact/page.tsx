import ContactForm from "@/components/contact/ContactForm";
import ContactSide from "@/components/contact/ContactSide";
import InsideHero from "@/components/hero/InsideHero";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Contact | Faizan Ali",
  "Get in touch with Faizan Ali about a role, a collaboration or an idea.",
  "/contact",
);

// Contact page (design-reference/contact.html), with visitor-facing wording.
export default function ContactPage() {
  return (
    <main id="main-content">
      <InsideHero>
        <div className="container">
          <div className="eyebrow page-section-label">
            LET&apos;S CONNECT <span className="eyebrow-line"></span> OPEN TO OPPORTUNITIES
          </div>
          <h1>
            Let&apos;s make something <span className="accent">meaningful.</span>
          </h1>
          <p>
            Whether you have a role, a collaboration or an idea in mind — I&apos;d love to hear from
            you.
          </p>
        </div>
      </InsideHero>
      <section
        aria-labelledby="contact-title"
        className="section page-content contact-page-section"
      >
        <div className="container contact-layout">
          <article className="contact-form-card">
            <div className="eyebrow page-section-label">A DIRECT CONVERSATION</div>
            <h2 id="contact-title">
              Send me a message<span className="accent">.</span>
            </h2>
            <p className="form-intro">
              A few details are all I need to get the conversation started. Fields marked{" "}
              <span className="required">*</span> are required.
            </p>
            <ContactForm />
          </article>
          <ContactSide />
        </div>
      </section>
    </main>
  );
}
