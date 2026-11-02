"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type CvModalValue = {
  isOpen: boolean;
  // Remembers the element that opened the modal so focus can return to it.
  openCvModal: (trigger: HTMLElement | null) => void;
  closeCvModal: () => void;
};

const CvModalContext = createContext<CvModalValue | null>(null);

// One CV modal for the whole site, shared by every "CV" link (hero header,
// floating header, mobile drawer, and later the home page).
export function CvModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openCvModal = useCallback((trigger: HTMLElement | null) => {
    triggerRef.current = trigger;
    setIsOpen(true);
  }, []);

  const closeCvModal = useCallback(() => {
    setIsOpen(false);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    // Return focus to the link that opened the modal. If it has since been
    // hidden (e.g. the mobile drawer closed when the modal opened), fall back
    // to that header's hamburger so keyboard users land somewhere sensible.
    requestAnimationFrame(() => {
      if (!trigger?.isConnected) return;
      const hidden =
        trigger.closest(".mobile-drawer:not(.open)") !== null ||
        !trigger.checkVisibility({ visibilityProperty: true });
      const target = hidden
        ? trigger.closest("header")?.querySelector<HTMLElement>(".hamburger")
        : trigger;
      target?.focus();
    });
  }, []);

  const value = useMemo(
    () => ({ isOpen, openCvModal, closeCvModal }),
    [isOpen, openCvModal, closeCvModal],
  );

  return <CvModalContext.Provider value={value}>{children}</CvModalContext.Provider>;
}

export function useCvModal() {
  const context = useContext(CvModalContext);
  if (!context) throw new Error("useCvModal must be used inside <CvModalProvider>");
  return context;
}
