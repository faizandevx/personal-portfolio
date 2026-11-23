"use client";

import { useRef } from "react";
import { useCvModal } from "@/context/CvModalContext";
import { useModalDialog } from "@/hooks/useModalDialog";
import { CV_FILE } from "@/lib/site";

// The V21 CV modal. Markup and classes match design-reference/*.html so the
// approved CSS applies unchanged; the review-only wording is replaced with
// honest visitor-facing text. Until CV_FILE (lib/site.ts) is set there is no
// download link at all (never a broken one); once it is set, the modal offers the PDF.
export default function CvModal() {
  const { isOpen, closeCvModal } = useCvModal();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Scroll lock, initial focus, Escape and the Tab focus trap.
  // With the CV available, focus starts on "Download PDF"; otherwise on "Understood".
  useModalDialog({
    isOpen,
    onClose: closeCvModal,
    dialogRef,
    initialFocusRef: CV_FILE ? downloadRef : closeButtonRef,
  });

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
      {CV_FILE ? (
        <div className="modal">
          <div className="eyebrow">Resume / CV</div>
          <h2 id="cv-modal-title">
            Download CV <span className="accent">(PDF)</span>
          </h2>
          <p id="cv-modal-description">
            My latest CV is ready to download as a PDF, with my experience, skills and education.
          </p>
          <p>
            You&apos;re also welcome to get in touch through the Contact page or by email at{" "}
            <code>faizandevx@gmail.com</code>.
          </p>
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              type="button"
              data-close-cv=""
              onClick={closeCvModal}
            >
              Close
            </button>
            {/* The original PDF, saved under a clear name; the modal closes as it downloads. */}
            <a
              ref={downloadRef}
              className="btn btn-primary"
              href={CV_FILE}
              download="Faizan-Ali-CV.pdf"
              type="application/pdf"
              data-cv-download=""
              onClick={closeCvModal}
            >
              Download PDF <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
