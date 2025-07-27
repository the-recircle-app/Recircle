import React from 'react';

interface CircleArrowsProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CircleArrows: React.FC<CircleArrowsProps> = ({ 
  className = '', 
  color = 'white', 
  size = 'md'
}) => {
  const dimensions = {
    sm: 24,
    md: 32,
    lg: 48
  };

  const dimension = dimensions[size];
  
  return (
    <svg 
      width={dimension} 
      height={dimension} 
      viewBox="0 0 100 100" 
      className={className}
      aria-hidden="true"
    >
      {/* Single circular path with triangular arrowheads at both ends */}
      <path 
        d="M20,50 A30,30 0 1,1 80,50" 
        stroke={color} 
        strokeWidth="5" 
        fill="none"
      />
      
      {/* Left arrowhead */}
      <polygon 
        points="15,50 25,45 25,55" 
        fill={color}
      />
      
      {/* Right arrowhead */}
      <polygon 
        points="80,50 70,45 70,55" 
        fill={color}
      />
    </svg>
  );
};

export default CircleArrows;