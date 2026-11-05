// The V21 About page education (design-reference/about.html, #education). The
// footer's "Education" link lands here. Approved change: the section label has
// no "05 /" prefix and uses the section-label size, and the note keeps only its
// first sentence (V21 also said earlier qualifications are intentionally not shown).
export default function EducationSection() {
  return (
    <section className="section about-v18-education" id="education">
      <div className="container about-v18-education-grid">
        <div>
          <div className="eyebrow about-section-label">Education</div>
          <h2>
            Built on a strong <span className="accent">foundation.</span>
          </h2>
          <p className="section-intro">The degree most relevant to my professional work.</p>
        </div>
        <div className="about-v18-degree">
          <div className="about-v18-degree-icon" aria-hidden="true">
            ✦
          </div>
          <div>
            <span className="about-v18-degree-overline">UNIVERSITY EDUCATION</span>
            <h3>BS Software Engineering</h3>
            <p>University of Sindh, Jamshoro</p>
            <span className="about-v18-date">2020 – 2024</span>
          </div>
        </div>
      </div>
    </section>
  );
}
