'use client';

import React from 'react';

// Pre-generate star positions once at module load to avoid impure calls during render
const PREGENERATED_STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 3,
  duration: 2 + Math.random() * 2,
}));

export function CelestialBackground() {
  const stars = PREGENERATED_STARS;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient background (reduced opacity so page content remains readable) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 opacity-60" />
      
      {/* Secondary gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/50 via-transparent to-purple-950/30" />
      
      {/* Floating stars (now static) */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.9,
          }}
        />
      ))}
      
      {/* Floating moon (now static position) */}
      <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 opacity-80 shadow-lg">
        {/* Moon craters */}
        <div className="absolute top-4 right-6 w-2 h-2 rounded-full bg-yellow-400 opacity-60" />
        <div className="absolute top-8 right-4 w-1 h-1 rounded-full bg-yellow-400 opacity-40" />
        <div className="absolute bottom-6 left-5 w-3 h-3 rounded-full bg-yellow-400 opacity-50" />
  </div>
      
      {/* Floating sun (now static) */}
      <div className="absolute top-32 left-20 w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-yellow-400 opacity-60">
        {/* Sun rays */}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-6 bg-gradient-to-t from-transparent to-orange-300 opacity-40"
            style={{
              top: '-12px',
              left: '50%',
              transform: `translateX(-50%) rotate(${i * 45}deg)`,
              transformOrigin: 'center 20px',
            }}
          />
        ))}
  </div>
      
      {/* Shooting star (static) */}
      <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white rounded-full">
        {/* Shooting star trail */}
        <div className="absolute top-0 left-0 w-12 h-0.5 bg-gradient-to-r from-white to-transparent opacity-60 -rotate-45" />
  </div>
      
      {/* Additional static celestial elements */}
      <div className="absolute bottom-32 right-1/3 w-8 h-8 rounded-full bg-purple-400 opacity-30" />
      <div className="absolute top-1/2 left-1/4 w-6 h-6 rounded-full bg-blue-300 opacity-25" />
    </div>
  );
}