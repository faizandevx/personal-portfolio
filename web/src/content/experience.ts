// Professional experience, as shown on the About page career cards (V21
// design-reference/about.html). The Experience page will reuse this data.
export type Job = {
  index: string; // card label, e.g. "02 / BANKING"
  dates: string;
  mark: string; // decorative card symbol
  role: string;
  organisation: string;
  summary: string;
  tags: string[];
};

export const jobs: Job[] = [
  {
    index: "02 / BANKING",
    dates: "Jan – Oct 2026",
    mark: "↗",
    role: "IT Project Manager",
    organisation: "Aman Bank for Commerce & Investment",
    summary:
      "Coordinated digital banking technology projects across stakeholders, development teams and external vendors, with a focus on planning, testing and delivery.",
    tags: ["Digital banking", "Project delivery", "Cross-functional work"],
  },
  {
    index: "01 / ENGINEERING",
    dates: "Mar – Dec 2025",
    mark: "⌘",
    role: "Software Developer",
    organisation: "AlphaSoft360",
    summary:
      "Developed practical application features while strengthening my software engineering, debugging and development workflow foundations.",
    tags: ["Application development", "Problem solving", "Engineering"],
  },
];
