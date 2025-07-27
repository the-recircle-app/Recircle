import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useWallet } from "../context/WalletContext";
import { connectVeWorldWallet } from "../utils/veworld-connector";

const VeWorldWalletConnect: React.FC = () => {
  const { isConnected, connect, disconnect, address, tokenBalance } = useWallet();
  const [status, setStatus] = useState('Checking...');
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    detectVeWorld();
  }, []);

  const detectVeWorld = async () => {
    console.log("[VEWORLD] Checking for VeWorld provider...");
    console.log("[VEWORLD] window.vechain type:", typeof (window as any).vechain);
    console.log("[VEWORLD] window.connex type:", typeof (window as any).connex);
    console.log("[VEWORLD] Current URL:", window.location.href);
    console.log("[VEWORLD] User agent:", navigator.userAgent);
    
    // Capture debug info for mobile display
    const debugData = {
      hasVechain: typeof (window as any).vechain !== 'undefined',
      hasConnex: typeof (window as any).connex !== 'undefined',
      selectedAddress: (window as any).vechain?.selectedAddress,
      hasEnable: typeof (window as any).vechain?.enable === 'function',
      hasRequest: typeof (window as any).vechain?.request === 'function',
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    setDebugInfo(debugData);
    
    // Check for VeChain provider
    if (typeof window !== 'undefined' && (window as any).vechain) {
      const provider = (window as any).vechain;
      console.log("[VEWORLD] VeWorld provider detected:", provider);
      console.log("[VEWORLD] Provider keys:", Object.keys(provider));
      console.log("[VEWORLD] Has newConnexSigner:", typeof provider.newConnexSigner);
      console.log("[VEWORLD] isVeWorld:", provider.isVeWorld);
      console.log("[VEWORLD] isInAppBrowser:", provider.isInAppBrowser);
      
      setStatus('🟢 VeWorld Detected');
      setChainId('0x27'); // VeChain testnet
      setStatus('🟡 Ready to connect...');
      setError(null);
    } 
    // Check for Connex as fallback
    else if (typeof window !== 'undefined' && (window as any).connex) {
      console.log("[VEWORLD] Connex provider detected as fallback");
      setStatus('🟢 VeChain Detected (Connex)');
      setChainId('0x27'); // VeChain testnet
      setStatus('🟡 Ready to connect...');
      setError(null);
    }
    // Development fallback - check if running in development mode
    else if (window.location.hostname.includes('picard.replit.dev') || window.location.hostname.includes('localhost')) {
      console.log("[VEWORLD] Development environment detected - showing deployment message");
      setStatus('🔴 Development Environment');
      setError('VeWorld providers only work on deployed domains. Click Deploy to test wallet connection.');
    }
    else {
      setStatus('🔴 VeWorld Not Detected');
      console.log("[VEWORLD] No VeChain provider found");
      setError('Please use VeWorld in-app browser or deploy app to production');
    }
  };

  const connectWallet = async () => {
    if (connecting) return;
    
    setConnecting(true);
    setError(null);
    
    try {
      console.log("[VEWORLD] Using stable connector...");
      const result = await connectVeWorldWallet();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.address) {
        console.log("[VEWORLD] Stable connector success:", result.address);
        await connect(result.address);
        setStatus('✅ Wallet Connected');
        setError(null);
      } else {
        throw new Error('No wallet address received');
      }
      
    } catch (err: any) {
      console.error("[VEWORLD] Connection error:", err);
      if (err.message && err.message.includes('rejected')) {
        setError('Connection cancelled by user');
      } else {
        setError('Connection failed: ' + (err.message || 'Unknown error'));
      }
      setStatus('🔴 Connection Failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setStatus('🟡 Ready to connect...');
    setError(null);
  };

  if (isConnected) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-bold text-green-400 mb-2">✅ Wallet Connected</h3>
          <p className="text-gray-300 text-sm mb-2">Address: {address}</p>
          <p className="text-gray-300 text-sm mb-4">Balance: {tokenBalance} B3TR</p>
          <Button onClick={handleDisconnect} variant="outline" size="sm">
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-100 mb-2">Connect Your VeChain Wallet</h3>
        <p className="text-gray-300 text-sm mb-4">
          Connect your wallet to start earning B3TR rewards for sustainable transportation
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {status.includes('Ready') && !isConnected && (
          <Button 
            onClick={connectWallet} 
            disabled={connecting}
            className="w-full"
          >
            {connecting ? 'Connecting...' : 'Connect VeWorld Wallet'}
          </Button>
        )}
        
        {status.includes('Development Environment') && (
          <div className="text-center">
            <p className="text-yellow-400 text-sm mb-3">Development Environment Detected</p>
            <p className="text-gray-300 text-xs mb-4">VeWorld providers only inject on deployed domains. Deploy to test wallet connection.</p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.open('https://docs.replit.com/hosting/deployments/about-deployments', '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Deploy App Instructions
              </Button>
              <Button 
                onClick={detectVeWorld}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Retry Detection
              </Button>
            </div>
          </div>
        )}
        
        {status.includes('Not Detected') && !status.includes('Development') && (
          <div className="text-center">
            <p className="text-yellow-400 text-sm mb-2">VeWorld browser required</p>
            <Button 
              onClick={detectVeWorld}
              variant="outline"
              size="sm"
            >
              Retry Detection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VeWorldWalletConnect;