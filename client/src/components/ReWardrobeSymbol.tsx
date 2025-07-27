import React from 'react';
import ReWardrobeLogo from './ReWardrobeLogo';

interface ReCircleSymbolProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCircle?: boolean;
}

export const ReCircleSymbol: React.FC<ReCircleSymbolProps> = ({ 
  size = 'md', 
  className = '',
  showCircle = false
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl'
  };

  const blue = "#38BDF8"; // Bright cyan/blue for dark theme

  return (
    <span className={`inline-flex items-center font-bold ${sizeClasses[size]} ${className}`}>
      <span style={{ color: blue }}>ReCircle</span>
    </span>
  );
};

export default ReCircleSymbol;