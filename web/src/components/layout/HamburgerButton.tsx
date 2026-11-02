"use client";

import { useMenu, type HeaderVariant } from "@/context/MenuContext";

// The V21 hamburger. The three lines morph into a close (×) icon through the
// approved CSS when the button has the "is-active" class.
export default function HamburgerButton({ variant }: { variant: HeaderVariant }) {
  const { openMenu, toggleMenu } = useMenu();
  const isOpen = openMenu === variant;

  return (
    <button
      type="button"
      className={isOpen ? "hamburger is-active" : "hamburger"}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
      onClick={() => toggleMenu(variant)}
    >
      <span className="burger-lines" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>
  );
}
