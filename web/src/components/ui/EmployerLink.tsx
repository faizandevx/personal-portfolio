// A link to a former employer's public website (approved: homepage About and the
// About page story). It keeps the surrounding bold text colour, turns orange on
// hover and keyboard focus (.about-company-link in approved-changes.css), opens in
// a new tab, and tells screen-reader users so.
const EMPLOYERS = {
  alphasoft360: { href: "https://www.alphasoft360.com/", name: "AlphaSoft360" },
  amanBank: { href: "https://www.aman-bank.com/", name: "Aman Bank" },
} as const;

type EmployerLinkProps = {
  employer: keyof typeof EMPLOYERS;
  // The visible name, e.g. "Aman Bank for Commerce & Investment"; defaults to the short name.
  children?: React.ReactNode;
};

export default function EmployerLink({ employer, children }: EmployerLinkProps) {
  const { href, name } = EMPLOYERS[employer];
  return (
    <a className="about-company-link" href={href} target="_blank" rel="noopener noreferrer">
      {children ?? name}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
