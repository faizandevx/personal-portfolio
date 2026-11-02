"use client";

import { useCvModal } from "@/context/CvModalContext";

type CvTriggerProps = {
  className: string;
  children: React.ReactNode;
  "aria-label"?: string;
  style?: React.CSSProperties;
  // Runs before the modal opens, e.g. to close the mobile drawer.
  onOpen?: () => void;
};

// A V21 "CV" link. It stays an <a href="#cv-preview"> so the approved CSS
// (.cv-btn, drawer links) applies unchanged; JavaScript opens the CV modal
// instead of following the link.
export default function CvTrigger({ className, children, onOpen, ...rest }: CvTriggerProps) {
  const { openCvModal } = useCvModal();

  return (
    <a
      {...rest}
      className={className}
      href="#cv-preview"
      aria-haspopup="dialog"
      onClick={(event) => {
        event.preventDefault();
        onOpen?.();
        openCvModal(event.currentTarget);
      }}
    >
      {children}
    </a>
  );
}
