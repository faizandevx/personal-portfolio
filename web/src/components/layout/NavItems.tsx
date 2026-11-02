"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
] as const;

type NavItemsProps = {
  onNavigate?: () => void;
  // Mobile drawer: sets --link-index so the V21 CSS staggers each link in.
  staggered?: boolean;
};

export default function NavItems({ onNavigate, staggered = false }: NavItemsProps) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item, index) => {
        const isActive =
          pathname === item.href ||
          (item.href === "/projects" && pathname.startsWith("/projects/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "current" : undefined}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
            style={
              staggered ? ({ "--link-index": String(index) } as React.CSSProperties) : undefined
            }
          >
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
