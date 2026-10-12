import { useEffect, useRef } from "react";

// Champ de particules animé en arrière-plan.
// Réagit aux évènements `calc:pulse` émis par le clavier (voir ../pulse.js).

const PALETTE = ["#f6b04a", "#ffcf87", "#3fc6ff", "#7ad8ff", "#c79bff"];

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let t = 0;
    const mouse = { x: -9999, y: -9999 };
    const drifters = [];
    const sparks = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(Math.min(140, (w * h) / 11000));
      drifters.length = 0;
      for (let i = 0; i < target; i++) {
        drifters.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.4,
          c: PALETTE[i % PALETTE.length],
          a: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onPulse = (e) => {
      if (reduced) return;
      const { x, y, strength } = e.detail;
      const n = Math.round(14 * strength);
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = (Math.random() * 3 + 1.5) * strength;
        sparks.push({
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 1,
          r: Math.random() * 2 + 1,
          c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        });
      }
    };

    const flow = (x, y) =>
      Math.sin(x * 0.0022 + t * 0.35) * 1.4 + Math.cos(y * 0.0028 - t * 0.25) * 1.4;

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Liaisons entre particules proches du curseur
      ctx.lineWidth = 0.6;
      for (const p of drifters) {
        const ang = flow(p.x, p.y);
        p.x += Math.cos(ang) * 0.35;
        p.y += Math.sin(ang) * 0.35 - 0.08;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 140) {
          const f = (140 - d) / 140;
          p.x += (dx / (d || 1)) * f * 1.6;
          p.y += (dy / (d || 1)) * f * 1.6;
          ctx.strokeStyle = `rgba(255, 214, 150, ${f * 0.25})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.globalAlpha = p.a * (0.7 + Math.sin(t * 2 + p.x) * 0.3);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.life -= 0.022;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("calc:pulse", onPulse);
    if (reduced) {
      draw();
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("calc:pulse", onPulse);
    };
  }, []);

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="aurora aurora--a" />
      <div className="aurora aurora--b" />
      <div className="aurora aurora--c" />
      <canvas ref={canvasRef} className="particles" />
      <div className="grain" />
      <div className="vignette" />
    </div>
  );
}
