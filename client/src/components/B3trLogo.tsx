import React from 'react';

interface B3trLogoProps {
  className?: string;
  color?: string;
}

const B3trLogo: React.FC<React.SVGProps<SVGSVGElement> & B3trLogoProps> = ({ 
  className = '',
  color = 'currentColor',
  ...props 
}) => {
  return (
    <svg 
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path 
        d="M25,30 C40,20 60,22 65,32 C70,42 55,47 40,47 
           L70,47 C85,47 90,57 85,67 C78,78 60,82 40,77 C30,74 20,70 15,65" 
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(-10, 50, 50)"
      />
    </svg>
  );
};

export default B3trLogo;