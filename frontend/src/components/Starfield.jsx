import { useEffect, useRef } from "react";

const COLORS = ["#ffffff", "#cfe3ff", "#fff2cf", "#ffd8b3"];
const STIFFNESS = 14; // with DAMPING below, settles in about 1.5s
const DAMPING = 5.3; // lower = more overshoot
const TRAIL = 0.04; // streak length per unit of speed
const MAX_TRAIL = 0.5; // cap so fast turns don't draw giant arcs

export default function Starfield({ target = 0, count = 1400 }) {
  const ref = useRef(null);
  const targetRef = useRef(target);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let R = 0;
    let raf;
    let last = 0;
    let angle = 0;
    let vel = 0;

    // Starfield particles with varied twinkle speeds & depths
    const stars = Array.from({ length: count }, () => {
      const d = 0.35 + Math.random() * 0.65;
      return {
        r: Math.sqrt(Math.random()),
        a: Math.random() * Math.PI * 2,
        d,
        s: d * d * 2.2 + 0.3,
        t: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 2.4, // distinct twinkle frequency
        minAlpha: 0.15 + Math.random() * 0.25, // deeper contrast when dimmed
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    });

    // Comets living within the rotating celestial sphere
    let comets = [];
    let nextCometTime = 1200 + Math.random() * 2000;

    const spawnComet = (currentTime, currentAngle) => {
      // Pick a visible spawn point in current screen space
      const screenX = w * (0.15 + Math.random() * 0.7);
      const screenY = h * (0.05 + Math.random() * 0.3);

      // Un-project from screen space into the rotating celestial frame around pivot (cx, cy)
      const cosA = Math.cos(currentAngle);
      const sinA = Math.sin(currentAngle);
      const dx0 = screenX - cx;
      const dy0 = screenY - cy;

      const u = dx0 * cosA + dy0 * sinA;
      const v = -dx0 * sinA + dy0 * cosA;

      // Celestial velocity: diagonal streak across the night sky
      const speed = 700 + Math.random() * 400; // px / sec
      const dir = (Math.PI / 5) + (Math.random() - 0.5) * 0.4;

      const vxScreen = Math.cos(dir) * speed;
      const vyScreen = Math.sin(dir) * speed;

      const vu = vxScreen * cosA + vyScreen * sinA;
      const vv = -vxScreen * sinA + vyScreen * cosA;

      return {
        u,
        v,
        vu,
        vv,
        history: [{ u, v }],
        birth: currentTime,
        duration: 800 + Math.random() * 450,
      };
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      cx = w / 2;
      cy = h * 1.1; // pivot below the screen
      R = Math.hypot(w, h) * 1.1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (time) => {
      const dt = Math.min((time - last) / 1000, 0.05) || 0.016;
      last = time;

      if (reduce) {
        angle = targetRef.current;
        vel = 0;
      } else {
        const acc = STIFFNESS * (targetRef.current - angle) - DAMPING * vel;
        vel += acc * dt;
        angle += vel * dt;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";

      // Subtle atmospheric deep-space tint anchored to pivot
      const ambient = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.1);
      ambient.addColorStop(0, "rgba(10, 16, 35, 0.45)");
      ambient.addColorStop(0.6, "rgba(18, 9, 32, 0.2)");
      ambient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, w, h);

      // Render stars with organic twinkling & rotational streaks
      for (const st of stars) {
        const a = st.a + angle * st.d;
        const x = cx + Math.cos(a) * st.r * R;
        const y = cy + Math.sin(a) * st.r * R;
        if (x < -50 || x > w + 50 || y < -50 || y > h + 50) continue;

        // Dynamic twinkle calculation
        const pulse = 0.5 + 0.5 * Math.sin((time / 1000) * st.speed + st.t);
        const twinkle = st.minAlpha + (1 - st.minAlpha) * pulse;

        ctx.globalAlpha = (0.35 + 0.65 * st.d) * twinkle;
        ctx.strokeStyle = st.c;
        ctx.fillStyle = st.c;

        const raw = vel * st.d * TRAIL;
        const trail = Math.max(-MAX_TRAIL, Math.min(MAX_TRAIL, raw));
        const len = Math.abs(trail) * st.r * R;

        if (len < 1) {
          ctx.fillRect(x - st.s / 2, y - st.s / 2, st.s, st.s);
        } else {
          const tx = cx + Math.cos(a - trail) * st.r * R;
          const ty = cy + Math.sin(a - trail) * st.r * R;
          ctx.lineWidth = st.s;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }

      // Render comets anchored to the rotating celestial coordinate scheme
      if (!reduce) {
        if (time > nextCometTime && comets.length < 2 && Math.abs(vel) < 2.5) {
          comets.push(spawnComet(time, angle));
          nextCometTime = time + 3000 + Math.random() * 4500;
        }

        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        comets = comets.filter((comet) => {
          const age = time - comet.birth;
          if (age >= comet.duration) return false;

          // Advance celestial coordinates
          comet.u += comet.vu * dt;
          comet.v += comet.vv * dt;

          // Record celestial trail history
          comet.history.push({ u: comet.u, v: comet.v });
          if (comet.history.length > 12) {
            comet.history.shift();
          }

          if (comet.history.length < 2) return true;

          const progress = age / comet.duration;
          const fade = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
          const alpha = Math.max(0, Math.min(1, fade));

          // Project celestial history points to screen space using current sky angle
          const points = comet.history.map((pt) => ({
            x: cx + pt.u * cosAngle - pt.v * sinAngle,
            y: cy + pt.u * sinAngle + pt.v * cosAngle,
          }));

          const head = points[points.length - 1];
          const tail = points[0];

          // Cull if outside visible bounds
          if (
            (head.x < -100 || head.x > w + 100 || head.y < -100 || head.y > h + 100) &&
            (tail.x < -100 || tail.x > w + 100 || tail.y < -100 || tail.y > h + 100)
          ) {
            return false;
          }

          ctx.save();
          ctx.globalAlpha = alpha;

          // Luminous stardust trail conforming to sky rotation
          const grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
          grad.addColorStop(0, "rgba(255, 255, 255, 0)");
          grad.addColorStop(0.65, "rgba(186, 224, 255, 0.4)");
          grad.addColorStop(1, "rgba(255, 255, 255, 0.95)");

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();

          // Soft coma halo
          ctx.fillStyle = "rgba(190, 225, 255, 0.35)";
          ctx.beginPath();
          ctx.arc(head.x, head.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Core bright head
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(head.x, head.y, 1.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          return true;
        });
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={ref} className="fixed inset-0 -z-10 h-full w-full bg-black" />;
}
