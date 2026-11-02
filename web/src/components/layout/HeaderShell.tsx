"use client";

import type { HeaderVariant } from "@/context/MenuContext";
import { useScrollNav } from "@/context/ScrollNavContext";

// The outer <header> of each navigation bar. Only one is interactive at a
// time: the hero header until it fades out, then the floating header. The
// hidden one is aria-hidden and inert (not focusable or clickable), as in
// design-reference/app.js. The visuals come from the V21 CSS classes.
export default function HeaderShell({
  variant,
  children,
}: {
  variant: HeaderVariant;
  children: React.ReactNode;
}) {
  const { floatingVisible, heroInactive, registerHeroHeader } = useScrollNav();

  if (variant === "hero") {
    return (
      <header
        ref={registerHeroHeader}
        className={heroInactive ? "hero-header nav-inactive" : "hero-header"}
        aria-hidden={heroInactive}
        inert={heroInactive}
      >
        {children}
      </header>
    );
  }

  return (
    <header
      className={floatingVisible ? "floating-header visible" : "floating-header"}
      aria-hidden={!floatingVisible}
      inert={!floatingVisible}
    >
      {children}
    </header>
  );
}
