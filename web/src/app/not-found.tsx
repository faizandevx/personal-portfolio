import type { Metadata } from "next";
import Link from "next/link";
import InsideHero from "@/components/hero/InsideHero";

export const metadata: Metadata = {
  title: "Page not found | Faizan Ali",
  robots: { index: false },
};

// The site's 404 page, built from the V21 inner-page hero.
export default function NotFound() {
  return (
    <main id="main-content">
      <InsideHero>
        <div className="container">
          <div className="eyebrow page-section-label">Page not found</div>
          <h1>
            This page <span className="accent">doesn&apos;t exist.</span>
          </h1>
          <p>The link may be out of date, or the page may have moved.</p>
          <div className="actions">
            <Link href="/" className="btn btn-primary">
              Back to home <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/projects" className="btn btn-secondary">
              View projects
            </Link>
          </div>
        </div>
      </InsideHero>
    </main>
  );
}
