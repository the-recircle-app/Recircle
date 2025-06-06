// Production deployment configuration
// This file ensures all dev features are hidden in production builds

import { featureFlags, isDevelopment, isProduction } from './environment';

// Production safety check - logs what features are enabled/disabled
export const logProductionStatus = () => {
  if (isDevelopment) {
    console.log('[DEV MODE] Development features enabled:', {
      userSwitcher: featureFlags.showUserSwitcher,
      adminButton: featureFlags.showAdminButton,
      sampleReceipts: featureFlags.showSampleReceipts,
      dataReset: featureFlags.showDataResetButton,
      devTools: featureFlags.showDevTools
    });
  } else {
    console.log('[PRODUCTION MODE] All development features disabled');
  }
};

// Component wrapper that only renders children in development
export const DevOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return featureFlags.showDevTools ? <>{children}</> : null;
};

// Conditional rendering helper
export const ifDev = (devContent: any, prodContent: any = null) => {
  return isDevelopment ? devContent : prodContent;
};

// Production-safe user initialization
export const getInitialUserId = (): number | null => {
  if (isProduction) {
    // In production, users must connect wallet - no default user
    return null;
  } else {
    // In development, allow default user for testing
    const storedUserId = localStorage.getItem("userId");
    return storedUserId ? parseInt(storedUserId) : 1;
  }
};

// Environment-aware API endpoints
export const getApiEndpoint = (path: string): string => {
  const baseUrl = isProduction ? '' : 'http://localhost:5000';
  return `${baseUrl}${path}`;
};