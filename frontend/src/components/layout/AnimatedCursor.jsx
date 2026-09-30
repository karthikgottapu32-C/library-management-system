import React, { useEffect, useRef } from 'react';

export default function AnimatedCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);
  const rafId = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      // Dot follows instantly
      dot.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    };

    const onOver = (e) => {
      const isInteractive = e.target.closest('button, a, input, select, textarea, [role="button"], .interactive');
      hovering.current = !!isInteractive;
    };

    const animate = () => {
      // Ring lerps toward cursor — creates smooth magnetic lag
      const lerp = 0.12;
      ringPos.current.x += (pos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * lerp;

      const size = hovering.current ? 40 : 28;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`;
      ring.style.borderColor = hovering.current ? 'rgba(99,102,241,0.9)' : 'rgba(99,102,241,0.5)';
      ring.style.backgroundColor = hovering.current ? 'rgba(99,102,241,0.08)' : 'transparent';

      rafId.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      {/* Tiny solid dot — tracks cursor exactly */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-indigo-400 pointer-events-none z-[9999] hidden md:block"
        style={{ transition: 'none', willChange: 'transform' }}
      />
      {/* Larger ring — lags behind giving magnetic feel */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full border-2 pointer-events-none z-[9998] hidden md:block"
        style={{
          width: 28,
          height: 28,
          transition: 'width 0.2s, height 0.2s, border-color 0.2s, background-color 0.2s',
          willChange: 'transform',
          borderColor: 'rgba(99,102,241,0.5)',
        }}
      />
    </>
  );
}
