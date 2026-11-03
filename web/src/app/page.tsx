import HomeHero from "@/components/hero/HomeHero";
import AboutHomeSection from "@/components/home/AboutHomeSection";
import ExpertiseSection from "@/components/home/ExpertiseSection";
import HomeContactSection from "@/components/home/HomeContactSection";
import SelectedWorkSection from "@/components/home/SelectedWorkSection";
import SiteHeader from "@/components/layout/SiteHeader";

// Home page (design-reference/index.html). The header sits inside the hero
// section, exactly as in the reference, and the sections follow in V21 order.
export default function Home() {
  return (
    <main>
      <section className="hero-zone" data-header-hero id="hero">
        <SiteHeader variant="hero" />
        <HomeHero />
      </section>
      <AboutHomeSection />
      <SelectedWorkSection />
      <ExpertiseSection />
      <HomeContactSection />
    </main>
  );
}
