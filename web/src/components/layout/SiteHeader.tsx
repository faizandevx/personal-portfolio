import type { HeaderVariant } from "@/context/MenuContext";
import Brand from "./Brand";
import CvTrigger from "./CvTrigger";
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
// Interactive parts: CV button (opens the shared CV modal), theme toggle,
// hamburger/drawer and scroll behaviour.
export default function SiteHeader({ variant }: SiteHeaderProps) {
  return (
    <HeaderShell variant={variant}>
      <div className="navbar">
        <Brand />
        <nav className="nav-links" aria-label="Main navigation">
          <NavItems />
        </nav>
        <div className="nav-ctas">
          <CvTrigger className="cv-btn cv-trigger" aria-label="View and download CV">
            ↓ CV
          </CvTrigger>
          <ThemeToggle />
          <HamburgerButton variant={variant} />
        </div>
      </div>
      <MobileDrawer variant={variant} />
    </HeaderShell>
  );
}
