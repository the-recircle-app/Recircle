import React from 'react';
import { Link, useLocation } from 'wouter';
import B3trLogo from './B3trLogo';

interface BottomNavigationProps {
  isConnected?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ isConnected = false }) => {
  const [location] = useLocation();
  const blue = "#38BDF8"; // Bright cyan/blue for dark theme

  const navItems = [
    {
      label: 'Home',
      path: '/home',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? blue : '#718096'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      label: 'Scan',
      path: '/scan',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? blue : '#718096'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
          <circle cx="12" cy="13" r="3"></circle>
        </svg>
      )
    },
    {
      label: 'Achievements',
      path: '/achievements',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? blue : '#718096'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
      )
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? blue : '#718096'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
    {
      label: 'Tokens',
      path: '/transactions',
      icon: (active: boolean) => (
        <div className="relative">
          <div className={`rounded-full ${active ? 'bg-blue-900/50' : 'bg-gray-700'} p-1 flex items-center justify-center`}>
            <B3trLogo className="w-4 h-4" color={active ? blue : '#718096'} />
          </div>
        </div>
      )
    },
  ];

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    // Allow Home navigation always
    if (path === '/') {
      return;
    }
    
    // For other tabs, if wallet not connected, prevent navigation and scroll to top
    if (!isConnected) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around items-center p-2 z-10">
      {navItems.map((item) => {
        const isActive = location === item.path;
        
        // If wallet not connected and not home, use div with click handler
        if (!isConnected && item.path !== '/') {
          return (
            <div 
              key={item.path} 
              className="flex flex-col items-center py-1 px-3 cursor-pointer"
              onClick={(e) => handleNavClick(item.path, e)}
            >
              {item.icon(isActive)}
              <span className={`text-xs mt-1 ${isActive ? 'text-blue-300 font-medium' : 'text-gray-400'}`}>{item.label}</span>
            </div>
          );
        }
        
        // Otherwise use normal Link
        return (
          <Link key={item.path} href={item.path}>
            <div className="flex flex-col items-center py-1 px-3 cursor-pointer">
              {item.icon(isActive)}
              <span className={`text-xs mt-1 ${isActive ? 'text-blue-300 font-medium' : 'text-gray-400'}`}>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavigation;