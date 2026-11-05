import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import InsideHero from "@/components/hero/InsideHero";
import { findProject, projects } from "@/content/projects";
import { pageMetadata } from "@/lib/site";

// The page reads its slug from the URL, so navigation to it waits for the page
// rather than showing a placeholder. The known slugs are prerendered below.
export const instant = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return {};
  return pageMetadata(`${project.title} | Faizan Ali`, project.summary, `/projects/${slug}`);
}

// A project case study (design-reference/project-detail.html). The V21 screenshot
// panel is left out until real screenshots exist.
export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const details = [
    { number: "01", title: "Overview", text: project.overview },
    { number: "02", title: "Architecture", text: project.architecture },
    { number: "03", title: "Results", text: project.results },
  ];

  return (
    <main id="main-content">
      <InsideHero>
        <div className="container">
          <div className="eyebrow page-section-label">Case study</div>
          <h1>
            {project.titleLead} <span className="accent">{project.titleAccent}</span>
          </h1>
          <p>{project.intro}</p>
        </div>
      </InsideHero>
      <section className="section page-content">
        <div className="container">
          <div className="eyebrow page-section-label">Project details</div>
          <h2>From challenge to solution.</h2>
          <div className="info-grid">
            {details.map((detail) => (
              <div className="info-card" key={detail.number}>
                <div className="eyebrow">{detail.number}</div>
                <h3>{detail.title}</h3>
                <p>{detail.text}</p>
              </div>
            ))}
          </div>
          <div className="project-actions">
            <Link href="/projects" className="btn btn-secondary">
              ← Back to Projects
            </Link>
            <a
              href={project.repositoryUrl}
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
