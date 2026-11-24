import { faqs } from "@/content/faq";
import type { Project } from "@/content/projects";
import {
  GITHUB_PROFILE_URL,
  LINKEDIN_PROFILE_URL,
  PUBLIC_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

// Schema.org JSON-LD for search engines. Public, visible details only: no ratings,
// awards, credentials or employment details beyond what the pages show.
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const absolute = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/images/faizan-ali-hero.png`,
  jobTitle: "Software Engineer & IT Project Manager",
  description: SITE_DESCRIPTION,
  email: `mailto:${PUBLIC_EMAIL}`,
  address: { "@type": "PostalAddress", addressCountry: "PK" },
  // From the FAQ and the About/Experience pages.
  knowsAbout: [
    "Full-stack development",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "REST APIs",
    "IT project management",
    "Digital banking",
  ],
  sameAs: [GITHUB_PROFILE_URL, LINKEDIN_PROFILE_URL],
};

// Every page (root layout): the site's owner and the site itself.
export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    person,
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": PERSON_ID },
    },
  ],
};

type PageSchema = {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "ProfilePage" | "CollectionPage" | "ContactPage" | "FAQPage";
  // Breadcrumb trail after Home, e.g. [["Projects", "/projects"]].
  trail?: [string, string][];
  mainEntity?: object;
};

// One page: its WebPage node and, below the home page, its breadcrumb trail.
export function pageJsonLd({
  path,
  name,
  description,
  type = "WebPage",
  trail = [],
  mainEntity,
}: PageSchema) {
  const url = absolute(path);
  const crumbs: [string, string][] = trail.length ? [["Home", "/"], ...trail] : [];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": type,
        "@id": `${url}#webpage`,
        url,
        name,
        description,
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": PERSON_ID },
        ...(mainEntity && { mainEntity }),
        ...(crumbs.length && { breadcrumb: { "@id": `${url}#breadcrumb` } }),
      },
      ...(crumbs.length
        ? [
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: crumbs.map(([itemName, itemPath], i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: itemName,
                item: absolute(itemPath),
              })),
            },
          ]
        : []),
    ],
  };
}

// The About page is a profile page about the site's owner.
export const profileEntity = person;

// The FAQ page's questions and answers, exactly as shown.
export const faqEntities = faqs.map((faq) => ({
  "@type": "Question",
  name: faq.question,
  acceptedAnswer: { "@type": "Answer", text: faq.answer },
}));

// A case study's subject: the project's public source code.
export const projectEntity = (project: Project) => ({
  "@type": "SoftwareSourceCode",
  name: project.title,
  description: project.summary,
  codeRepository: project.repositoryUrl,
  programmingLanguage: "TypeScript",
  author: { "@id": PERSON_ID },
});
