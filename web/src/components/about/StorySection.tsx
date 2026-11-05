import Link from "next/link";
import EmployerLink from "@/components/ui/EmployerLink";

// The V21 About page story and "At a glance" card (design-reference/about.html,
// #my-story). Approved changes: "AlphaSoft360" (V21: "AlphaSoft K60"), and the two
// employer names in the story link to their websites.
export default function StorySection() {
  return (
    <section className="section about-v18-story" id="my-story">
      <div className="container about-v18-story-grid">
        <div className="about-v18-prose">
          <div className="eyebrow">The introduction</div>
          <h2>
            A little more <span className="accent">about me.</span>
          </h2>
          <p>
            My career began in software development, where I learned to approach problems through
            code, thoughtful design, and practical solutions. That technical foundation later shaped
            how I approached the delivery of banking technology projects.
          </p>
          <p>
            At{" "}
            <strong>
              <EmployerLink employer="alphasoft360" />
            </strong>
            , I worked as a Software Developer. I then moved into an{" "}
            <strong>IT Project Manager</strong> role at{" "}
            <strong>
              <EmployerLink employer="amanBank">
                Aman Bank for Commerce &amp; Investment
              </EmployerLink>
            </strong>
            , collaborating with technical teams, stakeholders, and vendors on digital banking
            initiatives.
          </p>
          <p>
            What I enjoy most is connecting the details of engineering with the bigger picture:
            understanding the problem, aligning people, and helping teams deliver technology that
            makes sense for its users.
          </p>
          <Link href="/experience" className="about-v18-text-link">
            <span>View my professional experience</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <aside className="about-v18-identity">
          <div className="about-v18-identity-top">
            <span className="eyebrow">AT A GLANCE</span>
            <span className="about-v18-spark">✳</span>
          </div>
          <h3>
            Two perspectives.
            <br />
            <span className="accent">One approach.</span>
          </h3>
          <p>Hands-on software engineering meets structured technical project delivery.</p>
          <div className="about-v18-role-list">
            <div>
              <span className="about-v18-role-icon">01</span>
              <div>
                <strong>Software Engineering</strong>
                <small>Building and understanding digital solutions</small>
              </div>
            </div>
            <div>
              <span className="about-v18-role-icon">02</span>
              <div>
                <strong>IT Project Management</strong>
                <small>Coordinating people, priorities and delivery</small>
              </div>
            </div>
            <div>
              <span className="about-v18-role-icon">03</span>
              <div>
                <strong>Digital Banking</strong>
                <small>Working across technology-led initiatives</small>
              </div>
            </div>
          </div>
          <div className="about-v18-identity-note">
            <span className="about-v18-green-dot"></span> Pakistan · Open to international
            collaboration
          </div>
        </aside>
      </div>
    </section>
  );
}
