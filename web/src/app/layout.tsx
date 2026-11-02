import type { Metadata } from "next";
import SiteHeader from "@/components/layout/SiteHeader";
import ThemeScript from "@/components/layout/ThemeScript";
import { MenuProvider } from "@/context/MenuContext";
import { ScrollNavProvider } from "@/context/ScrollNavContext";
import "./globals.css";

// Root layout. The footer and CV modal of the V21 frame are added in later
// Phase 1 steps.
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
          <ScrollNavProvider>
            {/* Each page renders <main> with its hero section and hero header. */}
            {children}
            {/* Shown only after the hero has passed; same position as in V21. */}
            <SiteHeader variant="floating" />
          </ScrollNavProvider>
        </MenuProvider>
      </body>
    </html>
  );
}
