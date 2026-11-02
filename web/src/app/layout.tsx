import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import SiteHeader from "@/components/layout/SiteHeader";
import ThemeScript from "@/components/layout/ThemeScript";
import CvModal from "@/components/modals/CvModal";
import { CvModalProvider } from "@/context/CvModalContext";
import { MenuProvider } from "@/context/MenuContext";
import { ScrollNavProvider } from "@/context/ScrollNavContext";
import "./globals.css";

// Root layout: the shared V21 frame around every page (hero/floating header,
// CV modal, footer), in the same order as design-reference/*.html.
export const metadata: Metadata = {
  title: "Faizan Ali | Software Engineer & IT Project Manager",
  description: "Faizan Ali — Software Engineer & IT Project Manager.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme="dark" is the V21 default. ThemeScript may switch it to the
    // saved theme before React hydrates, so the server and client values can
    // differ; suppressHydrationWarning tells React that is expected.
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
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
