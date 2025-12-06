import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="leafGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Left side - Solid */}
      <path 
        d="M12 21.5C12 21.5 3 16 3 9C3 5 6.5 2.5 12 2.5V21.5Z" 
        fill="currentColor" 
        className="text-emerald-500"
      />
      
      {/* Right side - Outlined (Reflection) */}
      <path 
        d="M12 21.5C12 21.5 21 16 21 9C21 5 17.5 2.5 12 2.5" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-emerald-400"
      />
      
      {/* Central Stem/Mirror Line */}
      <path 
        d="M12 3V21" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        opacity="0.6"
      />
    </svg>
  );
};