import type { HeaderVariant } from "@/context/MenuContext";
import Brand from "./Brand";
import HamburgerButton from "./HamburgerButton";
import HeaderShell from "./HeaderShell";
import MobileDrawer from "./MobileDrawer";
import NavItems from "./NavItems";
import ThemeToggle from "./ThemeToggle";

type SiteHeaderProps = {
  // "hero" sits inside the page's hero section and glides away on scroll.
  // "floating" is rendered once by the root layout and slides in after the
  // hero has passed. Visually they are the same single navigation bar.
  variant: HeaderVariant;
};

// The single V21 navigation bar. Markup, classes and aria attributes match
// design-reference/*.html exactly so the approved CSS applies unchanged.
//
// The theme toggle, hamburger/drawer and scroll behaviour are interactive;
// the CV button gets its behaviour in a later Phase 1 step.
export default function SiteHeader({ variant }: SiteHeaderProps) {
  return (
    <HeaderShell variant={variant}>
      <div className="navbar">
        <Brand />
        <nav className="nav-links" aria-label="Main navigation">
          <NavItems />
        </nav>
        <div className="nav-ctas">
          <a className="cv-btn cv-trigger" href="#cv-preview" aria-label="View and download CV">
            ↓ CV
          </a>
          <ThemeToggle />
          <HamburgerButton variant={variant} />
        </div>
      </div>
      <MobileDrawer variant={variant} />
    </HeaderShell>
  );
}
