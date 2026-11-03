"use client";

// The V21 "Learn more about Faizan" link at the bottom of the home hero. It is
// a real link to #home-about (so it works without JavaScript); with JavaScript
// it scrolls the same way as V21: a small offset past the section top (5px on
// phones, 16px otherwise), instant when reduced motion is preferred.
export default function LearnMoreLink() {
  return (
    <a
      className="scroll-indicator hero-learn-more"
      href="#home-about"
      aria-label="Learn more about Faizan — scroll to next section"
      onClick={(event) => {
        const target = document.getElementById("home-about");
        if (!target) return;
        event.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const offset = window.innerWidth <= 620 ? 5 : 16;
        const y = target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top: y, behavior: reduce ? "instant" : "smooth" });
      }}
    >
      <span className="hero-down-circle" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          width="23"
          height="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 4v15m-7-7 7 7 7-7" />
        </svg>
      </span>
      <span className="hero-learn-label">Learn more about Faizan</span>
    </a>
  );
}
