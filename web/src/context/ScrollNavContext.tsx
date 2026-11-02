"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useMenu } from "./MenuContext";

// Two-stage navigation from design-reference/app.js, ported with identical
// numbers:
// - The hero header travels upward at ~1/4 of the scroll speed (max 118px)
//   and fades out, with critically damped motion (200ms time constant).
// - The floating header slides in once the hero has passed (bottom <= -8px)
//   and hides again only when the hero is back (bottom >= 32px). The 40px gap
//   (hysteresis) prevents flicker at the boundary.
// Only the two yes/no values below go through React. The per-frame position
// and opacity are written straight to CSS variables, as in app.js, so
// scrolling never re-renders React.
const NAV_SPEED = 0.24;
const NAV_MAX_TRAVEL = 118;
const FADE_START = 45;
const FADE_DISTANCE = 470;
const DAMPING_MS = 200;
const MAX_FRAME_MS = 64;
const SHOW_AT = -8;
const HIDE_AT = 32;
const INACTIVE_BELOW_OPACITY = 0.04;

type ScrollNavValue = {
  floatingVisible: boolean;
  heroInactive: boolean;
  registerHeroHeader: (element: HTMLElement | null) => void;
};

const ScrollNavContext = createContext<ScrollNavValue | null>(null);

export function ScrollNavProvider({ children }: { children: React.ReactNode }) {
  const { closeMenuFor } = useMenu();
  const [heroHeader, registerHeroHeader] = useState<HTMLElement | null>(null);
  const [floatingVisible, setFloatingVisible] = useState(false);
  const [heroInactive, setHeroInactive] = useState(false);

  useEffect(() => {
    const hero = heroHeader?.closest<HTMLElement>("[data-header-hero]");
    if (!heroHeader || !hero) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let shown = false;
    let frame = 0;
    let lastTime = 0;
    let currentY = 0;
    let currentOpacity = 1;
    // Last values handed to React; undefined forces a sync on the first frame.
    let sentShown: boolean | undefined;
    let sentInactive: boolean | undefined;

    function update(timestamp: number) {
      frame = 0;
      const scrollTop = window.scrollY || 0;
      const heroBottom = hero!.getBoundingClientRect().bottom;
      if (!shown && heroBottom <= SHOW_AT) shown = true;
      else if (shown && heroBottom >= HIDE_AT) shown = false;
      if (shown !== sentShown) {
        sentShown = shown;
        setFloatingVisible(shown);
        if (!shown) closeMenuFor("floating");
      }

      const goalY = Math.min(NAV_MAX_TRAVEL, Math.max(0, scrollTop * NAV_SPEED));
      const goalOpacity = Math.max(0, 1 - Math.max(0, scrollTop - FADE_START) / FADE_DISTANCE);
      const dt = lastTime ? Math.min(MAX_FRAME_MS, timestamp - lastTime) : 16;
      const factor = reducedMotion.matches ? 1 : 1 - Math.exp(-dt / DAMPING_MS);
      currentY += (goalY - currentY) * factor;
      currentOpacity += (goalOpacity - currentOpacity) * factor;
      heroHeader!.style.setProperty("--hero-nav-y", currentY.toFixed(2) + "px");
      heroHeader!.style.setProperty("--hero-nav-opacity", currentOpacity.toFixed(3));

      const inactive = currentOpacity < INACTIVE_BELOW_OPACITY;
      if (inactive !== sentInactive) {
        sentInactive = inactive;
        setHeroInactive(inactive);
        if (inactive) closeMenuFor("hero");
      }

      lastTime = timestamp;
      // Keep animating until the damped values have settled.
      if (Math.abs(currentY - goalY) > 0.13 || Math.abs(currentOpacity - goalOpacity) > 0.004) {
        frame = requestAnimationFrame(update);
      }
    }

    const queueUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate, { passive: true });
    queueUpdate();

    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      cancelAnimationFrame(frame);
    };
  }, [heroHeader, closeMenuFor]);

  // Pages without a hero header (e.g. 404) never show the floating header, as
  // in app.js.
  const value = {
    floatingVisible: heroHeader !== null && floatingVisible,
    heroInactive,
    registerHeroHeader,
  };

  return <ScrollNavContext.Provider value={value}>{children}</ScrollNavContext.Provider>;
}

export function useScrollNav() {
  const context = useContext(ScrollNavContext);
  if (!context) throw new Error("useScrollNav must be used inside <ScrollNavProvider>");
  return context;
}
