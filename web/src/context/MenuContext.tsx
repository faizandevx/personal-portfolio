"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type HeaderVariant = "hero" | "floating";

type MenuContextValue = {
  // Which header's mobile drawer is open, or null when all are closed.
  // A single value means opening one drawer always closes the other,
  // matching closeAllMenus() in design-reference/app.js.
  openMenu: HeaderVariant | null;
  toggleMenu: (variant: HeaderVariant) => void;
  closeMenu: () => void;
  // Closes only that header's drawer, e.g. when the header scrolls out of use.
  closeMenuFor: (variant: HeaderVariant) => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

// Above this width the drawer is hidden by the V21 CSS, so it is closed.
const DESKTOP_MIN_WIDTH = 900;

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [openMenu, setOpenMenu] = useState<HeaderVariant | null>(null);

  const closeMenu = useCallback(() => setOpenMenu(null), []);
  const toggleMenu = useCallback(
    (variant: HeaderVariant) => setOpenMenu((current) => (current === variant ? null : variant)),
    [],
  );
  const closeMenuFor = useCallback(
    (variant: HeaderVariant) => setOpenMenu((current) => (current === variant ? null : current)),
    [],
  );

  // body.menu-open lets the V21 CSS lift the active header above the page.
  useEffect(() => {
    document.body.classList.toggle("menu-open", openMenu !== null);
  }, [openMenu]);

  // While a drawer is open: close on Escape, on a click outside the drawer
  // and hamburger, and when the window grows to desktop width.
  useEffect(() => {
    if (openMenu === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest(".mobile-drawer") && !target?.closest(".hamburger")) closeMenu();
    };
    const onResize = () => {
      if (window.innerWidth > DESKTOP_MIN_WIDTH) closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, [openMenu, closeMenu]);

  const value = useMemo(
    () => ({ openMenu, toggleMenu, closeMenu, closeMenuFor }),
    [openMenu, toggleMenu, closeMenu, closeMenuFor],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error("useMenu must be used inside <MenuProvider>");
  return context;
}
