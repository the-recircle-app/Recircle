import React from 'react';

interface ReCircleBrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}

const ReCircleBrandLogo: React.FC<ReCircleBrandLogoProps> = ({
  className = '',
  width = 32,
  height = 32,
  color = '#38BDF8'
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circular design with recycle/reuse concept */}
      <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="6" fill="none" />
      
      {/* Recycle arrows */}
      <path 
        d="M62,28 A30,30 0 0,1 72,50" 
        stroke={color} 
        strokeWidth="5" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M28,38 A30,30 0 0,1 50,28" 
        stroke={color} 
        strokeWidth="5" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M38,72 A30,30 0 0,1 28,50" 
        stroke={color} 
        strokeWidth="5" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M72,62 A30,30 0 0,1 50,72" 
        stroke={color} 
        strokeWidth="5" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* Arrow heads */}
      <polygon points="60,24 67,32 70,22" fill={color} />
      <polygon points="24,36 30,45 35,34" fill={color} />
      <polygon points="70,60 60,68 74,68" fill={color} />
      <polygon points="36,74 46,70 35,65" fill={color} />
    </svg>
  );
};

export default ReCircleBrandLogo;