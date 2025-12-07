'use client';

import React, { useEffect, useState } from 'react';

// Twinkling stars - scattered across the sky
const TWINKLING_STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.5 + 0.5, // 0.5-2px
  delay: Math.random() * 6,
  duration: 2 + Math.random() * 4,
  minOpacity: 0.1 + Math.random() * 0.2,
  maxOpacity: 0.4 + Math.random() * 0.3,
}));

// Brighter accent stars - fewer, more prominent
const ACCENT_STARS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 2, // 2-4px
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 3,
}));

// Small floating celestial dust/particles
const CELESTIAL_DUST = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 5,
  opacity: 0.1 + Math.random() * 0.15,
  color: Math.random() > 0.5 ? 'purple' : 'blue',
}));

// Constellation patterns (connecting lines between star points)
const CONSTELLATIONS = [
  // Small triangle constellation (top-left area)
  { points: [[8, 12], [15, 8], [18, 18]], id: 1 },
  // Small dipper shape (right side)
  { points: [[75, 15], [80, 12], [85, 15], [88, 20]], id: 2 },
  // Zigzag pattern (bottom area)
  { points: [[25, 75], [30, 70], [35, 78], [42, 72]], id: 3 },
  // Small cross (center-ish)
  { points: [[55, 35], [60, 40], [65, 35]], id: 4 },
];

type ShootingStar = {
  id: number;
  x: number;
  y: number;
  duration: number;
};

export function CelestialBackground() {
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  // Spawn shooting stars at random intervals
  useEffect(() => {
    let starId = 0;
    
    const spawnShootingStar = () => {
      const newStar: ShootingStar = {
        id: starId++,
        x: Math.random() * 50 + 40, // Start from right 40-90% of screen
        y: Math.random() * 25 - 10, // Start from top area (can be slightly off-screen)
        duration: 2 + Math.random() * 1.5,
      };
      
      setShootingStars(prev => [...prev, newStar]);
      
      // Remove star after animation completes
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== newStar.id));
      }, newStar.duration * 1000 + 200);
    };

    // First shooting star after 3 seconds
    const initialTimeout = setTimeout(spawnShootingStar, 3000);
    
    // Spawn at random intervals (6-12 seconds)
    const interval = setInterval(() => {
      spawnShootingStar();
    }, 6000 + Math.random() * 6000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 opacity-60" />
      
      {/* Secondary gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/50 via-transparent to-purple-950/30" />
      
      {/* Constellation lines - super light */}
      <svg className="absolute inset-0 w-full h-full">
        {CONSTELLATIONS.map((constellation) => (
          <g key={constellation.id}>
            {constellation.points.slice(0, -1).map((point, idx) => (
              <line
                key={`${constellation.id}-${idx}`}
                x1={`${point[0]}%`}
                y1={`${point[1]}%`}
                x2={`${constellation.points[idx + 1][0]}%`}
                y2={`${constellation.points[idx + 1][1]}%`}
                stroke="white"
                strokeWidth="0.5"
                className="animate-constellation"
                style={{
                  '--delay': `${idx * 0.5}s`,
                } as React.CSSProperties}
              />
            ))}
            {/* Small dots at constellation vertices */}
            {constellation.points.map((point, idx) => (
              <circle
                key={`dot-${constellation.id}-${idx}`}
                cx={`${point[0]}%`}
                cy={`${point[1]}%`}
                r="1.5"
                fill="white"
                className="animate-twinkle"
                style={{
                  '--delay': `${idx * 0.3}s`,
                  '--duration': '4s',
                  '--min-opacity': '0.15',
                  '--max-opacity': '0.4',
                } as React.CSSProperties}
              />
            ))}
          </g>
        ))}
      </svg>
      
      {/* Twinkling stars - main star field */}
      {TWINKLING_STARS.map((star) => (
        <div
          key={`twinkle-${star.id}`}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--delay': `${star.delay}s`,
            '--duration': `${star.duration}s`,
            '--min-opacity': `${star.minOpacity}`,
            '--max-opacity': `${star.maxOpacity}`,
          } as React.CSSProperties}
        />
      ))}
      
      {/* Accent stars - brighter focal points */}
      {ACCENT_STARS.map((star) => (
        <div
          key={`accent-${star.id}`}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--delay': `${star.delay}s`,
            '--duration': `${star.duration}s`,
            '--min-opacity': '0.3',
            '--max-opacity': '0.6',
            boxShadow: '0 0 4px rgba(255,255,255,0.3)',
          } as React.CSSProperties}
        />
      ))}
      
      {/* Celestial dust - tiny floating particles */}
      {CELESTIAL_DUST.map((dust) => (
        <div
          key={`dust-${dust.id}`}
          className={`absolute rounded-full animate-float-gentle animate-pulse-subtle ${
            dust.color === 'purple' ? 'bg-purple-300' : 'bg-blue-300'
          }`}
          style={{
            left: `${dust.x}%`,
            top: `${dust.y}%`,
            width: `${dust.size}px`,
            height: `${dust.size}px`,
            '--delay': `${dust.delay}s`,
            '--base-opacity': `${dust.opacity}`,
          } as React.CSSProperties}
        />
      ))}
      
      {/* Shooting stars - falling diagonally */}
      {shootingStars.map((star) => (
        <div
          key={`shooting-${star.id}`}
          className="absolute animate-shooting-star-fall"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            '--duration': `${star.duration}s`,
          } as React.CSSProperties}
        >
          {/* Star head - small and bright */}
          <div 
            className="w-1 h-1 bg-white rounded-full"
            style={{ 
              boxShadow: '0 0 3px 1px rgba(255,255,255,0.4)',
            }} 
          />
          {/* Star trail - pointing up-right (opposite of travel direction) */}
          <div 
            className="absolute bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-full"
            style={{ 
              width: '1px',
              height: '60px',
              top: '-58px',
              left: '0px',
              transform: 'rotate(-25deg)',
              transformOrigin: 'bottom center',
            }}
          />
        </div>
      ))}
      
      {/* Subtle moon - smaller and more transparent */}
      <div className="absolute top-16 right-16 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 opacity-40 animate-float-gentle">
        <div className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-yellow-300 opacity-50" />
        <div className="absolute bottom-4 left-3 w-2 h-2 rounded-full bg-yellow-300 opacity-40" />
      </div>
      
      {/* Distant nebula glow - very subtle */}
      <div 
        className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-purple-400/5 blur-3xl animate-pulse-subtle"
        style={{ '--base-opacity': '0.05' } as React.CSSProperties}
      />
      <div 
        className="absolute bottom-1/4 right-1/3 w-40 h-40 rounded-full bg-indigo-300/5 blur-3xl animate-pulse-subtle"
        style={{ '--delay': '2s', '--base-opacity': '0.04' } as React.CSSProperties}
      />
    </div>
  );
}