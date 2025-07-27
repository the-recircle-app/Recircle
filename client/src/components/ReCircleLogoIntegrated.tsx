import React from 'react';

interface ReCircleLogoIntegratedProps {
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'white' | 'blue';
}

/**
 * ReCircleLogoIntegrated - Logo with the refresh symbol integrated into the text
 * replacing the "C" in "ReCircle"
 */
const ReCircleLogoIntegrated: React.FC<ReCircleLogoIntegratedProps> = ({ 
  className = '', 
  style = {},
  size = 'md',
  colorScheme = 'white'
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };
  
  const colors = {
    white: 'text-white',
    blue: 'text-[#38BDF8]'
  };
  
  // Smaller size for the icon to match the x-height of the text
  const logoSizes = {
    sm: 18,
    md: 24,
    lg: 32
  };
  
  const iconSize = logoSizes[size];
  const strokeColor = colorScheme === 'white' ? '#FFFFFF' : '#38BDF8';
  
  return (
    <div className={`flex items-center ${className}`} style={style}>
      <span className={`font-bold ${sizeClasses[size]} ${colors[colorScheme]} flex items-center`}>
        Re
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
              stroke={strokeColor}
              strokeWidth="2.5" 
              strokeLinecap="round" 
              fill="none"
              strokeDasharray="0"
            />
            <path 
              d="M21 3V6.5C21 6.77614 20.7761 7 20.5 7H17" 
              stroke={strokeColor}
              strokeWidth="2.5" 
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </span>
        ircle
      </span>
    </div>
  );
};

export default ReCircleLogoIntegrated;