// The copyright year. V21 renders a fixed year and app.js replaces it with the
// current one; here a tiny inline script does that before the first paint, so
// there is no flicker and no hydration error (suppressHydrationWarning keeps
// the script's value). The footer sits in the root layout, which is never
// re-rendered by client-side navigation, so the script only needs to run on
// full page loads.
const FALLBACK_YEAR = 2026;

const script =
  "document.currentScript.previousElementSibling.textContent=String(new Date().getFullYear())";

export default function FooterYear() {
  return (
    <>
      <span className="footer-year" suppressHydrationWarning>
        {FALLBACK_YEAR}
      </span>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
