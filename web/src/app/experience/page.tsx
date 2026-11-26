import InsideHero from "@/components/hero/InsideHero";
import CvTrigger from "@/components/layout/CvTrigger";
import EmployerLink from "@/components/ui/EmployerLink";
import { jobs } from "@/content/experience";
import JsonLd from "@/components/seo/JsonLd";
import { CV_FILE, pageMetadata } from "@/lib/site";
import { pageJsonLd } from "@/lib/structured-data";

const title = "Experience | Faizan Ali, Software Developer & IT Project Manager";
const description =
  "Faizan Ali's professional experience as an IT Project Manager in digital banking at Aman Bank, and as a Software Developer at AlphaSoft360.";

export const metadata = pageMetadata(title, description, "/experience");

// Experience page (design-reference/experience.html). "AlphaSoft360" replaces V21's
// "AlphaSoft K60". Approved 2026-11-25: the employer names link to their websites,
// and "View CV" opens the PDF in a new tab next to V21's "Download CV".
export default function ExperiencePage() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          path: "/experience",
          name: title,
          description,
          type: "WebPage",
          trail: [["Experience", "/experience"]],
        })}
      />
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
                    {/* One text node, as in V21: split text lays out half a pixel differently. */}
                    {`${job.role} · `}
                    <EmployerLink employer={job.employerLink}>{job.employer}</EmployerLink>
                  </h3>
                  <p>{job.timelineSummary}</p>
                </article>
              ))}
            </div>
            <div className="project-actions experience-cv-actions">
              {CV_FILE && (
                <a
                  className="btn btn-primary"
                  href={CV_FILE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View CV <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (PDF, opens in a new tab)</span>
                </a>
              )}
              <CvTrigger className="btn btn-secondary cv-trigger">↓ Download CV</CvTrigger>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
