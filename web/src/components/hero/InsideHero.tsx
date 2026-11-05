import SiteHeader from "@/components/layout/SiteHeader";

// The V21 hero for inner pages (About, Projects, Experience, Contact, FAQ):
// <section class="inside-hero" data-header-hero> with the shared hero header
// inside it, exactly as in design-reference/*.html. data-header-hero lets the
// shared scroll navigation hand over to the floating header after this section.
export default function InsideHero({ children }: { children: React.ReactNode }) {
  return (
    <section className="inside-hero" data-header-hero="">
      <SiteHeader variant="hero" />
      {children}
    </section>
  );
}
