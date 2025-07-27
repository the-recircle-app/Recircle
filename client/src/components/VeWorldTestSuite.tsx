import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Wallet, Smartphone, Globe, Code } from "lucide-react";

export default function VeWorldTestSuite() {
  const [testResults, setTestResults] = useState({
    hasVeChain: false,
    hasConnex: false,
    isVeWorldBrowser: false,
    walletAddress: null as string | null,
    apiDetails: {} as any
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runVeWorldTests = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog("Starting VeWorld compatibility tests...");

    try {
      // Test 1: Check for VeChain object
      const hasVeChain = typeof (window as any).vechain !== 'undefined';
      addLog(`VeChain object: ${hasVeChain ? 'FOUND' : 'NOT FOUND'}`);

      // Test 2: Check for Connex object  
      const hasConnex = typeof (window as any).connex !== 'undefined';
      addLog(`Connex object: ${hasConnex ? 'FOUND' : 'NOT FOUND'}`);

      // Test 3: Browser detection
      const userAgent = navigator.userAgent;
      const isVeWorldBrowser = userAgent.includes('VeWorld') || userAgent.includes('vechain');
      addLog(`Browser: ${isVeWorldBrowser ? 'VeWorld detected' : 'Regular browser'}`);
      addLog(`User Agent: ${userAgent.slice(0, 100)}...`);

      // Test 4: API exploration
      let apiDetails = {};
      if (hasVeChain) {
        const vechain = (window as any).vechain;
        apiDetails = {
          vechain: {
            keys: Object.keys(vechain),
            type: typeof vechain,
            hasRequest: typeof vechain.request === 'function',
            hasAccount: 'account' in vechain,
            hasAddress: 'address' in vechain
          }
        };
        addLog(`VeChain API has ${Object.keys(vechain).length} properties`);
      }

      if (hasConnex) {
        const connex = (window as any).connex;
        apiDetails = {
          ...apiDetails,
          connex: {
            keys: Object.keys(connex),
            hasVendor: 'vendor' in connex,
            hasThor: 'thor' in connex,
            vendorKeys: connex.vendor ? Object.keys(connex.vendor) : []
          }
        };
        addLog(`Connex API has ${Object.keys(connex).length} properties`);
      }

      // Test 5: Try to get wallet address
      let walletAddress = null;
      if (hasVeChain) {
        const vechain = (window as any).vechain;
        if (vechain.address) {
          walletAddress = vechain.address;
          addLog(`Found address in vechain.address: ${walletAddress}`);
        } else if (vechain.account) {
          walletAddress = vechain.account;
          addLog(`Found address in vechain.account: ${walletAddress}`);
        }
      }

      if (!walletAddress && hasConnex) {
        const connex = (window as any).connex;
        if (connex.vendor && connex.vendor.sign) {
          try {
            addLog("Attempting Connex vendor authentication...");
            const cert = connex.vendor.sign('cert', {
              purpose: 'identification',
              payload: {
                type: 'text',
                content: 'VeWorld Test Authentication'
              }
            });
            
            const result = await cert.request();
            if (result && result.annex && result.annex.signer) {
              walletAddress = result.annex.signer;
              addLog(`Connex auth successful: ${walletAddress}`);
            }
          } catch (err) {
            addLog(`Connex auth failed: ${err}`);
          }
        }
      }

      setTestResults({
        hasVeChain,
        hasConnex,
        isVeWorldBrowser,
        walletAddress,
        apiDetails
      });

      addLog("Test suite completed!");

    } catch (error) {
      addLog(`Test error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runVeWorldTests();
  }, []);

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => (
    <Badge variant={condition ? "default" : "secondary"}>
      {condition ? trueText : falseText}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            VeWorld Compatibility Test
          </CardTitle>
          <CardDescription>
            Comprehensive testing of VeWorld wallet integration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm">VeChain API:</span>
              {getStatusBadge(testResults.hasVeChain, "Available", "Missing")}
            </div>
            
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Connex API:</span>
              {getStatusBadge(testResults.hasConnex, "Available", "Missing")}
            </div>
            
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="text-sm">VeWorld Browser:</span>
              {getStatusBadge(testResults.isVeWorldBrowser, "Detected", "Regular Browser")}
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Wallet Address:</span>
              {getStatusBadge(!!testResults.walletAddress, "Connected", "Not Connected")}
            </div>
          </div>

          {testResults.walletAddress && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Wallet Connected:</strong> {testResults.walletAddress}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={runVeWorldTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? "Running Tests..." : "Rerun Tests"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {Object.keys(testResults.apiDetails).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-md overflow-x-auto">
              {JSON.stringify(testResults.apiDetails, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expected Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-green-600">✓ In VeWorld App:</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• VeChain API: Available</li>
              <li>• Connex API: Available</li>
              <li>• VeWorld Browser: Detected</li>
              <li>• Wallet Address: Connected</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-600">⚠ In Regular Browser:</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• VeChain API: Missing</li>
              <li>• Connex API: Missing</li>
              <li>• VeWorld Browser: Regular Browser</li>
              <li>• Wallet Address: Not Connected</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}