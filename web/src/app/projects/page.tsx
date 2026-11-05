import InsideHero from "@/components/hero/InsideHero";
import ProjectCard from "@/components/projects/ProjectCard";
import { projects } from "@/content/projects";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Projects | Faizan Ali",
  "Selected work by Faizan Ali, including how it was designed, built and tested.",
  "/projects",
);

// Projects page (design-reference/projects.html), with visitor-facing wording.
export default function ProjectsPage() {
  return (
    <main id="main-content">
      <InsideHero>
        <div className="container">
          <div className="eyebrow page-section-label">Portfolio / Projects</div>
          <h1>
            Selected <span className="accent">work.</span>
          </h1>
          <p>A selection of my publicly shareable work.</p>
        </div>
      </InsideHero>
      <section className="section page-content">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow page-section-label">Case studies</div>
              <h2>Explore the process.</h2>
              <p className="section-intro">
                A closer look at how this portfolio was designed, built and tested.
              </p>
            </div>
          </div>
          <div className="bento-grid bento-grid-single">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
