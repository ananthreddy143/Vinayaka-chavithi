import { useMemo } from 'react';

// Floating festival particles + diya emojis for ambiance.
export default function FestivalBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const size = 4 + Math.random() * 10;
      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.4,
      };
    });
  }, []);

  const diyas = useMemo(() => {
    const positions = [
      { left: '5%', top: '15%' },
      { left: '92%', top: '22%' },
      { left: '8%', top: '70%' },
      { left: '88%', top: '78%' },
      { left: '50%', top: '8%' },
    ];
    return positions.map((p, i) => ({ ...p, id: i, delay: i * 0.4 }));
  }, []);

  return (
    <div className="festival-bg" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      {diyas.map((d) => (
        <div
          key={d.id}
          className="diya"
          style={{ left: d.left, top: d.top, animationDelay: `${d.delay}s` }}
        >
          🪔
        </div>
      ))}
    </div>
  );
}
