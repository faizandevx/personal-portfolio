import Link from "next/link";
import type { Project } from "@/content/projects";

// The V21 wide project card (design-reference/projects.html). With a single
// showcased project it spans the full grid width (.bento-grid-single).
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="bento-card wide">
      <div className="eyebrow">{project.type}</div>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="card-illustration" aria-hidden="true">
        ⌘
      </div>
      <span className="card-arrow">↗</span>
    </Link>
  );
}
