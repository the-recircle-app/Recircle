// Environment configuration for development vs production features
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Feature flags for development-only features
export const featureFlags = {
  // Development tools
  showUserSwitcher: isDevelopment,
  showDataResetButton: isDevelopment,
  showAdminButton: false, // Disabled for production
  showTestMode: isDevelopment,
  showSampleReceipts: isDevelopment,
  showDevLogs: isDevelopment,
  showDevTools: isDevelopment,
  
  // API endpoints
  enableTestEndpoints: isDevelopment,
  enableDevMiddleware: isDevelopment,
  
  // UI elements
  showEnvironmentBadge: isDevelopment,
  showDebugInfo: isDevelopment,
  
  // Default user behavior
  useDefaultUser: false, // Force real wallet connection for testing
  allowUserSwitching: isDevelopment,
} as const;

// Environment-specific constants
export const environment = {
  mode: isDevelopment ? 'development' : 'production',
  apiUrl: isDevelopment ? 'http://localhost:5000' : '',
  defaultUserId: isDevelopment ? 1 : null, // No default user in production
} as const;

// Helper functions
export const shouldShowDevFeature = (feature: keyof typeof featureFlags): boolean => {
  return featureFlags[feature];
};

export const getEnvironmentConfig = () => ({
  isDevelopment,
  isProduction,
  ...environment,
  features: featureFlags,
});