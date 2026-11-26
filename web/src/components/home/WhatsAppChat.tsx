import { WHATSAPP_NUMBER, WHATSAPP_URL } from "@/lib/site";

// The V21 "Let's Chat" WhatsApp button (design-reference/index.html). V21's button
// opened a "coming soon" modal; with the approved public number it is a link that
// opens a WhatsApp chat (wa.me) in a new tab, with no prefilled message.
export default function WhatsAppChat() {
  return (
    <a
      className="btn btn-primary whatsapp-preview-trigger"
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Let's Chat on WhatsApp, ${WHATSAPP_NUMBER} (opens in a new tab)`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.4 11.7A8.4 8.4 0 0 1 8.1 19l-4.3 1.2L5 16a8.4 8.4 0 1 1 15.4-4.3Z" />
        <path d="M9.1 8.7c.2 2.4 2.2 4.4 4.6 4.8l1.5-1.2 1.6 1.1c-.4 1.7-2.2 2.3-3.7 1.9-3.3-.8-5.8-3.5-6.3-6.5-.2-1.3.6-2.6 1.8-2.9l1.1 1.5-.6 1.3Z" />
      </svg>
      Let&apos;s Chat <span aria-hidden="true">↗</span>
    </a>
  );
}
