"use client";

import { useEffect, useRef, useState } from "react";
import { PUBLIC_EMAIL } from "@/lib/site";

// Builds the prefilled email that the mailto form opens: the visitor's own email app
// does the sending. It is also the way out when direct delivery fails.
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

type Status =
  | { kind: "idle" }
  | { kind: "mailto" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; reason: "invalid" | "rate_limited" | "failed" };

const ERRORS = {
  invalid: "Please check your name, email address and message, then try again.",
  rate_limited:
    "You've sent several messages in a short time. Please wait a few minutes before trying again.",
  failed: "Your message couldn't be sent right now.",
};

// The V21 contact form (design-reference/contact.html). Required fields use the
// browser's own validation. With direct delivery configured (directDelivery, decided on
// the server), a valid form is posted to /api/contact and only a reply from the email
// provider counts as sent; otherwise it opens a prefilled email (mailto).
export default function ContactForm({ directDelivery = false }: { directDelivery?: boolean }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const sending = useRef(false);
  // When the form became usable (the server rejects instant, automated submissions).
  const shownAt = useRef(0);
  // One key per message, kept for retries so a retried message is never delivered twice.
  const submissionId = useRef<string | null>(null);

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const send = async (form: HTMLFormElement) => {
    if (sending.current) return;
    sending.current = true;
    setStatus({ kind: "sending" });
    const data = Object.fromEntries(new FormData(form));
    submissionId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          elapsedMs: Date.now() - shownAt.current,
          submissionId: submissionId.current,
        }),
      });
      if (response.ok) {
        setStatus({ kind: "sent" });
        form.reset();
        submissionId.current = null;
      } else {
        const reason =
          response.status === 429 ? "rate_limited" : response.status === 400 ? "invalid" : "failed";
        const body = await response.json().catch(() => null);
        setStatus({ kind: "error", reason: body?.error === "rejected" ? "failed" : reason });
      }
    } catch {
      setStatus({ kind: "error", reason: "failed" });
    } finally {
      sending.current = false;
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    // Fields that hold only spaces count as empty.
    for (const field of ["name", "message"]) {
      const input = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement;
      input.value = input.value.trim();
    }
    if (!form.reportValidity()) return;
    setCopied(false);
    if (directDelivery) {
      void send(form);
      return;
    }
    window.location.href = buildMailto(new FormData(form));
    setStatus({ kind: "mailto" });
  };

  // For visitors without an email app: copy the address so any mail service can use it.
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_EMAIL);
      setCopied(true);
    } catch {
      // Clipboard unavailable or blocked: the address stays visible and selectable.
      setCopied(false);
    }
  };

  const copyButton = (
    <button className="copy-email" type="button" onClick={copyEmail}>
      {copied ? "Address copied" : "Copy email address"}
    </button>
  );
  const isSending = status.kind === "sending";

  return (
    <form
      ref={formRef}
      action="#"
      aria-busy={isSending || undefined}
      className="demo-form contact-form"
      method="post"
      onSubmit={onSubmit}
      // Editing the message after a failed attempt makes it a new message.
      onInput={() => {
        submissionId.current = null;
      }}
    >
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
        {directDelivery && (
          // Spam trap: hidden from people and skipped by the keyboard; bots fill it in.
          <div aria-hidden="true" className="contact-trap">
            <label htmlFor="contact-website">Leave this field empty</label>
            <input autoComplete="off" id="contact-website" name="website" tabIndex={-1} />
          </div>
        )}
      </div>
      <div className="contact-submit-row">
        {directDelivery ? (
          <button
            aria-disabled={isSending || undefined}
            className="btn btn-primary send-btn"
            disabled={isSending}
            type="submit"
          >
            {isSending ? "Sending…" : "Send message"} <span aria-hidden="true">↗</span>
          </button>
        ) : (
          <button className="btn btn-primary send-btn" type="submit">
            Send via email <span aria-hidden="true">↗</span>
          </button>
        )}
        <p className="privacy-note">
          {/* One text node after the icon, as in V21. */}
          <span aria-hidden="true">◇</span>
          {directDelivery
            ? " Goes straight to my inbox. Nothing is stored on this site."
            : " Opens your email app. Nothing is stored on this site."}
        </p>
      </div>
      <p
        aria-live="polite"
        className={status.kind === "sent" ? "form-status form-status-success" : "form-status"}
        hidden={status.kind === "idle"}
        role="status"
      >
        {status.kind === "mailto" && (
          <>
            Your email app should open with your message ready to send. If it doesn&apos;t, please
            email me at <a href={`mailto:${PUBLIC_EMAIL}`}>{PUBLIC_EMAIL}</a>. {copyButton}
          </>
        )}
        {status.kind === "sending" && "Sending your message…"}
        {status.kind === "sent" && (
          <>
            <svg aria-hidden="true" className="form-status-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="11" />
              <path d="m7 12.5 3.2 3.2L17 9" />
            </svg>
            <span className="form-status-text">
              <strong>Message sent successfully!</strong>{" "}
              <span>
                Thank you for reaching out! I appreciate your interest and will get back to you as
                soon as possible.
              </span>
            </span>
          </>
        )}
        {status.kind === "error" && (
          <>
            {ERRORS[status.reason]} Your text is still in the form. You can try again,{" "}
            <button
              className="copy-email"
              type="button"
              onClick={() => {
                if (formRef.current)
                  window.location.href = buildMailto(new FormData(formRef.current));
              }}
            >
              open it in your email app
            </button>
            , or email me at <a href={`mailto:${PUBLIC_EMAIL}`}>{PUBLIC_EMAIL}</a>. {copyButton}
          </>
        )}
      </p>
    </form>
  );
}
