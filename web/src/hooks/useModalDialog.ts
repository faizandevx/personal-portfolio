"use client";

import { useEffect, type RefObject } from "react";

type ModalDialogOptions = {
  isOpen: boolean;
  onClose: () => void;
  // The element that contains everything focusable in the dialog.
  dialogRef: RefObject<HTMLElement | null>;
  // Receives focus when the dialog opens.
  initialFocusRef: RefObject<HTMLElement | null>;
};

// Shared behaviour for the site's modal dialogs (CV, WhatsApp): while open,
// lock background scrolling, move focus into the dialog, close on Escape and
// keep Tab / Shift+Tab inside it. Returning focus on close is up to the caller,
// because only it knows which element opened the dialog.
export function useModalDialog({
  isOpen,
  onClose,
  dialogRef,
  initialFocusRef,
}: ModalDialogOptions) {
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

    initialFocusRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
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
  }, [isOpen, onClose, dialogRef, initialFocusRef]);
}
