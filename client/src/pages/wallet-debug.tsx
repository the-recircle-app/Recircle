import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function WalletDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkEnvironment = () => {
      const info = {
        // Environment checks
        isHTTPS: window.location.protocol === 'https:',
        currentURL: window.location.href,
        userAgent: navigator.userAgent,
        
        // VeWorld detection
        hasConnex: typeof window.connex !== 'undefined',
        connexType: window.connex ? typeof window.connex : 'undefined',
        
        // Network information
        isVeWorldBrowser: /VeWorld/i.test(navigator.userAgent),
        isInAppBrowser: /VeWorld|VeChain/i.test(navigator.userAgent),
        
        // Connex details
        connexDetails: window.connex ? {
          thorGenesis: window.connex.thor?.genesis?.id || 'unknown',
          version: window.connex.version || 'unknown',
          isMainnet: window.connex.thor?.genesis?.id === '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
          isTestnet: window.connex.thor?.genesis?.id === '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127'
        } : null,

        // Environment variables
        envVars: {
          appId: import.meta.env.VITE_TESTNET_APP_ID,
          creatorWallet: import.meta.env.VITE_CREATOR_FUND_WALLET,
          appWallet: import.meta.env.VITE_APP_FUND_WALLET,
          googleMapsKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'configured' : 'missing'
        }
      };
      
      setDebugInfo(info);
      setIsChecking(false);
    };

    // Check immediately and then every 2 seconds for connex injection
    checkEnvironment();
    const interval = setInterval(checkEnvironment, 2000);
    
    // Stop checking after 20 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsChecking(false);
    }, 20000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const testWalletConnection = async () => {
    if (!window.connex) {
      alert('Connex not available');
      return;
    }

    try {
      const account = await window.connex.thor.account.getSelected();
      alert(`Account: ${account?.address || 'No account selected'}`);
    } catch (error: any) {
      alert(`Error: ${error.message || 'Unknown error'}`);
    }
  };

  const StatusIcon = ({ condition }: { condition: boolean }) => (
    condition ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            VeWorld Wallet Debug Information
            {isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Environment Status */}
          <div>
            <h3 className="font-semibold mb-3">Environment Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <StatusIcon condition={debugInfo.isHTTPS} />
                <span>HTTPS Connection</span>
                <Badge variant={debugInfo.isHTTPS ? "default" : "destructive"}>
                  {debugInfo.isHTTPS ? "Secure" : "Insecure"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <StatusIcon condition={debugInfo.hasConnex} />
                <span>Connex Provider</span>
                <Badge variant={debugInfo.hasConnex ? "default" : "destructive"}>
                  {debugInfo.hasConnex ? "Available" : "Missing"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <StatusIcon condition={debugInfo.isVeWorldBrowser} />
                <span>VeWorld Browser</span>
                <Badge variant={debugInfo.isVeWorldBrowser ? "default" : "destructive"}>
                  {debugInfo.isVeWorldBrowser ? "Detected" : "Not Detected"}
                </Badge>
              </div>
            </div>
          </div>

          {/* URL Information */}
          <div>
            <h3 className="font-semibold mb-3">Connection Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Current URL:</strong> {debugInfo.currentURL}</p>
              <p><strong>User Agent:</strong> {debugInfo.userAgent}</p>
            </div>
          </div>

          {/* Network Information */}
          {debugInfo.connexDetails && (
            <div>
              <h3 className="font-semibold mb-3">VeChain Network</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <StatusIcon condition={debugInfo.connexDetails.isTestnet} />
                  <span>VeChain Testnet</span>
                  <Badge variant={debugInfo.connexDetails.isTestnet ? "default" : "destructive"}>
                    {debugInfo.connexDetails.isTestnet ? "Connected" : "Wrong Network"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Genesis ID:</span>
                  <Badge variant="secondary">
                    {debugInfo.connexDetails.thorGenesis.slice(0, 10)}...
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Environment Variables */}
          <div>
            <h3 className="font-semibold mb-3">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <StatusIcon condition={!!debugInfo.envVars?.appId} />
                <span>APP_ID</span>
                <Badge variant={debugInfo.envVars?.appId ? "default" : "destructive"}>
                  {debugInfo.envVars?.appId ? "Configured" : "Missing"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <StatusIcon condition={!!debugInfo.envVars?.creatorWallet} />
                <span>Creator Wallet</span>
                <Badge variant={debugInfo.envVars?.creatorWallet ? "default" : "destructive"}>
                  {debugInfo.envVars?.creatorWallet ? "Configured" : "Missing"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div className="pt-4">
            <Button 
              onClick={testWalletConnection}
              disabled={!debugInfo.hasConnex}
              className="w-full"
            >
              Test Wallet Connection
            </Button>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Recommendations</h3>
            <ul className="text-sm space-y-1">
              {!debugInfo.isHTTPS && (
                <li>• Use HTTPS URL for VeWorld wallet connection</li>
              )}
              {!debugInfo.isVeWorldBrowser && (
                <li>• Open this page in VeWorld in-app browser</li>
              )}
              {!debugInfo.hasConnex && debugInfo.isHTTPS && (
                <li>• Ensure VeWorld app is up to date</li>
              )}
              {debugInfo.connexDetails && !debugInfo.connexDetails.isTestnet && (
                <li>• Switch to VeChain testnet in VeWorld settings</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}