import Link from "next/link";

type LogoProps = {
  size?: number;
  withCursor?: boolean;
  href?: string;
  className?: string;
};

export function Logo({
  size = 22,
  withCursor = false,
  href = "/",
  className,
}: LogoProps) {
  const content = (
    <span
      className={`inline-flex items-center gap-[0.04em] text-text ${className ?? ""}`}
      style={{ fontSize: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="22 6 96 88"
        width={size * 1.1}
        height={size}
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <g stroke="currentColor" strokeWidth="16" strokeLinecap="butt" strokeLinejoin="miter">
          <path d="M 30 6 L 30 94" />
          <path d="M 38 50 L 82 8" />
          <path d="M 38 50 L 82 92" />
        </g>
        <rect x="98" y="76" width="18" height="18" fill="var(--accent)" />
      </svg>
      <span
        className="font-sans font-semibold leading-none tracking-[-0.025em] text-text"
        style={{ fontSize: size }}
      >
        ershell
      </span>
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
