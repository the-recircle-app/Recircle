import React from 'react';
import RefreshIconImage from './RefreshIconImage';

interface ReCircleTextLogoProps {
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'white' | 'blue';
  showSymbol?: boolean;
}

const ReCircleTextLogo: React.FC<ReCircleTextLogoProps> = ({ 
  className = '', 
  style = {},
  size = 'md',
  colorScheme = 'white',
  showSymbol = true
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
  
  const logoSizes = {
    sm: 24,
    md: 32,
    lg: 40
  };
  
  // Calculate a smaller size for the symbol compared to the text
  const symbolSize = Math.round(logoSizes[size] * 0.75);
  
  return (
    <div className={`flex items-center ${className}`} style={style}>
      <span className={`font-bold ${sizeClasses[size]} ${colors[colorScheme]}`}>
        ReCircle
      </span>
      
      {showSymbol && (
        <span className="ml-2">
          <RefreshIconImage 
            width={symbolSize}
            height={symbolSize}
            colorScheme={colorScheme}
            className="translate-y-[2px]"
          />
        </span>
      )}
    </div>
  );
};

export default ReCircleTextLogo;