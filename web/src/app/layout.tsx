import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import SiteHeader from "@/components/layout/SiteHeader";
import ThemeScript from "@/components/layout/ThemeScript";
import CvModal from "@/components/modals/CvModal";
import { CvModalProvider } from "@/context/CvModalContext";
import { MenuProvider } from "@/context/MenuContext";
import { ScrollNavProvider } from "@/context/ScrollNavContext";
import JsonLd from "@/components/seo/JsonLd";
import { OG_LOCALE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { siteJsonLd } from "@/lib/structured-data";
import "./globals.css";

// Root layout: the shared V21 frame around every page (hero/floating header,
// CV modal, footer), in the same order as design-reference/*.html.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: OG_LOCALE,
    title: SITE_TITLE,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE },
  // Google Search Console ownership (URL-prefix property https://faizanalidevx.vercel.app/).
  verification: { google: "ewlAElIboOKoLmjZwBuEctmQfRBosD2B7e0VC8DayYE" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme="dark" is the V21 default. ThemeScript may switch it to the
    // saved theme before React hydrates, so the server and client values can
    // differ; suppressHydrationWarning tells React that is expected.
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
        {/* Who the site is about, and the site itself (lib/structured-data.ts). */}
        <JsonLd data={siteJsonLd} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <MenuProvider>
          <CvModalProvider>
            <ScrollNavProvider>
              {/* Each page renders <main> with its hero section and hero header. */}
              {children}
              {/* Shown only after the hero has passed; same position as in V21. */}
              <SiteHeader variant="floating" />
              <CvModal />
              <Footer />
            </ScrollNavProvider>
          </CvModalProvider>
        </MenuProvider>
      </body>
    </html>
  );
}
