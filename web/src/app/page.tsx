import HomeHero from "@/components/hero/HomeHero";
import AboutHomeSection from "@/components/home/AboutHomeSection";
import ExpertiseSection from "@/components/home/ExpertiseSection";
import HomeContactSection from "@/components/home/HomeContactSection";
import SelectedWorkSection from "@/components/home/SelectedWorkSection";
import SiteHeader from "@/components/layout/SiteHeader";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import { pageJsonLd } from "@/lib/structured-data";

// The title, description and share image come from the root layout. The canonical
// link is set here, not in the layout, so that it doesn't apply to the 404 page.
export const metadata = { alternates: { canonical: "/" } };

// Home page (design-reference/index.html). The header sits inside the hero
// section, exactly as in the reference, and the sections follow in V21 order.
export default function Home() {
  return (
    <>
      <main id="main-content">
        <section className="hero-zone" data-header-hero id="hero">
          <SiteHeader variant="hero" />
          <HomeHero />
        </section>
        <AboutHomeSection />
        <SelectedWorkSection />
        <ExpertiseSection />
        <HomeContactSection />
      </main>
      <JsonLd data={pageJsonLd({ path: "/", name: SITE_TITLE, description: SITE_DESCRIPTION })} />
    </>
  );
}
