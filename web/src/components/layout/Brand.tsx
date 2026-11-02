import Link from "next/link";

export default function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Faizan Ali home">
      <span className="brand-icon">FA</span>

      <span>
        Faizan Ali<span className="accent">.</span>
      </span>
    </Link>
  );
}
