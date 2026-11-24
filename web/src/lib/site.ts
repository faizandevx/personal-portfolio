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
  "Portfolio of Faizan Ali, a Software Engineer and IT Project Manager from Pakistan working across full-stack development and digital banking technology delivery.";
// Open Graph locale; the pages are in English (<html lang="en">).
export const OG_LOCALE = "en_US";

export const PUBLIC_EMAIL = "faizandevx@gmail.com";
export const GITHUB_PROFILE_URL = "https://github.com/faizandevx";
// Confirmed by the user on 2026-11-24 (the URL on the CV).
export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/faizan-ali-5aa430380";

// The CV PDF under web/public/ (the original file, unedited; it downloads as
// Faizan-Ali-CV.pdf). If set to null, the CV modal says the CV isn't available yet.
export const CV_FILE: string | null = "/cv/Faizan_CV.pdf";

// Indexable routes, also the source of the sitemap.
export const STATIC_ROUTES = ["/", "/about", "/projects", "/experience", "/contact", "/faq"];

// The link-preview image (app/opengraph-image.tsx). The root layout gets it
// automatically; pages list it again because a page's openGraph and twitter
// objects replace the layout's whole objects (Next.js merges metadata shallowly).
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Faizan Ali, Software Engineer & IT Project Manager",
};

// A page's title, description, canonical link, Open Graph and Twitter card. A
// profile page (About) uses the Open Graph "profile" type with the owner's name.
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  { profile = false } = {},
): Metadata {
  const openGraph = {
    siteName: SITE_NAME,
    locale: OG_LOCALE,
    title,
    description,
    url: path,
    images: [SHARE_IMAGE],
  };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: profile
      ? { ...openGraph, type: "profile", firstName: "Faizan", lastName: "Ali" }
      : { ...openGraph, type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE] },
  };
}
