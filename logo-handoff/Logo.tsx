// logo-handoff/Logo.tsx
// Kershell — logotipo oficial "underline signature" (kershell_)
// Wordmark Geist 600 + underscore lima. Reemplaza KLockup / KLockupTile.
//
// Adaptá el import de tokens a tu repo. Asume tokens CSS:
//   --ink #0A0B0D · --text #ECEEF0 · --accent #B4F23F
//
// Uso:
//   <Logo />                      → kershell_ a 24px (default header)
//   <Logo size={36} />            → más grande (login, hero chico)
//   <Logo variant="mark" />       → K_ (sidebar colapsada, espacios chicos)
//   <Logo color="var(--ink)" accent="var(--ink)" />  → sobre fondo lima

import type { CSSProperties } from 'react';

type Props = {
  /** Cap-height aproximada del wordmark en px. Default 24. */
  size?: number;
  /** 'full' = kershell_  ·  'mark' = K_  (default 'full') */
  variant?: 'full' | 'mark';
  /** Color del wordmark. Default var(--text). */
  color?: string;
  /** Color del underscore. Default var(--accent). */
  accent?: string;
  className?: string;
  style?: CSSProperties;
  /** Accesibilidad — texto del aria-label. Default "Kershell". */
  title?: string;
};

export function Logo({
  size = 24,
  variant = 'full',
  color = 'var(--text)',
  accent = 'var(--accent)',
  className,
  style,
  title = 'Kershell',
}: Props) {
  const label = variant === 'mark' ? 'K' : 'kershell';

  return (
    <span
      role="img"
      aria-label={title}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        lineHeight: 1,
        userSelect: 'none',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "'Geist', system-ui, sans-serif",
          fontSize: size,
          fontWeight: 600,
          letterSpacing: '-0.025em',
          color,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      {/* underscore lima — bloque sólido, no glifo, para control de grosor */}
      <span
        aria-hidden="true"
        style={{
          width: size * 0.42,
          height: size * 0.08,
          minHeight: 2,
          background: accent,
          display: 'inline-block',
          marginLeft: size * 0.06,
          // se apoya en la baseline, ligeramente levantado
          transform: `translateY(${-size * 0.04}px)`,
        }}
      />
    </span>
  );
}
