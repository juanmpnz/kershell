import Link from "next/link";
import type { CSSProperties } from "react";

type LogoProps = {
  accent?: string;
  blinkUnderscore?: boolean;
  className?: string;
  color?: string;
  href?: string;
  size?: number;
  style?: CSSProperties;
  title?: string;
  variant?: "full" | "mark";
};

export function Logo({
  accent = "var(--accent)",
  blinkUnderscore = false,
  className,
  color = "var(--text)",
  href,
  size = 24,
  style,
  title = "Kershell",
  variant = "full",
}: LogoProps) {
  const label = variant === "mark" ? "K" : "kershell";
  const content = (
    <span
      aria-label={title}
      className={className}
      role="img"
      style={{
        alignItems: "flex-end",
        display: "inline-flex",
        lineHeight: 1,
        userSelect: "none",
        ...style,
      }}
    >
      <span
        style={{
          color,
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: size,
          fontWeight: 600,
          letterSpacing: "-0.025em",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className={blinkUnderscore ? "animate-blink" : undefined}
        style={{
          background: accent,
          display: "inline-block",
          height: size * 0.08,
          marginLeft: size * 0.06,
          minHeight: 2,
          transform: `translateY(${-size * 0.04}px)`,
          width: size * 0.42,
        }}
      />
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
