import type { Metadata } from "next";
import AboutCtaSection from "@/components/about/AboutCtaSection";
import AboutHero from "@/components/about/AboutHero";
import ApproachSection from "@/components/about/ApproachSection";
import EducationSection from "@/components/about/EducationSection";
import JourneySection from "@/components/about/JourneySection";
import SkillsSection from "@/components/about/SkillsSection";
import StorySection from "@/components/about/StorySection";
import InsideHero from "@/components/hero/InsideHero";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/site";
import { pageJsonLd, profileEntity } from "@/lib/structured-data";

const title = "About Faizan Ali | Software Engineer & IT Project Manager";
const description =
  "About Faizan Ali, a Software Engineer and IT Project Manager from Pakistan bringing together hands-on full-stack development and real-world technology delivery.";

export const metadata: Metadata = pageMetadata(title, description, "/about", { profile: true });

// About page (design-reference/about.html).
export default function AboutPage() {
  return (
    <>
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
      <JsonLd
        data={pageJsonLd({
          path: "/about",
          name: title,
          description,
          type: "ProfilePage",
          trail: [["About", "/about"]],
          mainEntity: profileEntity,
        })}
      />
    </>
  );
}
