import React from 'react';
import ReCircleLogo from './ReCircleLogo';
import ReCircleSymbol from './ReCircleSymbol';
import ReCircleTextLogo from './ReCircleTextLogo';
import ReCircleLogoIntegrated from './ReCircleLogoIntegrated';
import ReCircleBrandLogo from './ReCircleBrandLogo';
import ReCircleLogoEarth from './ReCircleLogoEarth';
import B3trLogo from './B3trLogo';
import LiveB3TRBalance from './LiveB3TRBalance';
import { Link } from 'wouter';
import { featureFlags } from '../lib/environment';

interface HeaderProps {
  className?: string;
  streak?: number;
  gems?: number;
  useIntegratedLogo?: boolean;
  useEarthColors?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  className = '',
  streak = 0,
  gems = 0,
  useIntegratedLogo = true,
  useEarthColors = true // Default to using earth colors
}) => {
  const blue = "#1565C0"; // Rich blue color
  
  const highlightBlue = "#38BDF8"; // Bright cyan/blue for dark theme
  
  return (
    <header className={`bg-gray-800 py-3 px-6 shadow-sm border-b border-gray-700 ${className}`} style={{ marginBottom: '-1px' }}>
      <div className="flex items-center justify-between">
        {/* Left side: Brand Logo */}
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              {useEarthColors ? (
                <ReCircleLogoEarth size="md" variant="gradient" />
              ) : useIntegratedLogo ? (
                <ReCircleLogoIntegrated size="md" colorScheme="white" />
              ) : (
                <ReCircleTextLogo size="md" colorScheme="white" />
              )}
            </div>
          </Link>
          
          {/* Dev Admin Link - only visible during development */}
          {featureFlags.showAdminButton && (
            <Link href="/admin/pending-submissions">
              <div className="ml-4 px-2 py-1 bg-purple-900/40 hover:bg-purple-800/60 text-xs text-purple-300 border border-purple-700/30 rounded cursor-pointer transition-colors">
                Admin
              </div>
            </Link>
          )}
        </div>
        
        {/* Right side: Streaks and currency */}
        <div className="flex items-center space-x-3">
          {/* Streak counter (calendar icon) */}
          <div className="flex items-center bg-gradient-to-r from-orange-900/60 to-red-900/60 rounded-full px-3 py-1 hover:from-orange-800/60 hover:to-red-800/60 transition-colors cursor-help border border-orange-700/30" title={`${streak} day streak - keep scanning receipts daily!`}>
            <svg 
              className="w-5 h-5 text-orange-400 mr-1" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
              <text x="8" y="19" fontSize="8" fontWeight="bold" fill="currentColor">
                {streak}
              </text>
            </svg>
            <div className="flex flex-col items-start">
              <span className="font-bold text-orange-300 leading-none text-base">{streak}</span>
              <span className="text-orange-300/70 text-[10px] leading-none mt-[1px]">streak</span>
            </div>
          </div>
          
          {/* Gems counter (B3TR tokens) */}
          <div className="flex items-center bg-gradient-to-r from-blue-900/60 to-blue-700/60 rounded-full px-3 py-1 hover:from-blue-800/60 hover:to-blue-600/60 transition-colors cursor-help border border-blue-700/30" title="B3TR tokens earned from activities">
            <div className="flex items-center justify-center w-5 h-5 mr-1">
              <B3trLogo className="w-4 h-4" color={highlightBlue} />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-blue-300 leading-none text-base">
                <LiveB3TRBalance fallbackBalance={gems} />
              </span>
              <span className="text-blue-300/70 text-[10px] leading-none mt-[1px]">B3TR</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;