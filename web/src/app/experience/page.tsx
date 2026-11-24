import InsideHero from "@/components/hero/InsideHero";
import CvTrigger from "@/components/layout/CvTrigger";
import { jobs } from "@/content/experience";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/site";
import { pageJsonLd } from "@/lib/structured-data";

const title = "Experience | Faizan Ali, Software Developer & IT Project Manager";
const description =
  "Faizan Ali's professional experience as an IT Project Manager in digital banking at Aman Bank, and as a Software Developer at AlphaSoft360.";

export const metadata = pageMetadata(title, description, "/experience");

// Experience page (design-reference/experience.html). Employer names stay plain
// text, as in V21; "AlphaSoft360" replaces V21's "AlphaSoft K60".
export default function ExperiencePage() {
  return (
    <>
      <main id="main-content">
        <InsideHero>
          <div className="container">
            <div className="eyebrow page-section-label">Professional experience</div>
            <h1>
              The work behind <span className="accent">the experience.</span>
            </h1>
            <p>A timeline of my professional roles and the scope of my work.</p>
          </div>
        </InsideHero>
        <section className="section page-content">
          <div className="container">
            <div className="eyebrow page-section-label">Career timeline</div>
            <h2>Engineering and leadership.</h2>
            <div className="timeline">
              {jobs.map((job) => (
                <article className="timeline-item" key={job.role}>
                  <div className="time">{job.timelineDates}</div>
                  <h3>
                    {job.role} · {job.employer}
                  </h3>
                  <p>{job.timelineSummary}</p>
                </article>
              ))}
            </div>
            <CvTrigger className="btn btn-secondary cv-trigger">↓ Download CV</CvTrigger>
          </div>
        </section>
      </main>
      <JsonLd
        data={pageJsonLd({
          path: "/experience",
          name: title,
          description,
          type: "WebPage",
          trail: [["Experience", "/experience"]],
        })}
      />
    </>
  );
}
