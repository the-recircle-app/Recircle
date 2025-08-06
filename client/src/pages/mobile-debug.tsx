import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MobileDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`[MOBILE-DEBUG] ${message}`);
  };

  useEffect(() => {
    addLog("Mobile debug page loaded");
    
    // Check for VeWorld providers
    const checkProviders = () => {
      addLog(`User Agent: ${navigator.userAgent}`);
      addLog(`Window.connex available: ${!!window.connex}`);
      addLog(`Window.vechain available: ${!!window.vechain}`);
      
      if (window.connex) {
        addLog(`Connex version: ${window.connex.version}`);
        addLog(`Connex thor available: ${!!window.connex.thor}`);
        addLog(`Connex vendor available: ${!!window.connex.vendor}`);
      }
      
      if (window.vechain) {
        const vechain = (window as any).vechain;
        addLog(`VeChain selectedAddress: ${vechain.selectedAddress}`);
        addLog(`VeChain isConnected: ${vechain.isConnected}`);
        addLog(`VeChain request method: ${typeof vechain.request}`);
        addLog(`VeChain enable method: ${typeof vechain.enable}`);
      }
    };
    
    checkProviders();
    
    // Check again after a delay
    setTimeout(checkProviders, 1000);
  }, []);

  // VeChain Builders Academy Pattern
  const connectVeWorldMobile = async () => {
    setIsConnecting(true);
    addLog("Starting VeChain Builders Academy connection pattern");
    
    try {
      // Wait for providers
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const connex = (window as any).connex;
      
      if (!connex) {
        addLog("ERROR: No Connex provider found");
        alert("Please open this page in VeWorld mobile browser");
        return;
      }

      addLog("Connex provider found, attempting certificate signing");
      
      // VeChain Builders Academy Certificate Pattern
      const certResult = await connex.vendor.sign('cert', {
        purpose: 'identification',
        payload: {
          type: 'text',
          content: 'Connect to ReCircle for sustainable transportation rewards'
        }
      }).request();
      
      addLog(`Certificate result received: ${JSON.stringify(certResult, null, 2)}`);
      
      if (certResult && certResult.annex && certResult.annex.signer) {
        const walletAddress = certResult.annex.signer;
        addLog(`SUCCESS: Wallet connected - ${walletAddress}`);
        
        setWalletInfo({
          address: walletAddress,
          cert: certResult
        });
        
        // Now check balance using VeChain Thor
        await checkB3TRBalance(walletAddress);
        
      } else {
        addLog("ERROR: No signer address in certificate result");
      }
      
    } catch (error) {
      addLog(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Mobile connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const checkB3TRBalance = async (address: string) => {
    try {
      addLog(`Checking B3TR balance for ${address}`);
      
      const response = await fetch(`/api/wallet/balance/${address}`);
      const data = await response.json();
      
      addLog(`Balance API response: ${JSON.stringify(data, null, 2)}`);
      
    } catch (error) {
      addLog(`Balance check error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-white">Mobile Wallet Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={connectVeWorldMobile}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isConnecting ? "Connecting..." : "Connect VeWorld Mobile"}
          </Button>
          
          {walletInfo && (
            <div className="p-3 bg-green-900/30 rounded border border-green-700">
              <p className="text-green-400 text-sm font-medium">Connected:</p>
              <p className="text-green-300 text-xs break-all">{walletInfo.address}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </div>
          
          <div className="bg-black p-3 rounded text-xs text-green-400 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p>No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}