import React from 'react';

interface ReCircleBaseLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

// Light Theme Logo (Black arrows)
export const ReCircleLogoLight: React.FC<ReCircleBaseLogoProps> = ({
  className = '',
  width = 32,
  height = 32
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 360 360" 
    width={width} 
    height={height}
    className={className}
  >
    <path 
      d="M60,180 A120,120 0 1,1 300,180" 
      stroke="black" 
      strokeWidth="16" 
      fill="none" 
      strokeLinecap="round" 
    />
    <polygon 
      points="55,180 75,165 75,195" 
      fill="black" 
    />
    <polygon 
      points="300,180 280,165 280,195" 
      fill="black" 
    />
  </svg>
);

// Dark Theme Logo (White arrows)
export const ReCircleLogoDark: React.FC<ReCircleBaseLogoProps> = ({
  className = '',
  width = 32,
  height = 32
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 360 360" 
    width={width} 
    height={height}
    className={className}
  >
    <path 
      d="M60,180 A120,120 0 1,1 300,180" 
      stroke="white" 
      strokeWidth="16" 
      fill="none" 
      strokeLinecap="round" 
    />
    <polygon 
      points="55,180 75,165 75,195" 
      fill="white" 
    />
    <polygon 
      points="300,180 280,165 280,195" 
      fill="white" 
    />
  </svg>
);

// Default Logo that switches based on theme
interface ReCircleLogoProps extends ReCircleBaseLogoProps {
  theme?: 'light' | 'dark';
}

export const ReCircleLogo: React.FC<ReCircleLogoProps> = ({
  className = '',
  width = 32,
  height = 32,
  theme = 'dark'
}) => {
  if (theme === 'light') {
    return <ReCircleLogoLight className={className} width={width} height={height} />;
  } else {
    return <ReCircleLogoDark className={className} width={width} height={height} />;
  }
};

export default ReCircleLogo;