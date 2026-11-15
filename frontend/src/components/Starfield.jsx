import { useEffect, useRef } from "react";

const COLORS = [
  { r: 255, g: 255, b: 255, hex: "#ffffff" },
  { r: 255, g: 255, b: 255, hex: "#ffffff" },
  { r: 224, g: 242, b: 254, hex: "#e0f2fe" },
  { r: 186, g: 230, b: 253, hex: "#bae6fd" },
  { r: 207, g: 250, b: 254, hex: "#cffafe" },
  { r: 254, g: 243, b: 199, hex: "#fef3c7" },
];

const MAX_Z = 1200;
const FOV = 650;

/**
 * 3D Warp Hyperdrive Starfield inspired by 1114.mp4.
 * - Idle / Default: Serene 3D cosmic starfield with tranquil vertical drift and natural twinkling.
 * - Tab Navigation (Home/Timeline -> Exploration):
 *     - Centered forward 3D hyperspace jump accelerating into the cosmos.
 * - Planetary Navigation:
 *     - Moon -> Mars: Radial 3D warp tunnel streaming dynamically to the RIGHT.
 *     - Mars -> Moon: Radial 3D warp tunnel streaming in the REVERSE direction to the LEFT.
 */
export default function Starfield({ count = 950, travelEvent = null }) {
  const canvasRef = useRef(null);
  const travelRef = useRef(null);

  // Trigger 3D travelling warp transition when a planet switch or view entry occurs
  useEffect(() => {
    if (!travelEvent || !travelEvent.direction) return;

    travelRef.current = {
      direction: travelEvent.direction, // "right" | "left" | "forward"
      startTime: performance.now(),
      duration: travelEvent.direction === "forward" ? 1700 : 1800,
    };
  }, [travelEvent]);

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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Initialize stars in 3D coordinate volume
    const initStar = (s, randomZ = true) => {
      s.x = (Math.random() - 0.5) * (w * 1.8);
      s.y = (Math.random() - 0.5) * (h * 1.8);
      s.z = randomZ ? 40 + Math.random() * (MAX_Z - 40) : MAX_Z + Math.random() * 50;

      s.speedY = 3.5 + Math.random() * 7; // Gentle default drift
      s.driftX = (Math.random() - 0.5) * 2;

      const pal = COLORS[Math.floor(Math.random() * COLORS.length)];
      s.r = pal.r;
      s.g = pal.g;
      s.b = pal.b;
      s.hex = pal.hex;

      s.twinklePhase = Math.random() * Math.PI * 2;
      s.twinkleSpeed = 0.8 + Math.random() * 1.8;
      s.isBright = Math.random() > 0.8;
    };

    const stars = Array.from({ length: count }, () => {
      const s = {};
      initStar(s, true);
      return s;
    });

    const draw = (currentTime) => {
      try {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.05) || 0.016;
        lastTime = currentTime;

        // Calculate 3D warp transition kinematics
        let surge = 0;
        let direction = "none";

        if (travelRef.current) {
          const now = performance.now();
          const elapsed = now - travelRef.current.startTime;
          const rawProgress = elapsed / travelRef.current.duration;

          if (rawProgress >= 1) {
            travelRef.current = null;
          } else if (rawProgress > 0) {
            const progress = Math.max(0, Math.min(1, rawProgress));
            direction = travelRef.current.direction;
            // Bell curve surge (rises quickly, cruises at peak, decelerates smoothly)
            const sinVal = Math.max(0, Math.sin(progress * Math.PI));
            surge = Math.pow(sinVal, 1.5);
          }
        }

        // Kinematics and vanishing point offset based on direction:
        // - "forward": centered jump into Exploration view (from Home or Timeline)
        // - "right": Moon -> Mars (vanishing point far left, stars sweep to the right)
        // - "left": Mars -> Moon (vanishing point far right, stars sweep to the left)
        let dirSign = 0;
        let originRatio = 0.5;

        if (direction === "right") {
          dirSign = 1;
          originRatio = 0.5 - 0.38 * surge; // shifts origin to ~0.12
        } else if (direction === "left") {
          dirSign = -1;
          originRatio = 0.5 + 0.38 * surge; // shifts origin to ~0.88
        } else if (direction === "forward") {
          dirSign = 0;
          originRatio = 0.5; // centered
        }

        const vz = (direction === "forward" ? 1650 : 1350) * surge;
        const vx = 850 * surge * dirSign;
        const trailDt = 0.03 + 0.11 * surge;

        const targetOriginX = w * originRatio;
        const originY = h * 0.5;

        ctx.clearRect(0, 0, w, h);

        // Deep cosmic void background
        ctx.fillStyle = "#02040a";
        ctx.fillRect(0, 0, w, h);

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];

          // 3D Motion update
          s.z -= vz * dt;
          s.x += (s.driftX + vx) * dt;
          s.y += s.speedY * dt;

          // Wrap Z when star flies past camera
          if (s.z < 25) {
            s.z = MAX_Z + Math.random() * 40;
            s.x = (Math.random() - 0.5) * (w * 1.8);
            s.y = (Math.random() - 0.5) * (h * 1.8);
          }

          // Projected head position
          const hz = Math.max(20, s.z);
          const hx = targetOriginX + (s.x / hz) * FOV;
          const hy = originY + (s.y / hz) * FOV;

          // Wrap if star flies far off screen bounds
          if (hx < -250 || hx > w + 250 || hy < -250 || hy > h + 250) {
            s.z = MAX_Z;
            s.x = (Math.random() - 0.5) * (w * 1.8);
            s.y = (Math.random() - 0.5) * (h * 1.8);
            continue;
          }

          // 3D Depth factor (0 = far depth, 1 = near viewer)
          const depthFactor = Math.max(0.08, 1.0 - hz / MAX_Z);
          const baseAlpha = 0.25 + depthFactor * 0.72;

          // Render 3D hyperspace warp rays during travel surge
          if (surge > 0.04) {
            // Projected tail position along 3D trajectory
            const tz = hz + Math.max(20, vz * trailDt);
            const tx = targetOriginX + ((s.x - vx * trailDt) / tz) * FOV;
            const ty = originY + (s.y / tz) * FOV;

            const dx = hx - tx;
            const dy = hy - ty;
            const streakDist = Math.sqrt(dx * dx + dy * dy);

            if (streakDist > 2 && Number.isFinite(tx) && Number.isFinite(ty)) {
              const grad = ctx.createLinearGradient(tx, ty, hx, hy);
              grad.addColorStop(0, `rgba(${s.r}, ${s.g}, ${s.b}, 0)`);
              grad.addColorStop(0.65, `rgba(${s.r}, ${s.g}, ${s.b}, ${(baseAlpha * 0.45).toFixed(3)})`);
              grad.addColorStop(1, `rgba(${s.r}, ${s.g}, ${s.b}, ${baseAlpha.toFixed(3)})`);

              ctx.strokeStyle = grad;
              ctx.lineWidth = Math.max(0.8, 0.6 + depthFactor * 2.2);
              ctx.beginPath();
              ctx.moveTo(tx, ty);
              ctx.lineTo(hx, hy);
              ctx.stroke();

              // Luminous pinpoint head
              const headRadius = 0.8 + depthFactor * 1.4;
              ctx.fillStyle = `rgba(${s.r}, ${s.g}, ${s.b}, ${Math.min(1, baseAlpha * 1.25).toFixed(3)})`;
              ctx.beginPath();
              ctx.arc(hx, hy, headRadius, 0, Math.PI * 2);
              ctx.fill();

              // Soft halo glow on brilliant foreground warp rays (as in 1114.mp4)
              if (s.isBright && depthFactor > 0.65 && surge > 0.35) {
                ctx.fillStyle = `rgba(186, 230, 253, ${(baseAlpha * 0.3).toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(hx, hy, headRadius * 3.4, 0, Math.PI * 2);
                ctx.fill();
              }
              continue;
            }
          }

          // Default / Idle state: Serene cosmic starlight with gentle twinkle
          const pulse = 0.5 + 0.5 * Math.sin(currentTime * 0.002 * s.twinkleSpeed + s.twinklePhase);
          const alpha = baseAlpha * (0.6 + 0.4 * pulse);
          const starRadius = 0.65 + depthFactor * 1.1;

          ctx.fillStyle = s.hex;
          ctx.globalAlpha = Math.max(0.12, Math.min(1, alpha));
          ctx.beginPath();
          ctx.arc(hx, hy, starRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.globalAlpha = 1;
      } catch (err) {
        console.error("Starfield animation error:", err);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full bg-black pointer-events-none"
    />
  );
}
