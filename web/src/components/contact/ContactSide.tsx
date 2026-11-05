import { PUBLIC_EMAIL } from "@/lib/site";

// The "other ways to connect" column (design-reference/contact.html). Email is the
// working method; WhatsApp and LinkedIn are marked as not available yet.
export default function ContactSide() {
  return (
    <aside aria-label="Other ways to connect" className="contact-side">
      <div className="connect-feature">
        <span className="feature-kicker">
          <span aria-hidden="true" className="pulse-dot"></span> STAY CONNECTED
        </span>
        <h3>Prefer a quick chat?</h3>
        <p>WhatsApp chat isn&apos;t available yet. Email is the best way to reach me.</p>
        <span className="feature-action">
          WhatsApp option <span className="soon-tag">Coming soon</span>
        </span>
        <span aria-hidden="true" className="feature-shape">
          ↗
        </span>
      </div>
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
            <rect height="18" rx="4" width="18" x="3" y="3"></rect>
            <path d="M8 10v7m0-10v.1M12 17v-7m0 3a3 3 0 0 1 6 0v4"></path>
          </svg>
        </span>
        <span className="method-copy">
          <span className="method-label">Professional network</span>
          <strong>
            LinkedIn <small>· Profile link coming soon</small>
          </strong>
        </span>
      </div>
      <div className="aside-footer">
        <span aria-hidden="true" className="aside-status"></span> Available for meaningful projects
        and opportunities.
      </div>
    </aside>
  );
}
