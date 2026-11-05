import type { Metadata } from "next";
import AboutCtaSection from "@/components/about/AboutCtaSection";
import AboutHero from "@/components/about/AboutHero";
import ApproachSection from "@/components/about/ApproachSection";
import EducationSection from "@/components/about/EducationSection";
import JourneySection from "@/components/about/JourneySection";
import SkillsSection from "@/components/about/SkillsSection";
import StorySection from "@/components/about/StorySection";
import InsideHero from "@/components/hero/InsideHero";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata(
  "About Faizan Ali | Software Engineer & IT Project Manager",
  "Faizan Ali is a Software Engineer and IT Project Manager bringing together hands-on development and real-world technology delivery.",
  "/about",
);

// About page (design-reference/about.html).
export default function AboutPage() {
  return (
    <main id="main-content">
      <InsideHero>
        <AboutHero />
      </InsideHero>
      <StorySection />
      <JourneySection />
      <SkillsSection />
      <ApproachSection />
      <EducationSection />
      <AboutCtaSection />
    </main>
  );
}
