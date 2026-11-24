import ContactForm from "@/components/contact/ContactForm";
import ContactSide from "@/components/contact/ContactSide";
import InsideHero from "@/components/hero/InsideHero";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/site";
import { pageJsonLd } from "@/lib/structured-data";

const title = "Contact Faizan Ali | Software Engineer & IT Project Manager";
const description =
  "Get in touch with Faizan Ali about a software engineering or IT project management role, a collaboration or an idea.";

export const metadata = pageMetadata(title, description, "/contact");

// Contact page (design-reference/contact.html), with visitor-facing wording.
export default function ContactPage() {
  return (
    <>
      <main id="main-content">
        <InsideHero>
          <div className="container">
            {/* The two phrases never break mid-phrase; on phones they stack (approved-changes.css). */}
            <div className="eyebrow page-section-label contact-hero-label">
              <span className="eyebrow-phrase">LET&apos;S CONNECT</span>{" "}
              <span className="eyebrow-line"></span>{" "}
              <span className="eyebrow-phrase">OPEN TO OPPORTUNITIES</span>
            </div>
            <h1>
              Let&apos;s make something <span className="accent">meaningful.</span>
            </h1>
            <p>
              Whether you have a role, a collaboration or an idea in mind — I&apos;d love to hear
              from you.
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
      <JsonLd
        data={pageJsonLd({
          path: "/contact",
          name: title,
          description,
          type: "ContactPage",
          trail: [["Contact", "/contact"]],
        })}
      />
    </>
  );
}
