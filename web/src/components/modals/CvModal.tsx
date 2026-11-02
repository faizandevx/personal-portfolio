"use client";

import { useEffect, useRef } from "react";
import { useCvModal } from "@/context/CvModalContext";

// The V21 CV modal. Markup and classes match design-reference/*.html so the
// approved CSS applies unchanged; the review-only wording is replaced with
// honest visitor-facing text. The CV PDF is not available yet, so there is no
// download link at all (never a broken one).
export default function CvModal() {
  const { isOpen, closeCvModal } = useCvModal();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Lock background scrolling. If the page has a classic (space-taking)
    // scrollbar, keep its gutter so the page does not shift sideways when the
    // scrollbar disappears. Overlay scrollbars (macOS, phones) take no space.
    const root = document.documentElement;
    const previous = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    const hasClassicScrollbar = window.innerWidth - root.clientWidth > 0;
    root.style.overflow = "hidden";
    if (hasClassicScrollbar) root.style.scrollbarGutter = "stable";

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCvModal();
        return;
      }
      // Keep keyboard focus inside the dialog.
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!dialogRef.current.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previous.overflow;
      root.style.scrollbarGutter = previous.gutter;
    };
  }, [isOpen, closeCvModal]);

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
