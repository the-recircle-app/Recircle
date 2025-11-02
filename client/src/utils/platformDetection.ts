export interface PlatformInfo {
  isVeWorld: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  platformName: string;
}

export function detectPlatform(): PlatformInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // CRITICAL: Read window.connex to trigger VeWorld's lazy getter
  // Using 'connex' in window doesn't trigger injection
  const connex = typeof window !== 'undefined' ? (window as any).connex : undefined;
  const hasConnex = Boolean(connex);
  
  // Case-insensitive check for VeWorld indicators
  const userAgentMatch = /veworld|sync2|vechain/i.test(navigator.userAgent);
  const isVeWorld = hasConnex || userAgentMatch;
  
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  const isDesktop = !isMobile;
  
  let platformName = 'Unknown';
  if (isVeWorld) {
    platformName = 'VeWorld App';
  } else if (isDesktop) {
    platformName = 'Desktop Browser';
  } else if (isMobile) {
    platformName = 'Mobile Browser';
  }
  
  // Enhanced debug logging
  console.log('🔍 [PLATFORM-DETECTION] Full Debug:', {
    'Raw User Agent': navigator.userAgent,
    'Lowercase UA': userAgent,
    'Connex Object': connex ? 'Found ✅' : 'Not found ❌',
    'Has Connex': hasConnex,
    'User Agent Match (VeWorld/Sync2/VeChain)': userAgentMatch,
    'Final isVeWorld': isVeWorld,
    'Is Mobile': isMobile,
    'Is Desktop': isDesktop,
    'Platform Name': platformName,
  });
  
  return {
    isVeWorld,
    isDesktop,
    isMobile,
    platformName
  };
}

export function shouldShowVeWorldWarning(): boolean {
  // Detection disabled - allow all users to access the app
  // VeWorld users can connect via VeWorld wallet
  // Desktop/mobile users can use social login
  return false;
}
