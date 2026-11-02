import SiteHeader from "@/components/layout/SiteHeader";

// Placeholder home page. The header sits inside the hero section, exactly as
// in design-reference/index.html. The real hero content is migrated in Phase 2.
export default function Home() {
  return (
    <main>
      <section className="hero-zone" data-header-hero id="hero">
        <SiteHeader variant="hero" />
        <div className="container">
          <h1>Faizan Ali — portfolio</h1>
          <p>Phase 1 in progress: shared header. The home page is migrated in Phase 2.</p>
        </div>
      </section>
      {/* TEMPORARY (Phase 1 scroll testing only): empty space so the page can
          scroll past the hero. Remove when the real home page is migrated in
          Phase 2. */}
      <section className="section" aria-hidden="true" style={{ minHeight: "180vh" }} />
    </main>
  );
}
