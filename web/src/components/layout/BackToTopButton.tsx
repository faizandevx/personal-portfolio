"use client";

// Smoothly scrolls to the top, or jumps instantly when the visitor prefers
// reduced motion, as in design-reference/app.js.
export default function BackToTopButton() {
  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  };

  return (
    <button
      className="footer-backtop footer-reference-top"
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
    >
      <span>Back to top</span>
      <span className="footer-top-arrow" aria-hidden="true">
        ↑
      </span>
    </button>
  );
}
