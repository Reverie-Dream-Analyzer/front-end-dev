"use client";

import React from 'react';

// Static array for sun rays
const SUN_RAYS = Array.from({ length: 8 }, (_, i) => ({
  angle: i * 45,
  delay: i * 0.1,
}));

// Static array for floating stars
const FLOATING_STARS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  delay: i * 0.5,
  duration: 2 + (i * 0.5), // Deterministic duration based on index
  left: `${20 + i * 15}%`,
  top: `${10 + (i % 2) * 80}%`,
}));

// Static constellation points
const CONSTELLATION_POINTS = [
  { x: 10, y: 20 },
  { x: 30, y: 10 },
  { x: 50, y: 30 },
  { x: 70, y: 15 },
  { x: 90, y: 25 },
];

export function AnimatedMoon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 2a10 10 0 0 0 0 20 10 10 0 0 1 0-20z" fill="currentColor" />
        <circle cx="9" cy="8" r="1" fill="rgba(0,0,0,0.2)" />
        <circle cx="7" cy="12" r="0.5" fill="rgba(0,0,0,0.15)" />
        <circle cx="10" cy="15" r="1.5" fill="rgba(0,0,0,0.1)" />
      </svg>
    </div>
  );
}

export function AnimatedSun({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        {SUN_RAYS.map(({ angle }) => (
          <line
            key={angle}
            x1="12"
            y1="1"
            x2="12"
            y2="3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transformOrigin: '12px 12px',
              transform: `rotate(${angle}deg)`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function FloatingStars({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {FLOATING_STARS.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-current rounded-full opacity-60"
          style={{
            left: star.left,
            top: star.top,
          }}
        />
      ))}
    </div>
  );
}

export function ConstellationPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full h-8 ${className}`}>
      <svg viewBox="0 0 100 40" className="w-full h-full opacity-30">
        {/* Constellation lines */}
        {CONSTELLATION_POINTS.slice(0, -1).map((point, i) => (
          <line
            key={i}
            x1={point.x}
            y1={point.y}
            x2={CONSTELLATION_POINTS[i + 1].x}
            y2={CONSTELLATION_POINTS[i + 1].y}
            stroke="currentColor"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Constellation stars */}
        {CONSTELLATION_POINTS.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="1"
            fill="currentColor"
          />
        ))}
      </svg>
    </div>
  );
}