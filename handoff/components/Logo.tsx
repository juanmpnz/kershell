// components/brand/Logo.tsx
import Link from 'next/link';
import { KMonogram } from './KMonogram';

type Props = {
  size?: number;     // wordmark font size in px; mark scales with it
  withCursor?: boolean; // append the lime cursor block (Console mark)
  href?: string;
  className?: string;
};

export function Logo({
  size = 22,
  withCursor = false,
  href = '/',
  className,
}: Props) {
  const content = (
    <span
      className={`inline-flex items-center gap-[0.32em] text-text ${className ?? ''}`}
      style={{ fontSize: size }}
    >
      <KMonogram size={size * 1.0} strokeWidth={16} />
      <span
        className="font-sans font-semibold leading-none tracking-[-0.025em] text-text"
        style={{ fontSize: size }}
      >
        Kershell
      </span>
      {withCursor && (
        <span
          aria-hidden
          className="bg-accent inline-block ml-[0.1em]"
          style={{ width: size * 0.5, height: size * 0.9 }}
        />
      )}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
