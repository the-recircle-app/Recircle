import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useWallet as useAppWallet } from "../context/WalletContext";

// VeChain builders academy best practices for wallet connection

interface VeWorldConnectorProps {
  onConnect?: () => void;
}

const VeWorldConnector: React.FC<VeWorldConnectorProps> = ({ onConnect }) => {
  const { connect, isConnected, address, disconnect } = useAppWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVeWorldAvailable, setIsVeWorldAvailable] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    // Check if VeWorld is available - run once on mount only
    const checkVeWorld = () => {
      const vechain = (window as any).vechain;
      const connex = (window as any).connex;
      
      const userAgent = navigator.userAgent;
      const isVeWorldMobile = userAgent.includes('VeWorld') || userAgent.includes('veworld');
      
      // More comprehensive VeWorld detection
      const hasVeWorldContext = !!(
        vechain || 
        connex || 
        isVeWorldMobile ||
        (window as any).thor ||
        (typeof (window as any).ethereum !== 'undefined' && (window as any).ethereum.isVeWorld)
      );
      
      // Special handling for VeWorld mobile browser
      if (isVeWorldMobile) {
        console.log('[VEWORLD] VeWorld mobile browser detected in user agent');
        // Always consider VeWorld available if we're in the mobile browser
        setIsVeWorldAvailable(true);
        
        // Wait a bit for VeWorld providers to initialize
        setTimeout(() => {
          const recheckVechain = (window as any).vechain;
          const recheckConnex = (window as any).connex;
          console.log('[VEWORLD] After delay - vechain:', !!recheckVechain, 'connex:', !!recheckConnex);
        }, 1000);
        
        return;
      }
      
      setIsVeWorldAvailable(hasVeWorldContext);
      
      if (vechain) {
        console.log('[VEWORLD] VeWorld extension detected');
      } else if (connex) {
        console.log('[VEWORLD] VeWorld browser detected via Connex');
      } else {
        console.log('[VEWORLD] VeWorld not detected');
      }
    };

    checkVeWorld();
    
    // Re-check VeWorld availability after a delay to catch late-loading providers
    const recheckTimer = setTimeout(checkVeWorld, 2000);
    
    return () => clearTimeout(recheckTimer);
  }, []);

  // Reset connection state when wallet is disconnected
  useEffect(() => {
    if (!isConnected) {
      setIsConnecting(false);
      setConnectionAttempts(0);
    }
  }, [isConnected]);

  const handleConnect = async () => {
    if (!isVeWorldAvailable) {
      alert('VeWorld wallet not detected. Please install VeWorld extension or use VeWorld browser.');
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      console.log('[VEWORLD] Connection already in progress, ignoring duplicate request');
      return;
    }

    setIsConnecting(true);
    setConnectionAttempts(prev => prev + 1);
    
    try {
      console.log(`[VEWORLD] === DESKTOP CONNECTION ATTEMPT ${connectionAttempts + 1} ===`);
      
      // Clear any previous connection state to ensure fresh connection
      localStorage.removeItem("veworld-connected");
      localStorage.removeItem("veworld-address");
      
      const vechain = (window as any).vechain;
      const connex = (window as any).connex;
      let accounts = null;

      // Check if we're in VeWorld mobile browser
      const userAgent = navigator.userAgent;
      const isVeWorldMobile = userAgent.includes('VeWorld') || userAgent.includes('veworld');

      console.log('[VEWORLD] VeWorld provider details:', {
        userAgent: navigator.userAgent,
        hasVechain: !!vechain,
        hasConnex: !!connex,
        vechainMethods: vechain ? Object.keys(vechain).filter(k => typeof vechain[k] === 'function') : [],
        connexMethods: connex ? Object.keys(connex) : [],
        connexVendor: connex && connex.vendor ? Object.keys(connex.vendor) : [],
        isConnected: isConnected,
        isVeWorldMobile: isVeWorldMobile
      });
      
      // Method 1: VeWorld Mobile Browser - Use Connex vendor API (preferred for mobile)
      if (isVeWorldMobile && connex && connex.vendor && connex.vendor.sign) {
        try {
          console.log('[VEWORLD] Using Connex vendor.sign for VeWorld mobile browser');
          
          const cert = await connex.vendor.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Connect to ReCircle - Sustainable Transportation Rewards'
            }
          }).request();
          
          if (cert && cert.annex && cert.annex.signer) {
            accounts = [cert.annex.signer];
            console.log('[VEWORLD] Connected via Connex cert signing:', accounts);
          }
        } catch (connecError) {
          console.log('[VEWORLD] Connex cert signing failed:', connecError);
        }
      }
      
      // Method 2: VeWorld Extension - Use newConnexSigner (recommended for desktop)
      if (!accounts && vechain && typeof vechain.newConnexSigner === 'function') {
        try {
          console.log('[VEWORLD] Using VeWorld newConnexSigner (builders academy)');
          const signer = vechain.newConnexSigner('main');
          const account = await signer.connect();
          accounts = [account.address];
          console.log('[VEWORLD] Connected via newConnexSigner:', accounts);
        } catch (signerError) {
          console.log('[VEWORLD] newConnexSigner failed:', signerError);
        }
      }

      // Method 3: Standard EIP-1193 for any VeWorld environment
      if (!accounts && vechain && vechain.request) {
        try {
          accounts = await vechain.request({ method: 'eth_requestAccounts' });
          console.log('[VEWORLD] Connected via eth_requestAccounts:', accounts);
        } catch (error) {
          try {
            accounts = await vechain.request({ method: 'vet_requestAccounts' });
            console.log('[VEWORLD] Connected via vet_requestAccounts:', accounts);
          } catch (vetError) {
            console.log('[VEWORLD] Extension connection failed:', vetError);
          }
        }
      }
      
      // Method 4: Fallback Connex cert signing (if not VeWorld mobile)
      if (!accounts && !isVeWorldMobile && connex && connex.vendor && connex.vendor.sign) {
        try {
          console.log('[VEWORLD] Using Connex vendor.sign fallback');
          
          const cert = await connex.vendor.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Connect to ReCircle - Sustainable Transportation Rewards'
            }
          }).request();
          
          if (cert && cert.annex && cert.annex.signer) {
            accounts = [cert.annex.signer];
            console.log('[VEWORLD] Connected via Connex cert signing fallback:', accounts);
          }
        } catch (connecError) {
          console.log('[VEWORLD] Connex cert signing fallback failed:', connecError);
        }
      }

      if (accounts && accounts.length > 0) {
        const selectedAccount = accounts[0];
        console.log('[VEWORLD] Connection successful, account:', selectedAccount);
        
        // Call the app wallet connect with the obtained account
        console.log('[VEWORLD] Calling app wallet connect with:', selectedAccount);
        const success = await connect('VeWorld', selectedAccount, { skipCelebration: false });
        console.log('[VEWORLD] App wallet connect result:', success);
        
        if (onConnect) {
          onConnect();
        }
      } else {
        throw new Error('Failed to obtain wallet accounts');
      }
      
    } catch (error) {
      console.error('[VEWORLD] Connection error:', error);
      
      // Provide more specific error message based on what we found
      let errorMessage = 'Failed to connect to VeWorld. ';
      
      if (!window.connex && !window.vechain) {
        errorMessage += 'VeWorld providers not found. Please ensure you are using the VeWorld mobile browser.';
      } else if (error instanceof Error) {
        errorMessage += `Connection error: ${error.message}`;
      } else {
        errorMessage += 'Please make sure you have VeWorld installed and try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected && address) {
    return (
      <div className="text-center p-4">
        <div className="text-green-600 font-medium">Wallet Connected</div>
        <div className="text-sm text-gray-600 mt-1 mb-3">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button 
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Button 
        onClick={handleConnect}
        disabled={isConnecting || !isVeWorldAvailable}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isConnecting ? 'Connecting...' : 'Connect VeWorld Wallet'}
      </Button>
      {!isVeWorldAvailable && (
        <p className="text-sm text-red-500 mt-2">
          VeWorld not detected. Please install VeWorld extension or use VeWorld browser.
        </p>
      )}
    </div>
  );
};

export default VeWorldConnector;