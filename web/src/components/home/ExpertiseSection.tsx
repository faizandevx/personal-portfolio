import Link from "next/link";

// The V21 home "Expertise" section (design-reference/index.html, #home-skills,
// the footer's "Skills" link target). Approved Phase 2 change: the label has
// no "03 /" prefix and uses the larger home-section-label size.
const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "REST APIs",
  "Python",
  "PostgreSQL",
  "Docker",
  "Agile / Scrum",
  "Digital Banking",
  "Project Management",
];

export default function ExpertiseSection() {
  return (
    <section className="section" id="home-skills">
      <div className="container">
        <div className="eyebrow home-section-label">Expertise</div>
        <h2>
          Tools, technologies
          <br />
          and <span className="accent">experience.</span>
        </h2>
        <p className="section-intro">
          Software engineering, APIs, delivery and collaboration — brought together for practical
          outcomes.
        </p>
        <div className="chip-row">
          {skills.map((skill) => (
            <span key={skill} className="chip">
              {skill}
            </span>
          ))}
        </div>
        <Link href="/about" className="link-inline">
          More about my skills ↗
        </Link>
      </div>
    </section>
  );
}
