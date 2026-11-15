import { useMemo } from "react";

const BITS = ["⭐", "✨", "🌟", "🎉", "🚀"];

// A quick shower of stars when a new passport stamp is collected.
export default function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        emoji: BITS[i % BITS.length],
        left: Math.round(Math.random() * 100),
        delay: (Math.random() * 0.5).toFixed(2),
        size: 18 + Math.round(Math.random() * 18),
      })),
    []
  );
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span key={p.id} className="confetti" style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, fontSize: p.size }}>
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
