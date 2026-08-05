import type { ReactNode } from 'react';

export function HudFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`hud-frame ${className}`}>
      <span className="hud-corner hud-corner--tl" aria-hidden="true" />
      <span className="hud-corner hud-corner--tr" aria-hidden="true" />
      <span className="hud-corner hud-corner--bl" aria-hidden="true" />
      <span className="hud-corner hud-corner--br" aria-hidden="true" />
      {children}
    </div>
  );
}
