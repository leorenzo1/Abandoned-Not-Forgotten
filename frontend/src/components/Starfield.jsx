import { useEffect, useRef } from "react";

const COLORS = [
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#e0f2fe",
  "#bae6fd",
  "#cffafe",
  "#fef3c7",
];

export default function Starfield({ count = 1200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let raf;
    let lastTime = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Create stable, tranquil star particles
    const initStar = (s, randomY = true) => {
      s.x = Math.random() * w;
      s.y = randomY ? Math.random() * h : -5;
      s.size = 0.6 + Math.random() * 1.4;
      s.baseAlpha = 0.25 + Math.random() * 0.7;
      s.speed = 4 + Math.random() * 10; // Gentle serene cosmic drift (pixels per second)
      s.driftX = (Math.random() - 0.5) * 3;
      s.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      s.twinklePhase = Math.random() * Math.PI * 2;
      s.twinkleSpeed = 0.8 + Math.random() * 1.8;
    };

    const stars = Array.from({ length: count }, () => {
      const s = {};
      initStar(s, true);
      return s;
    });

    const draw = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05) || 0.016;
      lastTime = currentTime;

      ctx.clearRect(0, 0, w, h);

      // Deep rich space background
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Smooth gentle floating drift
        s.y += s.speed * dt;
        s.x += s.driftX * dt;

        // Wrap around seamlessly
        if (s.y > h + 10) {
          initStar(s, false);
          continue;
        }
        if (s.x < -10) s.x = w + 10;
        if (s.x > w + 10) s.x = -10;

        // Gentle cosmic twinkle
        const pulse = 0.5 + 0.5 * Math.sin(currentTime * 0.002 * s.twinkleSpeed + s.twinklePhase);
        const alpha = s.baseAlpha * (0.6 + 0.4 * pulse);

        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.12, Math.min(1, alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 h-full w-full bg-black pointer-events-none" />;
}
