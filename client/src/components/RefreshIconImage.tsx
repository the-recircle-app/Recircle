import React from 'react';

interface RefreshIconImageProps {
  className?: string;
  width?: number;
  height?: number;
  colorScheme?: 'white' | 'blue';
}

/**
 * RefreshIconImage - SVG implementation of the refresh icon
 */
const RefreshIconImage: React.FC<RefreshIconImageProps> = ({
  className = '',
  width = 32,
  height = 32,
  colorScheme = 'white'
}) => {
  // Set the color based on the colorScheme
  const strokeColor = colorScheme === 'white' ? '#FFFFFF' : '#38BDF8';
  
  // We'll use an SVG directly to ensure it works everywhere
  // This SVG is designed to match the reference image
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.8273 3 17.35 4.30093 19 6.34267" 
        stroke={strokeColor}
        strokeWidth="2" 
        strokeLinecap="round" 
        fill="none"
        strokeDasharray="0"
      />
      <path 
        d="M21 3V6.5C21 6.77614 20.7761 7 20.5 7H17" 
        stroke={strokeColor}
        strokeWidth="2" 
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default RefreshIconImage;