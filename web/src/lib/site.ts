import type { Metadata } from "next";

// The public address of the site, used for canonical links, Open Graph, the
// sitemap and robots.txt. Set NEXT_PUBLIC_SITE_URL when the site is deployed.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);

export const SITE_NAME = "Faizan Ali";
export const SITE_TITLE = "Faizan Ali | Software Engineer & IT Project Manager";
export const SITE_DESCRIPTION =
  "Faizan Ali is a Software Engineer and IT Project Manager working across full-stack development and digital banking technology delivery.";

export const PUBLIC_EMAIL = "faizandevx@gmail.com";
export const GITHUB_PROFILE_URL = "https://github.com/faizandevx";

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
