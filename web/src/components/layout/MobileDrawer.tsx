"use client";

import { useMenu, type HeaderVariant } from "@/context/MenuContext";
import NavItems, { navItems } from "./NavItems";

// The V21 mobile drawer. It stays in the page at all times; the approved CSS
// hides it until it has the "open" class, then fades and slides it in.
export default function MobileDrawer({ variant }: { variant: HeaderVariant }) {
  const { openMenu, closeMenu } = useMenu();

  return (
    <nav
      className={openMenu === variant ? "mobile-drawer open" : "mobile-drawer"}
      aria-label="Mobile navigation"
    >
      <NavItems onNavigate={closeMenu} staggered />
      {/* --link-index continues after the nav links, as in app.js. */}
      <a
        className="cv-trigger"
        href="#cv-preview"
        style={{ "--link-index": String(navItems.length) } as React.CSSProperties}
        onClick={closeMenu}
      >
        ↓ Download CV
      </a>
    </nav>
  );
}
