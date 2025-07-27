import React from 'react';

type B3trSize = 'sm' | 'md' | 'lg' | 'xl';

interface B3trSymbolProps extends React.SVGProps<SVGSVGElement> {
  size?: B3trSize;
  showCircle?: boolean;
}

// Size mapping
const sizeMap: Record<B3trSize, number> = {
  sm: 24,
  md: 40,
  lg: 64,
  xl: 96
};

const B3trSymbol: React.FC<B3trSymbolProps> = ({
  size = 'md',
  showCircle = false,
  className = '',
  ...props
}) => {
  const svgSize = sizeMap[size];
  
  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {showCircle && (
        <circle cx="50" cy="50" r="46" fill="#000C22" stroke="url(#gradient)" strokeWidth="4" />
      )}
      
      {/* B3TR Symbol */}
      <path
        d="M30 25H55C61.6274 25 67 30.3726 67 37V37C67 43.6274 61.6274 49 55 49H35"
        stroke="url(#gradient)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M30 49H60C66.6274 49 72 54.3726 72 61V61C72 67.6274 66.6274 73 60 73H35"
        stroke="url(#gradient)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M30 73H40C46.6274 73 52 67.6274 52 61V61C52 54.3726 46.6274 49 40 49H30"
        stroke="url(#gradient)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="15" y1="25" x2="85" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" /> {/* blue-500 */}
          <stop offset="1" stopColor="#8B5CF6" /> {/* purple-500 */}
        </linearGradient>
      </defs>
    </svg>
  );
};

// Export as both named and default export for compatibility
export { B3trSymbol };
export default B3trSymbol;