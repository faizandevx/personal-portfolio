import type { Metadata } from "next";
import "./globals.css";

// Phase 0 placeholder shell. Phase 1 replaces this with the approved V21 frame
// (theme script, header, footer, CV modal).
export const metadata: Metadata = {
  title: "Faizan Ali | Software Engineer & IT Project Manager",
  description: "Faizan Ali — Software Engineer & IT Project Manager.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
