// components/brand/KMonogram.tsx
// The K monogram. Inherits color via currentColor.
// Use strokeWidth from the spec (16) for digital. At very small sizes (<24px)
// some renderers benefit from strokeWidth 18-20 — see /favicon.svg.

type Props = {
  size?: number | string;
  strokeWidth?: number;
  className?: string;
  title?: string;
};

export function KMonogram({
  size = 32,
  strokeWidth = 16,
  className,
  title,
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      >
        <path d="M 30 6 L 30 94" />
        <path d="M 38 50 L 82 8" />
        <path d="M 38 50 L 82 92" />
      </g>
    </svg>
  );
}
