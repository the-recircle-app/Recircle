export interface PlatformInfo {
  isVeWorld: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  platformName: string;
}

export function detectPlatform(): PlatformInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  
  const hasConnex = typeof window !== 'undefined' && 'connex' in window;
  
  // Case-insensitive check for VeWorld indicators
  const isVeWorld = 
    hasConnex ||
    /veworld|sync2|vechain/i.test(navigator.userAgent);
  
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
  
  console.log('[PLATFORM-DETECTION]', {
    userAgent,
    hasConnex,
    isVeWorld,
    isMobile,
    isDesktop,
    platformName,
  });
  
  return {
    isVeWorld,
    isDesktop,
    isMobile,
    platformName
  };
}

export function shouldShowVeWorldWarning(): boolean {
  const platform = detectPlatform();
  return !platform.isVeWorld;
}
