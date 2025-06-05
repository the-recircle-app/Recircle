import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function MinimalConnect() {
  const [logs, setLogs] = useState<string[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnex, setIsConnex] = useState(false);
  const [isThor, setIsThor] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a log message with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(message);
  };

  // Get environment info
  const getEnvironmentInfo = () => {
    const hasConnex = typeof window.connex !== 'undefined';
    const hasThor = hasConnex && typeof window.connex.thor !== 'undefined';
    
    setIsConnex(hasConnex);
    setIsThor(hasThor);
    
    addLog(`Page loaded with readyState: ${document.readyState}`);
    addLog(`window.connex available: ${hasConnex}`);
    addLog(`window.connex.thor available: ${hasThor}`);
    addLog(`Current URL: ${window.location.href}`);
    addLog(`Protocol: ${window.location.protocol}`);
    addLog(`User Agent: ${navigator.userAgent}`);
  };

  // Connect to wallet
  const connectWallet = async () => {
    setError(null);
    addLog('Connect button clicked');
    
    try {
      if (!window.connex) {
        addLog('No window.connex available');
        setError('VeWorld wallet not detected. Please use VeWorld browser.');
        return;
      }
      
      addLog('window.connex is available');
      
      if (!window.connex.thor) {
        addLog('window.connex.thor is not available');
        setError('VeWorld Thor not available. Please check your browser.');
        return;
      }
      
      const vendorAsset = { 
        purpose: 'identification', 
        payload: { 
          type: 'text', 
          content: 'Connect to ReCircle Rewards' 
        } 
      };
      
      try {
        addLog('Calling window.connex.thor.account.getSelected()');
        const account = await window.connex.thor.account.getSelected();
        
        if (account && account.address) {
          const address = account.address;
          addLog(`Wallet connected: ${address}`);
          setWalletAddress(address);
          setIsConnected(true);
          
          // Save to localStorage
          localStorage.setItem('minimal_wallet', address);
        } else {
          addLog('No account selected or account missing address');
          setError('No wallet selected. Please select your wallet in VeWorld.');
        }
      } catch (error) {
        const certErr = error as Error;
        addLog(`Certificate error: ${certErr.message || String(certErr)}`);
        
        try {
          addLog('Trying certificate signing fallback');
          const certResponse = await window.connex.vendor.sign('cert', vendorAsset).request();
          if (certResponse && certResponse.annex && certResponse.annex.signer) {
            const address = certResponse.annex.signer;
            addLog(`Wallet connected via cert signing: ${address}`);
            setWalletAddress(address);
            setIsConnected(true);
            
            // Save to localStorage
            localStorage.setItem('minimal_wallet', address);
          } else {
            addLog('Certificate signing completed but no signer found');
            setError('Failed to identify wallet. Please try again.');
          }
        } catch (error) {
          const vendorErr = error as Error;
          addLog(`Vendor signing error: ${vendorErr.message || String(vendorErr)}`);
          setError('Connection failed. Could not sign identification certificate.');
        }
      }
    } catch (error) {
      const err = error as Error;
      addLog(`Error: ${err.message || String(err)}`);
      setError(`Connection failed: ${err.message || 'Unknown error'}`);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    localStorage.removeItem('minimal_wallet');
    setWalletAddress(null);
    setIsConnected(false);
    addLog('Wallet disconnected');
  };

  // Update environment status every second to check for connex appearance
  useEffect(() => {
    const savedWallet = localStorage.getItem('minimal_wallet');
    if (savedWallet) {
      addLog(`Found saved wallet: ${savedWallet}`);
      setWalletAddress(savedWallet);
      setIsConnected(true);
    }
    
    getEnvironmentInfo();
    
    const intervalId = setInterval(() => {
      const hasConnex = typeof window.connex !== 'undefined';
      const hasThor = hasConnex && typeof window.connex.thor !== 'undefined';
      
      if (hasConnex !== isConnex || hasThor !== isThor) {
        setIsConnex(hasConnex);
        setIsThor(hasThor);
        addLog(`Connex status changed - Available: ${hasConnex}, Thor: ${hasThor}`);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isConnex, isThor]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Minimal VeWorld Connection Test</h1>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment Info</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-400">Connex Available:</div>
          <div className={isConnex ? "text-green-400" : "text-red-400"}>
            {isConnex ? "Yes ✓" : "No ✗"}
          </div>
          
          <div className="text-gray-400">Thor Available:</div>
          <div className={isThor ? "text-green-400" : "text-red-400"}>
            {isThor ? "Yes ✓" : "No ✗"}
          </div>
          
          <div className="text-gray-400">Protocol:</div>
          <div className={window.location.protocol === "https:" ? "text-green-400" : "text-yellow-400"}>
            {window.location.protocol}
          </div>
        </div>
      </div>
      
      {!isConnected ? (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
          <Button 
            onClick={connectWallet}
            disabled={!isConnex}
            variant="default"
            className="w-full py-2"
          >
            {isConnex ? "Connect VeWorld Wallet" : "Waiting for VeWorld..."}
          </Button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-950 border border-green-700 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-green-400 mb-2">Connected!</h2>
          <p className="mb-4 font-mono text-sm break-all">{walletAddress}</p>
          <Button 
            onClick={disconnectWallet}
            variant="destructive"
            className="w-full"
          >
            Disconnect
          </Button>
        </div>
      )}
      
      <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-80 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2 text-white">Connection Logs</h2>
        {logs.map((log, index) => (
          <div key={index} className="mb-1">{log}</div>
        ))}
      </div>
    </div>
  );
}

// No need to redeclare window.connex as it's defined elsewhere in the project