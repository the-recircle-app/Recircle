import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    vechain?: any;
    connex?: any;
    ethereum?: any;
  }
}

export default function VeWorldDebugger() {
  const [debugInfo, setDebugInfo] = useState<{
    vechain: boolean;
    connex: boolean;
    ethereum: boolean;
    userAgent: string;
    isHTTPS: boolean;
    chainId: number | null;
    accounts: string[];
    errors: string[];
  }>({
    vechain: false,
    connex: false,
    ethereum: false,
    userAgent: '',
    isHTTPS: false,
    chainId: null,
    accounts: [],
    errors: []
  });

  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkWalletProviders = async () => {
      const errors: string[] = [];
      let chainId: number | null = null;
      let accounts: string[] = [];

      try {
        // Check VeChain provider
        if (window.vechain) {
          try {
            // VeWorld API structure detection
            if (typeof window.vechain.request === 'function') {
              const result = await window.vechain.request({ method: 'eth_chainId' });
              chainId = parseInt(result, 16);
            } else if (window.vechain.thor) {
              // Connex-style API
              const genesis = await window.vechain.thor.genesis;
              chainId = genesis ? 39 : null; // Assume testnet if genesis exists
            } else if (window.vechain.network) {
              chainId = window.vechain.network.chainId || 39;
            } else {
              errors.push('VeChain API structure unknown - investigating available methods');
              console.log('VeChain object:', window.vechain);
              console.log('VeChain keys:', Object.keys(window.vechain));
              console.log('VeChain properties:', Object.getOwnPropertyNames(window.vechain));
              
              // Log each property type
              Object.keys(window.vechain).forEach(key => {
                console.log(`vechain.${key}:`, typeof window.vechain[key], window.vechain[key]);
              });
            }
          } catch (err) {
            errors.push(`VeChain chainId error: ${err}`);
          }

          try {
            if (typeof window.vechain.request === 'function') {
              const accs = await window.vechain.request({ method: 'eth_accounts' });
              accounts = accs || [];
            } else if (window.vechain.thor && window.vechain.thor.account) {
              // Connex-style account access
              const account = await window.vechain.thor.account.getSelected();
              accounts = account ? [account.address] : [];
            } else {
              errors.push('Unable to access accounts - checking available methods');
              console.log('VeChain complete object:', window.vechain);
              console.log('VeChain methods:', Object.keys(window.vechain));
              
              // Deep inspection of VeChain object
              Object.keys(window.vechain).forEach(key => {
                const prop = window.vechain[key];
                console.log(`vechain.${key}:`, typeof prop, prop);
                
                if (typeof prop === 'object' && prop !== null) {
                  console.log(`  ${key} properties:`, Object.keys(prop));
                  Object.keys(prop).forEach(subKey => {
                    console.log(`    ${key}.${subKey}:`, typeof prop[subKey], prop[subKey]);
                  });
                }
              });
            }
          } catch (err) {
            errors.push(`VeChain accounts error: ${err}`);
          }
        }

        setDebugInfo({
          vechain: typeof window.vechain !== 'undefined',
          connex: typeof window.connex !== 'undefined',
          ethereum: typeof window.ethereum !== 'undefined',
          userAgent: navigator.userAgent,
          isHTTPS: window.location.protocol === 'https:',
          chainId,
          accounts,
          errors
        });
      } catch (err) {
        setDebugInfo(prev => ({
          ...prev,
          errors: [...prev.errors, `General error: ${err}`]
        }));
      }
    };

    checkWalletProviders();
    
    // Retry every second for 10 seconds
    const interval = setInterval(checkWalletProviders, 1000);
    setTimeout(() => clearInterval(interval), 10000);
    
    return () => clearInterval(interval);
  }, []);

  const testVeChainConnection = async () => {
    if (!window.vechain) {
      alert('VeChain provider not available');
      return;
    }

    setIsConnecting(true);
    try {
      console.log('VeWorld object structure:', window.vechain);
      console.log('Available VeWorld methods:', Object.keys(window.vechain));
      
      let accounts: string[] = [];
      let chainId: number | null = null;
      
      // Try different VeWorld API patterns
      if (typeof window.vechain.request === 'function') {
        // Standard EIP-1193 pattern
        accounts = await window.vechain.request({ method: 'eth_requestAccounts' });
        const chainIdHex = await window.vechain.request({ method: 'eth_chainId' });
        chainId = parseInt(chainIdHex, 16);
      } else if (window.vechain.thor) {
        // Connex-style API
        const account = await window.vechain.thor.account.getSelected();
        accounts = account ? [account.address] : [];
        const genesis = await window.vechain.thor.genesis;
        chainId = genesis ? 39 : null;
      } else if (window.vechain.enable) {
        // Legacy enable pattern
        await window.vechain.enable();
        accounts = window.vechain.selectedAddress ? [window.vechain.selectedAddress] : [];
        chainId = window.vechain.chainId || 39;
      } else if (window.vechain.connect) {
        // Custom connect method
        const result = await window.vechain.connect();
        accounts = result.accounts || [];
        chainId = result.chainId || 39;
      } else {
        // Direct property access
        if (window.vechain.accounts) {
          accounts = window.vechain.accounts;
        }
        if (window.vechain.chainId) {
          chainId = window.vechain.chainId;
        }
      }
      
      console.log('Connection successful:', { accounts, chainId });
      
      setDebugInfo(prev => ({
        ...prev,
        chainId,
        accounts,
        errors: [...prev.errors, `Connection successful: ${accounts.length} accounts, chain ${chainId}`]
      }));
      
    } catch (err) {
      console.error('VeChain connection test failed:', err);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `Connection test failed: ${err}`]
      }));
    } finally {
      setIsConnecting(false);
    }
  };

  const isVeWorldBrowser = debugInfo.userAgent.includes('VeWorld') || 
                          debugInfo.userAgent.includes('veworld') ||
                          window.location.href.includes('veworld');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>VeWorld Wallet Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Wallet Providers</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={debugInfo.vechain ? "default" : "destructive"}>
                    window.vechain: {debugInfo.vechain ? "✅" : "❌"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={debugInfo.connex ? "default" : "secondary"}>
                    window.connex: {debugInfo.connex ? "✅" : "❌"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={debugInfo.ethereum ? "secondary" : "secondary"}>
                    window.ethereum: {debugInfo.ethereum ? "✅" : "❌"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Environment</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={debugInfo.isHTTPS ? "default" : "destructive"}>
                    HTTPS: {debugInfo.isHTTPS ? "✅" : "❌"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isVeWorldBrowser ? "default" : "secondary"}>
                    VeWorld Browser: {isVeWorldBrowser ? "✅" : "❌"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {debugInfo.chainId && (
            <div>
              <h4 className="font-semibold mb-2">Network Information</h4>
              <div className="flex items-center gap-2">
                <Badge variant={debugInfo.chainId === 39 ? "default" : "destructive"}>
                  Chain ID: {debugInfo.chainId} {debugInfo.chainId === 39 ? "(VeChain Testnet ✅)" : "(Wrong Network ❌)"}
                </Badge>
              </div>
            </div>
          )}

          {debugInfo.accounts.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Connected Accounts</h4>
              <div className="space-y-1">
                {debugInfo.accounts.map((account, index) => (
                  <div key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                    {account}
                  </div>
                ))}
              </div>
            </div>
          )}

          {debugInfo.vechain && (
            <Button 
              onClick={testVeChainConnection} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? "Testing Connection..." : "Test VeChain Connection"}
            </Button>
          )}

          {debugInfo.errors.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-red-600">Errors</h4>
              <div className="space-y-1">
                {debugInfo.errors.map((error, index) => (
                  <div key={index} className="p-2 bg-red-100 dark:bg-red-900/20 rounded text-sm">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">User Agent</h4>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono break-all">
              {debugInfo.userAgent}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}