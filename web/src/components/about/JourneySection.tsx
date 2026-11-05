import Link from "next/link";
import { jobs } from "@/content/experience";

// The V21 About page career journey (design-reference/about.html, #journey).
// Approved change: the section label has no "02 /" prefix and uses the
// section-label size. The cards' own index labels ("02 / BANKING") are kept.
export default function JourneySection() {
  return (
    <section className="section about-v18-journey" id="journey">
      <div className="container">
        <div className="about-v18-heading-row">
          <div>
            <div className="eyebrow about-section-label">Career journey</div>
            <h2>
              Where I&apos;ve <span className="accent">grown.</span>
            </h2>
            <p className="section-intro">
              A brief overview here; the Experience page covers responsibilities and project
              details.
            </p>
          </div>
          <Link className="about-v18-text-link" href="/experience">
            Full experience <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="about-v18-journey-grid">
          {jobs.map((job) => (
            <article className="about-v18-job-card" key={job.role}>
              <div className="about-v18-job-top">
                <span className="about-v18-job-index">{job.index}</span>
                <span className="about-v18-date">{job.dates}</span>
              </div>
              <div className="about-v18-job-mark">{job.mark}</div>
              <h3>{job.role}</h3>
              <div className="about-v18-org">{job.organisation}</div>
              <p>{job.summary}</p>
              <div className="about-v18-mini-tags">
                {job.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
