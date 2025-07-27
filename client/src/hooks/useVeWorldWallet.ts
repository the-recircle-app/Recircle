import { useEffect, useState, useRef } from 'react';

// Add TypeScript declaration for the clearVeWorldWallet global function
declare global {
  interface Window {
    clearVeWorldWallet?: () => void;
    connex?: any;
    vechain?: any;
  }
}

// Maximum time to wait for Connex in production before showing the fallback option
const MAX_WAIT_TIME_MS = 5000; // 5 seconds

export function useVeWorldWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnexReady, setIsConnexReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isCheckingConnex, setIsCheckingConnex] = useState(true);

  // Use ref to track the timeout
  const checkTimeoutRef = useRef<number | null>(null);

  // Cleanup function to clear any timers
  const clearTimers = () => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }
  };

  // Check if VeWorld is available (using newConnexSigner method)
  useEffect(() => {
    let checkCount = 0;
    const maxChecks = 10; // Try 10 times before giving up

    const checkVeWorld = () => {
      // Check for any VeWorld indicators
      const userAgent = navigator.userAgent.toLowerCase();
      const isVeWorldUserAgent = userAgent.includes('veworld') || userAgent.includes('vechain');
      
      console.log('VeWorld detection check:', {
        userAgent: navigator.userAgent,
        isVeWorldUserAgent,
        hasConnex: !!window.connex,
        hasVechain: !!window.vechain,
        hasNewConnexSigner: !!(window.vechain && window.vechain.newConnexSigner)
      });
      
      // Check for VeWorld mobile browser first (uses standard Connex)
      if (isVeWorldUserAgent && window.connex) {
        console.log("VeWorld mobile browser detected via user agent + Connex");
        setIsConnexReady(true);
        setIsCheckingConnex(false);
        clearTimers();
        return;
      }
      
      // Check for traditional Connex (standard VeWorld browser)
      if (window.connex) {
        console.log("Traditional Connex detected");
        setIsConnexReady(true);
        setIsCheckingConnex(false);
        clearTimers();
        return;
      }
      
      // Check for VeWorld's newConnexSigner method (desktop extension)
      if (window.vechain && window.vechain.newConnexSigner) {
        console.log("VeWorld desktop extension detected via newConnexSigner");
        setIsConnexReady(true);
        setIsCheckingConnex(false);
        clearTimers();
        return;
      }
      
      // Check for any VeChain object
      if (window.vechain) {
        console.log("VeChain object detected");
        setIsConnexReady(true);
        setIsCheckingConnex(false);
        clearTimers();
        return;
      }
      
      // Check for VeWorld user agent even without objects (give it time to load)
      if (isVeWorldUserAgent) {
        console.log("VeWorld user agent detected, waiting for objects to load...");
        // Don't set ready immediately, let it check a few more times
        return;
      }

      // Increment check counter
      checkCount++;
      
      // For development environment, create a mock after 2 seconds (only if not in VeWorld browser)
      if (process.env.NODE_ENV === 'development') {
        // Check if we're in actual VeWorld browser first
        const userAgent = navigator.userAgent;
        const isVeWorldMobile = userAgent.includes('VeWorld') || userAgent.includes('veworld');
        
        if (!isVeWorldMobile && checkCount === 1) { // Only do this once and not in VeWorld
          console.log("Development mode: Creating mock Connex after delay");
          checkTimeoutRef.current = window.setTimeout(() => {
            // Double-check VeWorld isn't available before creating mocks
            if (window.connex || window.vechain) {
              console.log("Real VeWorld providers found - aborting mock creation");
              setIsConnexReady(true);
              setIsCheckingConnex(false);
              return;
            }
            
            console.log("Creating mock Connex for development");
            window.connex = {
              thor: {
                account: {
                  getSelected: async () => {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return { address: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686' };
                  }
                }
              }
            } as any;
            setIsConnexReady(true);
            setIsCheckingConnex(false);
          }, 2000);
        }
      } else {
        // In production, only check for a limited time
        if (checkCount < maxChecks) {
          console.log(`Waiting for VeWorld Connex... (attempt ${checkCount}/${maxChecks})`);
          checkTimeoutRef.current = window.setTimeout(checkVeWorld, 500);
        } else {
          // After max attempts, stop checking and show a button to retry
          console.log("VeWorld Connex not found after multiple attempts");
          setIsCheckingConnex(false);
          // Don't set an error here, as we'll handle this in the UI
        }
      }
    };

    // Start checking for VeWorld
    checkVeWorld();

    // Overall timeout for production
    if (process.env.NODE_ENV !== 'development') {
      checkTimeoutRef.current = window.setTimeout(() => {
        console.log("Timed out waiting for VeWorld");
        setIsCheckingConnex(false);
      }, MAX_WAIT_TIME_MS);
    }

    // Cleanup on unmount
    return clearTimers;
  }, []);

  // Auto reconnect from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress') || localStorage.getItem('connectedWallet');
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
    
    // Register the global disconnect function
    window.clearVeWorldWallet = () => {
      console.log("Global wallet disconnect called");
      setWalletAddress(null);
      setConnectionError(null);
    };
    
    // Cleanup on unmount
    return () => {
      window.clearVeWorldWallet = undefined;
    };
  }, []);

  // Force a check for Connex - useful if user installs/opens VeWorld after initially loading the page
  const checkForConnex = () => {
    if (window.connex) {
      console.log("VeWorld Connex found on manual check");
      setIsConnexReady(true);
      return true;
    }
    
    console.log("VeWorld Connex still not available");
    setConnectionError("VeWorld wallet not available. Please open in the VeWorld in-app browser.");
    return false;
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      console.log('=== VeWorld Connection Attempt ===');
      console.log('User Agent:', navigator.userAgent);
      console.log('Window.connex available:', !!window.connex);
      console.log('Window.vechain available:', !!window.vechain);
      
      // Check for cached wallet first
      const cachedAddress = localStorage.getItem('walletAddress');
      if (cachedAddress && cachedAddress.length === 42) {
        console.log('Using cached wallet address:', cachedAddress);
        setWalletAddress(cachedAddress);
        setIsConnecting(false);
        return;
      }
      
      // Detect VeWorld mobile browser vs desktop extension
      const userAgent = navigator.userAgent.toLowerCase();
      const isVeWorldMobile = userAgent.includes('veworld') || userAgent.includes('vechain');
      
      // Method 1: VeWorld Mobile Browser - Use Connex API directly
      if (isVeWorldMobile && window.connex && window.connex.vendor) {
        console.log('VeWorld Mobile Browser detected - using Connex vendor method');
        try {
          const cert = window.connex.vendor.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Connect to ReCircle for B3TR rewards'
            }
          });
          
          const result = await cert.request();
          if (result && result.annex && result.annex.signer) {
            const address = result.annex.signer;
            console.log('VeWorld Mobile Browser connection successful:', address);
            setWalletAddress(address);
            localStorage.setItem('walletAddress', address);
            setConnectionError(null);
            setIsConnecting(false);
            return;
          }
        } catch (error) {
          console.warn('VeWorld Mobile Browser method failed:', error);
        }
      }
      
      // Method 2: Desktop Extension - Use newConnexSigner (VeWorld 2.0+)
      if (!isVeWorldMobile && window.vechain && window.vechain.newConnexSigner) {
        console.log('Using VeWorld newConnexSigner method for desktop');
        try {
          const connex = window.vechain.newConnexSigner();
          
          if (connex && connex.vendor && connex.vendor.sign) {
            const timestamp = Date.now();
            const cert = connex.vendor.sign('cert', {
              purpose: 'identification',
              payload: {
                type: 'text',
                content: `Connect to ReCircle for B3TR rewards - ${timestamp}`
              }
            });
            
            const result = await cert.request();
            if (result && result.annex && result.annex.signer) {
              const address = result.annex.signer;
              console.log('VeWorld newConnexSigner connection successful:', address);
              setWalletAddress(address);
              localStorage.setItem('walletAddress', address);
              setConnectionError(null);
              setIsConnecting(false);
              return;
            }
          }
        } catch (error) {
          console.warn('NewConnexSigner method failed:', error);
        }
      }
      
      // Method 3: Fallback Traditional Connex (VeWorld 1.x)
      if (window.connex && window.connex.vendor) {
        console.log('Using fallback traditional Connex vendor method');
        try {
          const cert = window.connex.vendor.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Connect to ReCircle for B3TR rewards'
            }
          });
          
          const result = await cert.request();
          if (result && result.annex && result.annex.signer) {
            const address = result.annex.signer;
            console.log('Traditional Connex connection successful:', address);
            setWalletAddress(address);
            localStorage.setItem('walletAddress', address);
            setConnectionError(null);
            setIsConnecting(false);
            return;
          }
        } catch (error) {
          console.warn('Traditional Connex method failed:', error);
        }
      }
      
      // Method 3: Legacy VeChain object
      if (window.vechain && window.vechain.sign) {
        console.log('Using legacy VeChain sign method');
        try {
          const result = await window.vechain.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Connect to ReCircle'
            }
          });
          
          if (result && result.annex && result.annex.signer) {
            const address = result.annex.signer;
            console.log('Legacy VeChain connection successful:', address);
            setWalletAddress(address);
            localStorage.setItem('walletAddress', address);
            setConnectionError(null);
            setIsConnecting(false);
            return;
          }
        } catch (error) {
          console.warn('Legacy VeChain method failed:', error);
        }
      }
      
      // Method 4: Generic VeChain integration
      if (window.vechain) {
        console.log('Attempting generic VeChain connection');
        try {
          // Try to call any available connection method
          if (typeof window.vechain.connect === 'function') {
            await window.vechain.connect();
          }
          
          // Check if account info is now available
          if (window.vechain.account) {
            const address = window.vechain.account;
            console.log('Generic VeChain connection successful:', address);
            setWalletAddress(address);
            localStorage.setItem('walletAddress', address);
            setConnectionError(null);
            setIsConnecting(false);
            return;
          }
        } catch (error) {
          console.warn('Generic VeChain method failed:', error);
        }
      }
      
      // If we get here, no connection method worked
      console.error('All VeWorld connection methods failed');
      setConnectionError('Unable to connect to VeWorld wallet. Please ensure VeWorld is unlocked and try refreshing the page.');
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setConnectionError(`Connection failed: ${error.message || 'Please ensure VeWorld is unlocked and try again'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect function to clear the wallet state
  const disconnectWallet = () => {
    // Clear the wallet address from state
    setWalletAddress(null);
    
    // Remove from localStorage (both keys for backward compatibility)
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('connectedWallet');
    
    console.log("Wallet connection cleared from useVeWorldWallet");
  };

  return {
    walletAddress,
    isConnexReady,
    isConnecting,
    connectionError,
    connectWallet,
    disconnectWallet,
    isCheckingConnex,
    checkForConnex
  };
}