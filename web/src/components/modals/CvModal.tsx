"use client";

import { useRef } from "react";
import { useCvModal } from "@/context/CvModalContext";
import { useModalDialog } from "@/hooks/useModalDialog";

// The V21 CV modal. Markup and classes match design-reference/*.html so the
// approved CSS applies unchanged; the review-only wording is replaced with
// honest visitor-facing text. The CV PDF is not available yet, so there is no
// download link at all (never a broken one).
export default function CvModal() {
  const { isOpen, closeCvModal } = useCvModal();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Scroll lock, initial focus, Escape and the Tab focus trap.
  useModalDialog({ isOpen, onClose: closeCvModal, dialogRef, initialFocusRef: closeButtonRef });

  return (
    <div
      ref={dialogRef}
      className={isOpen ? "modal-backdrop open" : "modal-backdrop"}
      id="cvModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-modal-title"
      aria-describedby="cv-modal-description"
      onClick={(event) => {
        // Only a click on the dimmed backdrop itself closes the modal.
        if (event.target === event.currentTarget) closeCvModal();
      }}
    >
      <div className="modal">
        <div className="eyebrow">Resume / CV</div>
        <h2 id="cv-modal-title">
          Download CV <span className="accent">(coming soon)</span>
        </h2>
        <p id="cv-modal-description">
          My CV is being finalised and is not available to download yet.
        </p>
        <p>
          <b>In the meantime:</b> you are welcome to get in touch through the Contact page or by
          email at <code>faizandevx@gmail.com</code>.
        </p>
        <div className="modal-actions">
          <button
            ref={closeButtonRef}
            className="btn btn-primary"
            type="button"
            data-close-cv=""
            onClick={closeCvModal}
          >
            Understood ✓
          </button>
        </div>
      </div>
    </div>
  );
}
