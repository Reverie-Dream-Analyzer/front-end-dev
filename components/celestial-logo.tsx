"use client";

import React from "react";

export const CelestialLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Main circular background with gradient */}
        <circle cx="24" cy="24" r="22" fill="url(#celestialGradient)" stroke="url(#borderGradient)" strokeWidth="1" />
        
        {/* Crescent moon */}
        <path d="M18 12C18 12 12 16 12 24C12 32 18 36 18 36C14 34 12 29 12 24C12 19 14 14 18 12Z" fill="url(#moonGradient)" />
        
        {/* Sun rays */}
        <g>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="24"
              y1="6"
              x2="24"
              y2="10"
              stroke="url(#sunGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              transform={`rotate(${angle} 24 24)`}
            />
          ))}
        </g>
        
        {/* Central star cluster */}
        <g>
          {/* Main star */}
          <path d="M30 18L32 22H36L33 25L34 29L30 27L26 29L27 25L24 22H28L30 18Z" fill="url(#starGradient)" />
          
          {/* Small stars */}
          <circle cx="16" cy="16" r="1" fill="#fbbf24" />
          <circle cx="34" cy="32" r="0.8" fill="#a78bfa" />
          <circle cx="14" cy="32" r="0.6" fill="#ec4899" />
        </g>
        
        {/* Constellation lines */}
        <g stroke="url(#constellationGradient)" strokeWidth="0.5" strokeDasharray="1,1" opacity={0.6}>
          <path d="M16 16 L24 20 L30 18 L34 32" />
          <path d="M18 12 L24 20" />
          <path d="M30 18 L34 24" />
        </g>
        
        {/* Gradient definitions */}
        <defs>
          <radialGradient id="celestialGradient" cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#312e81" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#4c1d95" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#6b21a8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.8" />
          </radialGradient>
          
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
          </linearGradient>
          
          <radialGradient id="moonGradient" cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
          
          <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          
          <radialGradient id="starGradient" cx="0.5" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#ec4899" />
          </radialGradient>
          
          <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Static glow effect */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)",
        }}
      />
      
      {/* Static particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1 left-1/2 w-1 h-1 bg-yellow-300 rounded-full opacity-60" />
        <div className="absolute bottom-1 right-1/3 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-40" />
        <div className="absolute top-1/3 right-1 w-0.5 h-0.5 bg-pink-400 rounded-full opacity-50" />
      </div>
    </div>
  );
};