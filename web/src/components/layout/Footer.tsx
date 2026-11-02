import Link from "next/link";
import BackToTopButton from "./BackToTopButton";
import FooterYear from "./FooterYear";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Skills", href: "/#home-skills" },
  { label: "Education", href: "/about#education" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
] as const;

// The V21 footer. Markup, classes, aria attributes and SVG paths match
// design-reference/*.html exactly so the approved CSS applies unchanged.
// LinkedIn stays a non-clickable icon until its public URL is confirmed.
export default function Footer() {
  return (
    <footer className="site-footer footer-reference" id="site-footer" aria-label="Site footer">
      <div className="container footer-reference-upper">
        <div className="footer-reference-brand-col">
          <Link className="footer-reference-brand" href="/" aria-label="Faizan Ali, go to homepage">
            Faizan <span>Ali.</span>
          </Link>
          <p className="footer-reference-title">Software Engineer &amp; IT Project Manager</p>
          <p className="footer-reference-country">
            <span className="country-indicator" aria-hidden="true"></span>Pakistan{" "}
            <span className="footer-timezone">· PKT (UTC+5)</span>
          </p>
        </div>
        <nav className="footer-reference-nav" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="footer-reference-icons" aria-label="Connect with Faizan Ali">
          <a
            className="footer-reference-icon"
            href="https://github.com/faizandevx"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            title="GitHub"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.09.67-3.74-1.32-3.74-1.32-.5-1.29-1.23-1.63-1.23-1.63-1.01-.7.07-.69.07-.69 1.11.08 1.7 1.14 1.7 1.14.99 1.7 2.6 1.21 3.23.93.1-.72.38-1.21.69-1.5-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.12-.28-.49-1.42.11-2.96 0 0 .93-.3 3.05 1.14A10.6 10.6 0 0 1 12 6.37c.95 0 1.9.13 2.78.38 2.12-1.44 3.05-1.14 3.05-1.14.6 1.54.23 2.68.11 2.96.71.78 1.14 1.77 1.14 2.98 0 4.26-2.59 5.2-5.06 5.48.39.34.73 1.01.73 2.04V22c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
            </svg>
          </a>
          <span
            className="footer-reference-icon footer-reference-icon-pending"
            aria-label="LinkedIn profile link will be added after confirmation"
            title="LinkedIn profile link coming soon"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.27 3a2.27 2.27 0 1 0 0 4.54 2.27 2.27 0 0 0 0-4.54ZM3.35 9.17h3.84V21H3.35V9.17Zm6.22 0h3.68v1.62h.05c.51-.97 1.77-1.98 3.65-1.98 3.91 0 4.63 2.58 4.63 5.93V21h-3.83v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94V21H9.57V9.17Z" />
            </svg>
          </span>
          <a
            className="footer-reference-icon"
            href="mailto:faizandevx@gmail.com"
            aria-label="Send an email"
            title="Email"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2.8" y="5.1" width="18.4" height="13.8" rx="2.5" />
              <path d="m3.7 6.8 8.3 6.4 8.3-6.4" />
            </svg>
          </a>
        </div>
      </div>
      <div className="container footer-reference-bottom">
        <span>
          © <FooterYear /> Faizan Ali
        </span>
        <BackToTopButton />
      </div>
    </footer>
  );
}
