import Link from "next/link";

export default function Brand() {
  // The accessible name starts with the visible text ("FA Faizan Ali", WCAG 2.5.3
  // Label in Name) and keeps the home destination. The space between the two spans
  // makes the text read "FA Faizan Ali." rather than "FAFaizan Ali."; .brand is a
  // flex container, so the space is not rendered.
  return (
    <Link href="/" className="brand" aria-label="FA Faizan Ali, go to homepage">
      <span className="brand-icon">FA</span>{" "}
      <span>
        Faizan Ali<span className="accent">.</span>
      </span>
    </Link>
  );
}
