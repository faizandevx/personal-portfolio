"use client";

import { useState } from "react";
import { PUBLIC_EMAIL } from "@/lib/site";

// Builds the prefilled email that the form opens. There is no mail service behind
// this site, so the visitor's own email app does the sending.
function buildMailto(data: FormData) {
  const text = (name: string) => String(data.get(name) ?? "").trim();
  const name = text("name");
  const lines = [
    `Name: ${name}`,
    `Email: ${text("email")}`,
    ...(text("phone") ? [`Phone: ${text("phone")}`] : []),
    "",
    text("message"),
  ];
  const subject = text("subject") || `Portfolio enquiry from ${name}`;
  return `mailto:${PUBLIC_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\r\n"))}`;
}

// The V21 contact form (design-reference/contact.html). Required fields use the
// browser's own validation; a valid form opens a prefilled email.
export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    // Fields that hold only spaces count as empty.
    for (const field of ["name", "message"]) {
      const input = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement;
      input.value = input.value.trim();
    }
    if (!form.reportValidity()) return;
    window.location.href = buildMailto(new FormData(form));
    setSubmitted(true);
  };

  return (
    <form action="#" className="demo-form contact-form" method="post" onSubmit={onSubmit}>
      <div className="contact-fields">
        <div className="field">
          <label htmlFor="contact-name">
            Your name{" "}
            <span aria-hidden="true" className="required">
              *
            </span>
          </label>
          <input
            aria-required="true"
            autoComplete="name"
            id="contact-name"
            maxLength={100}
            name="name"
            placeholder="e.g. Alex Morgan"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="contact-email">
            Email address{" "}
            <span aria-hidden="true" className="required">
              *
            </span>
          </label>
          <input
            aria-required="true"
            autoComplete="email"
            id="contact-email"
            maxLength={160}
            name="email"
            placeholder="you@company.com"
            required
            type="email"
          />
        </div>
        <div className="field">
          <label htmlFor="contact-phone">
            Phone number <span className="optional">Optional</span>
          </label>
          <input
            autoComplete="tel"
            id="contact-phone"
            inputMode="tel"
            maxLength={30}
            name="phone"
            placeholder="+92 300 0000000"
            type="tel"
          />
        </div>
        <div className="field">
          <label htmlFor="contact-subject">
            Subject <span className="optional">Optional</span>
          </label>
          <input
            id="contact-subject"
            maxLength={150}
            name="subject"
            placeholder="What's this about?"
          />
        </div>
        <div className="field field-full">
          <label htmlFor="contact-message">
            Your message{" "}
            <span aria-hidden="true" className="required">
              *
            </span>
          </label>
          <textarea
            aria-required="true"
            id="contact-message"
            maxLength={3000}
            name="message"
            placeholder="Tell me about your opportunity, idea, or project..."
            required
            rows={6}
          ></textarea>
        </div>
      </div>
      <div className="contact-submit-row">
        <button className="btn btn-primary send-btn" type="submit">
          Send via email <span aria-hidden="true">↗</span>
        </button>
        <p className="privacy-note">
          <span aria-hidden="true">◇</span> Opens your email app. Nothing is stored on this site.
        </p>
      </div>
      <p aria-live="polite" className="form-status" hidden={!submitted} role="status">
        {submitted && (
          <>
            Your email app should open with your message ready to send. If it doesn&apos;t, please
            email me at <a href={`mailto:${PUBLIC_EMAIL}`}>{PUBLIC_EMAIL}</a>.
          </>
        )}
      </p>
    </form>
  );
}
