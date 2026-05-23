import Link from "next/link";
import { KMonogram } from "@/components/brand/KMonogram";

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
      className={`inline-flex items-center gap-[0.32em] text-text ${className ?? ""}`}
      style={{ fontSize: size }}
    >
      <KMonogram size={size} strokeWidth={16} />
      <span
        className="font-sans font-semibold leading-none tracking-[-0.025em] text-text"
        style={{ fontSize: size }}
      >
        Kershell
      </span>
      {withCursor ? (
        <span
          aria-hidden
          className="ml-[0.1em] inline-block bg-accent"
          style={{ width: size * 0.5, height: size * 0.9 }}
        />
      ) : null}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
