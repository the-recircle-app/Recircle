import React from 'react';
import B3trLogo from './B3trLogo';

interface TokenIconProps {
  value?: number | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showValue?: boolean;
  className?: string;
}

const TokenIcon: React.FC<TokenIconProps> = ({ 
  value, 
  size = 'md', 
  showValue = true,
  className = ''
}) => {
  // Size mappings for different size options
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  // Format the value to have one decimal place
  const formattedValue = typeof value === 'number' 
    ? value.toFixed(1) 
    : value;

  return (
    <div className={`flex items-center ${className}`}>
      <B3trLogo 
        className={`text-primary ${sizeClasses[size]}`} 
        aria-hidden="true" 
      />
      {showValue && value !== undefined && (
        <span className={`ml-1 font-medium ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : size === 'xl' ? 'text-lg' : 'text-sm'}`}>
          {formattedValue} B3TR
        </span>
      )}
    </div>
  );
};

export default TokenIcon;