export interface PlatformInfo {
  isVeWorld: boolean;
  isDesktop: boolean;
  isMobile: boolean;
  platformName: string;
}

export function detectPlatform(): PlatformInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  
  const hasConnex = typeof window !== 'undefined' && 'connex' in window;
  
  const isVeWorld = 
    hasConnex ||
    userAgent.includes('veworld') || 
    userAgent.includes('sync2');
  
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
