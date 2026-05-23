"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";

type RevealProps = {
  children: ReactNode;
  as?: "div" | "article";
  className?: string;
  delay?: number;
};

export default function Reveal({
  children,
  as: Component = "div",
  className,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  return (
    <Component
      ref={(node) => {
        ref.current = node;
      }}
      style={style}
      className={[
        "transition-[opacity,transform] duration-[400ms] ease-out-quint motion-reduce:transform-none motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100 delay-[var(--reveal-delay)]"
          : "translate-y-5 opacity-0",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </Component>
  );
}
