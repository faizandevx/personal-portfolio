import { LINKEDIN_PROFILE_URL, PUBLIC_EMAIL, WHATSAPP_NUMBER, WHATSAPP_URL } from "@/lib/site";

// The "other ways to connect" column (design-reference/contact.html). WhatsApp,
// email and LinkedIn are working links. V21's WhatsApp card said "Coming soon"; it
// now opens a chat with the approved public number (wa.me, new tab, no prefilled text).
export default function ContactSide() {
  return (
    <aside aria-label="Other ways to connect" className="contact-side">
      <a className="connect-feature" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
        <span className="feature-kicker">
          <span aria-hidden="true" className="pulse-dot"></span> STAY CONNECTED
        </span>
        <h3>Prefer a quick chat?</h3>
        <p>
          Message me on WhatsApp. It opens the app on your phone, or WhatsApp Web on a computer.
        </p>
        <span className="feature-action">
          {WHATSAPP_NUMBER} <span className="soon-tag">Chat on WhatsApp</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </span>
        <span aria-hidden="true" className="feature-shape">
          ↗
        </span>
      </a>
      <a className="contact-method" href={`mailto:${PUBLIC_EMAIL}`}>
        <span aria-hidden="true" className="method-icon">
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <rect height="14" rx="3" width="18" x="3" y="5"></rect>
            <path d="m4 7 8 6 8-6"></path>
          </svg>
        </span>
        <span className="method-copy">
          <span className="method-label">Email me</span>
          <strong>{PUBLIC_EMAIL}</strong>
        </span>
        <span aria-hidden="true" className="method-arrow">
          ↗
        </span>
      </a>
      <div className="contact-method contact-static">
        <span aria-hidden="true" className="method-icon">
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M3 12h18M12 3c3.2 3.3 3.2 14.7 0 18M12 3c-3.2 3.3-3.2 14.7 0 18"></path>
          </svg>
        </span>
        <span className="method-copy">
          <span className="method-label">Let&apos;s collaborate</span>
          <strong>Remote · On-site · International</strong>
        </span>
      </div>
      <a
        className="contact-method"
        href={LINKEDIN_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span aria-hidden="true" className="method-icon">
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <rect height="18" rx="4" width="18" x="3" y="3"></rect>
            <path d="M8 10v7m0-10v.1M12 17v-7m0 3a3 3 0 0 1 6 0v4"></path>
          </svg>
        </span>
        <span className="method-copy">
          <span className="method-label">Professional network</span>
          <strong>
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </strong>
        </span>
        <span aria-hidden="true" className="method-arrow">
          ↗
        </span>
      </a>
      <div className="aside-footer">
        <span aria-hidden="true" className="aside-status"></span> Available for meaningful projects
        and opportunities.
      </div>
    </aside>
  );
}
