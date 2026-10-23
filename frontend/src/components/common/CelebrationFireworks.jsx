import React, { useEffect, useRef } from 'react';

export default function CelebrationFireworks({ onComplete, duration = 3500 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isActive = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#10B981', '#34D399', '#6366F1', '#818CF8', '#F59E0B', '#EC4899', '#38BDF8', '#FBBF24'];

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.gravity = 0.12;
        this.size = Math.random() * 3 + 2;
        this.spin = (Math.random() - 0.5) * 0.2;
        this.isSpark = Math.random() > 0.4;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.alpha -= this.decay;
      }

      draw(context) {
        context.save();
        context.globalAlpha = Math.max(0, this.alpha);
        context.fillStyle = this.color;
        context.shadowColor = this.color;
        context.shadowBlur = this.isSpark ? 10 : 0;
        context.beginPath();
        if (this.isSpark) {
          context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        } else {
          context.rect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 1.5);
        }
        context.fill();
        context.restore();
      }
    }

    let particles = [];

    const createBurst = (x, y) => {
      const count = 45;
      const burstColor = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < count; i++) {
        const color = Math.random() > 0.3 ? burstColor : colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, color));
      }
    };

    // Initial launch bursts
    const w = window.innerWidth;
    const h = window.innerHeight;
    createBurst(w * 0.5, h * 0.35);
    setTimeout(() => createBurst(w * 0.3, h * 0.3), 200);
    setTimeout(() => createBurst(w * 0.7, h * 0.32), 400);
    setTimeout(() => createBurst(w * 0.45, h * 0.25), 700);
    setTimeout(() => createBurst(w * 0.6, h * 0.4), 1100);

    const startTime = Date.now();

    const loop = () => {
      if (!isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      if (Date.now() - startTime < duration) {
        animationFrameId = requestAnimationFrame(loop);
      } else {
        if (onComplete) onComplete();
      }
    };

    loop();

    const timer = setTimeout(() => {
      isActive = false;
      if (onComplete) onComplete();
    }, duration);

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
      window.removeEventListener('resize', resize);
    };
  }, [duration, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
