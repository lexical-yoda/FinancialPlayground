import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';

interface Props {
  value: number;
  format: (n: number) => string;
  className?: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AnimatedNumber({ value, format, className }: Props) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;

    if (prefersReducedMotion() || from === value) {
      setDisplay(value);
      return;
    }

    const controls = animate(from, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{format(display)}</span>;
}
