// Publicly showcased projects. Every statement here is verified against this
// repository. Do not add projects or details that have not been approved.
export type Project = {
  slug: string;
  type: string; // card label
  title: string;
  titleLead: string; // case-study heading, before the accent
  titleAccent: string;
  summary: string;
  intro: string;
  overview: string;
  architecture: string;
  results: string;
  repositoryUrl: string;
};

export const projects: Project[] = [
  {
    slug: "personal-portfolio",
    type: "Web project",
    title: "Personal Portfolio",
    titleLead: "Personal",
    titleAccent: "Portfolio.",
    summary:
      "A responsive Next.js portfolio with dark and light themes, accessible navigation and automated visual regression testing.",
    intro: "The design and engineering behind this website.",
    overview:
      "A personal portfolio migrated from an approved static design to Next.js, one phase at a time, while preserving the original look.",
    architecture:
      "Next.js App Router, React and strict TypeScript, using the original stylesheet alongside Tailwind CSS.",
    results:
      "Pages are compared with the approved design in both themes across eight screen widths, and tested for keyboard use and WCAG 2.1 AA issues with automated checks.",
    repositoryUrl: "https://github.com/faizandevx/personal-portfolio",
  },
];

export const findProject = (slug: string) => projects.find((project) => project.slug === slug);
