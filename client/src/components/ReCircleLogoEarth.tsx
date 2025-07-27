import React from 'react';

interface ReCircleLogoEarthProps {
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gradient' | 'solid';
}

/**
 * ReCircleLogoEarth - Logo with earth-colored theme and the refresh symbol integrated
 * replacing the "C" in "ReCircle"
 */
const ReCircleLogoEarth: React.FC<ReCircleLogoEarthProps> = ({ 
  className = '', 
  style = {},
  size = 'md',
  variant = 'gradient'
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };
  
  // Earth color palette
  const colors = {
    // Green for the "Re" part (forest/land)
    greenLight: '#4CAF50',
    greenDark: '#2E7D32',
    // Blue for the "ircle" part (water/ocean)
    blueLight: '#2196F3',
    blueDark: '#1565C0',
  };
  
  // Smaller size for the icon to match the x-height of the text
  const logoSizes = {
    sm: 18,
    md: 24,
    lg: 32
  };
  
  const iconSize = logoSizes[size];
  
  // Create earth-inspired gradients
  const textStartGradient = variant === 'gradient' 
    ? 'from-[#4CAF50] to-[#2E7D32]' 
    : '';
  
  const textEndGradient = variant === 'gradient' 
    ? 'from-[#2196F3] to-[#1565C0]' 
    : '';
    
  const textStartColor = variant === 'solid' ? colors.greenLight : '';
  const textEndColor = variant === 'solid' ? colors.blueLight : '';
  
  // Colors for the refresh icon - earth green/blue blend
  const blendedColor = '#3AA1C0'; // A blend between green and blue for the icon
  
  return (
    <div className={`flex items-center ${className}`} style={style}>
      {/* Re part - forest green */}
      <span className={`
        font-bold 
        ${sizeClasses[size]} 
        ${variant === 'gradient' ? 'bg-gradient-to-r ' + textStartGradient : ''} 
        ${variant === 'solid' ? 'text-[' + colors.greenLight + ']' : ''}
        flex items-center
        ${variant === 'gradient' ? 'bg-clip-text text-transparent' : ''}
      `}>
        Re
      </span>
      
      {/* Icon container with adjusted positioning for better character alignment */}
      <span 
        className="relative inline-flex items-center justify-center mx-[-1px]" 
        style={{ 
          width: iconSize, 
          height: iconSize, 
          top: size === 'lg' ? 2 : 1, 
          position: 'relative' 
        }}
      >
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.8273 3 17.35 4.30093 19 6.34267" 
            stroke={blendedColor}
            strokeWidth="2.5" 
            strokeLinecap="round" 
            fill="none"
            strokeDasharray="0"
          />
          <path 
            d="M21 3V6.5C21 6.77614 20.7761 7 20.5 7H17" 
            stroke={blendedColor}
            strokeWidth="2.5" 
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      
      {/* ircle part - ocean blue */}
      <span className={`
        font-bold 
        ${sizeClasses[size]} 
        ${variant === 'gradient' ? 'bg-gradient-to-r ' + textEndGradient : ''} 
        ${variant === 'solid' ? 'text-[' + colors.blueLight + ']' : ''}
        ${variant === 'gradient' ? 'bg-clip-text text-transparent' : ''}
      `}>
        ircle
      </span>
    </div>
  );
};

export default ReCircleLogoEarth;