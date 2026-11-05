// The V21 About page approach steps (design-reference/about.html, #approach).
// Approved change: the section label has no "04 /" prefix and uses the
// section-label size. The step numbers (01–03) are part of the step design and
// are kept.
const steps = [
  {
    number: "01",
    title: "Understand",
    text: "Start with the user need, the business context, and the actual constraints.",
  },
  {
    number: "02",
    title: "Build & collaborate",
    text: "Keep communication clear while working through technical and delivery details.",
  },
  {
    number: "03",
    title: "Validate & improve",
    text: "Test outcomes, learn from feedback, and strengthen reliability over time.",
  },
];

export default function ApproachSection() {
  return (
    <section className="section about-v18-approach" id="approach">
      <div className="container">
        <div className="eyebrow about-section-label">My approach</div>
        <h2>
          How I approach <span className="accent">the work.</span>
        </h2>
        <div className="about-v18-steps">
          {steps.map((step) => (
            <div className="about-v18-step" key={step.number}>
              <span className="about-v18-step-no">{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
