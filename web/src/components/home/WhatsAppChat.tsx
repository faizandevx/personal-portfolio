"use client";

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useModalDialog } from "@/hooks/useModalDialog";

// The V21 "Let's Chat" WhatsApp button and its modal (design-reference/app.js).
// No WhatsApp number has been published yet, so the button never opens a chat:
// it opens an honest "coming soon" modal. Like V21, the modal is attached to
// <body>; it is only rendered while open (V21 keeps it hidden with display:none).
export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    // Return focus to the button that opened the modal.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useModalDialog({ isOpen, onClose: close, dialogRef, initialFocusRef: closeButtonRef });

  return (
    <>
      <button
        ref={triggerRef}
        className="btn btn-primary whatsapp-preview-trigger"
        type="button"
        aria-label="Let's Chat on WhatsApp (coming soon)"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
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
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={dialogRef}
            className="whatsapp-preview-backdrop open"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-modal-title"
            aria-describedby="whatsapp-modal-description"
            onClick={(event) => {
              // Only a click on the dimmed backdrop itself closes the modal.
              if (event.target === event.currentTarget) close();
            }}
          >
            <div className="whatsapp-preview-box">
              <div className="eyebrow">LET’S CHAT</div>
              <h3 id="whatsapp-modal-title">WhatsApp connection coming soon</h3>
              <p id="whatsapp-modal-description">
                WhatsApp chat isn&apos;t available yet. In the meantime, you&apos;re welcome to get
                in touch through the Contact page or by email at faizandevx@gmail.com.
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                className="btn btn-primary whatsapp-preview-close"
                onClick={close}
              >
                Got it
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
