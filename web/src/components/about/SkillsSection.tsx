// The V21 About page capabilities (design-reference/about.html, #skills).
// Approved change: the section label has no "03 /" prefix and uses the
// section-label size.
const skillCards = [
  {
    mark: "{ }",
    title: "Frontend development",
    summary: "Interfaces, components and responsive web applications.",
    pills: ["React", "Next.js", "JavaScript", "TypeScript", "HTML / CSS"],
  },
  {
    mark: "⌘",
    title: "Backend & data",
    summary: "Application services, business logic and databases.",
    pills: ["Node.js", "Express", "Python", "MySQL", "MongoDB"],
  },
  {
    mark: "↗",
    title: "Delivery & collaboration",
    summary: "Helping teams turn complex requirements into practical outcomes.",
    pills: ["Agile / Scrum", "UAT coordination", "Stakeholders", "Vendors", "Git / Docker"],
  },
];

export default function SkillsSection() {
  return (
    <section className="section about-v18-skills" id="skills">
      <div className="container">
        <div className="eyebrow about-section-label">Capabilities</div>
        <h2>
          Tools I work with<span className="accent">.</span>
        </h2>
        <p className="section-intro">
          A practical mix of development technologies and technology-delivery experience. This is a
          working toolkit, not a list of claimed expert certifications.
        </p>
        <div className="about-v18-skills-grid">
          {skillCards.map((card) => (
            <article className="about-v18-skill-card" key={card.title}>
              <span className="about-v18-category-mark">{card.mark}</span>
              <h3>{card.title}</h3>
              <p>{card.summary}</p>
              <div className="about-v18-pills">
                {card.pills.map((pill) => (
                  <span key={pill}>{pill}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
