import React from 'react';

interface ReCircleLogoProps {
  className?: string;
  color?: string;
  width?: number;
  height?: number;
  useImageLogo?: boolean;
}

const ReCircleLogo: React.FC<ReCircleLogoProps> = ({
  className = '',
  color = 'white',
  width = 32,
  height = 32,
  useImageLogo = false
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 360 360" 
    width={width} 
    height={height} 
    className={className}
  >
    {/* Top arc - counterclockwise */}
    <path 
      d="M60,180 A120,120 0 0,1 300,180" 
      stroke={color} 
      strokeWidth="16" 
      fill="none" 
      strokeLinecap="round" 
    />
    
    {/* Bottom arc - counterclockwise */}
    <path 
      d="M300,180 A120,120 0 0,1 60,180" 
      stroke={color} 
      strokeWidth="16" 
      fill="none" 
      strokeLinecap="round" 
    />
    
    {/* Left arrow - larger triangular head */}
    <polygon 
      points="40,180 80,150 80,210" 
      fill={color} 
    />
    
    {/* Right arrow - larger triangular head */}
    <polygon 
      points="320,180 280,150 280,210" 
      fill={color} 
    />
  </svg>
);

export default ReCircleLogo;