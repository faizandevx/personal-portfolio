import type { Metadata } from "next";

// The public address of the site, used for canonical links, Open Graph, the
// sitemap and robots.txt. In order:
// 1. NEXT_PUBLIC_SITE_URL, set in Vercel once the final address is known;
// 2. on Vercel, the project's production address (VERCEL_PROJECT_PRODUCTION_URL, a
//    host name with no protocol), so even the first deployment and previews never
//    point to localhost;
// 3. locally, http://localhost:3000.
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelProductionUrl ? `https://${vercelProductionUrl}` : "http://localhost:3000")
).replace(/\/+$/, "");

export const SITE_NAME = "Faizan Ali";
export const SITE_TITLE = "Faizan Ali | Software Engineer & IT Project Manager";
export const SITE_DESCRIPTION =
  "Faizan Ali is a Software Engineer and IT Project Manager working across full-stack development and digital banking technology delivery.";

export const PUBLIC_EMAIL = "faizandevx@gmail.com";
export const GITHUB_PROFILE_URL = "https://github.com/faizandevx";
// Confirmed by the user on 2026-11-24 (the URL on the CV).
export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/faizan-ali-5aa430380";

// The CV PDF under web/public/ (the original file, unedited; it downloads as
// Faizan-Ali-CV.pdf). If set to null, the CV modal says the CV isn't available yet.
export const CV_FILE: string | null = "/cv/Faizan_CV.pdf";

// Indexable routes, also the source of the sitemap.
export const STATIC_ROUTES = ["/", "/about", "/projects", "/experience", "/contact", "/faq"];

// A page's title, description, canonical link and Open Graph text.
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { title, description },
  };
}
