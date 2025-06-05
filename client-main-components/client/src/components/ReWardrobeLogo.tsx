import React from 'react';

interface ReWardrobeLogoProps {
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

const ReWardrobeLogo: React.FC<ReWardrobeLogoProps> = ({ 
  className = '', 
  color = '#38BDF8',
  style = {}
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* 5-sided clothing tag shape - sideways, more elongated */}
      <path
        d="M4 8L8 6H20C20.5523 6 21 6.44772 21 7V16C21 16.5523 20.5523 17 20 17H8L4 15V8Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Hole for string in middle of left side */}
      <circle
        cx="4"
        cy="11.5"
        r="0.8"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
      
      {/* Squiggly string coming from middle left (mouse tail style) */}
      <path
        d="M4 11.5C2.5 11.5 2 10.5 1.5 9C1 7.5 1 6 2 5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Lines on tag to represent text */}
      <line
        x1="10"
        y1="9"
        x2="18"
        y2="9"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
      
      <line
        x1="10"
        y1="11.5"
        x2="18"
        y2="11.5"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
      
      <line
        x1="10"
        y1="14"
        x2="16"
        y2="14"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ReWardrobeLogo;