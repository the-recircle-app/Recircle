import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface DebugInfo {
  userAgent: string;
  windowConnex: boolean;
  windowVechain: boolean;
  isVeWorld: boolean;
  connexMethods: string[];
  vechainMethods: string[];
  errors: string[];
  logs: string[];
}

export default function DebugWallet() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    userAgent: '',
    windowConnex: false,
    windowVechain: false,
    isVeWorld: false,
    connexMethods: [],
    vechainMethods: [],
    errors: [],
    logs: []
  });
  const [testResult, setTestResult] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string) => {
    setDebugInfo(prev => ({
      ...prev,
      logs: [...prev.logs, `${new Date().toLocaleTimeString()}: ${message}`]
    }));
  };

  const addError = (message: string) => {
    setDebugInfo(prev => ({
      ...prev,
      errors: [...prev.errors, `${new Date().toLocaleTimeString()}: ${message}`]
    }));
  };

  useEffect(() => {
    // Initial environment scan
    const scan = () => {
      const userAgent = navigator.userAgent;
      const windowConnex = !!window.connex;
      const windowVechain = !!window.vechain;
      const isVeWorld = userAgent.toLowerCase().includes('veworld') || 
                       userAgent.toLowerCase().includes('vechain') ||
                       (window.vechain && window.vechain.isVeWorld);

      // Scan Connex methods
      const connexMethods: string[] = [];
      if (window.connex) {
        Object.getOwnPropertyNames(window.connex).forEach(prop => {
          connexMethods.push(`connex.${prop}`);
        });
        if (window.connex.vendor) {
          Object.getOwnPropertyNames(window.connex.vendor).forEach(prop => {
            connexMethods.push(`connex.vendor.${prop}`);
          });
        }
      }

      // Scan VeChain methods with detailed inspection
      const vechainMethods: string[] = [];
      if (window.vechain) {
        Object.getOwnPropertyNames(window.vechain).forEach(prop => {
          const type = typeof window.vechain[prop];
          vechainMethods.push(`vechain.${prop} (${type})`);
        });
        
        // Also check prototype methods
        const proto = Object.getPrototypeOf(window.vechain);
        if (proto && proto !== Object.prototype) {
          Object.getOwnPropertyNames(proto).forEach(prop => {
            if (prop !== 'constructor') {
              const type = typeof proto[prop];
              vechainMethods.push(`vechain.${prop} (${type}) [proto]`);
            }
          });
        }
      }

      setDebugInfo({
        userAgent,
        windowConnex,
        windowVechain,
        isVeWorld,
        connexMethods,
        vechainMethods,
        errors: [],
        logs: [`Environment scan completed at ${new Date().toLocaleTimeString()}`]
      });
    };

    scan();
    
    // Re-scan every 2 seconds to catch delayed injections
    const interval = setInterval(scan, 2000);
    return () => clearInterval(interval);
  }, []);

  const testConnexConnection = async () => {
    setIsRunning(true);
    setTestResult('');
    addLog('Starting Connex connection test...');

    try {
      if (!window.connex) {
        addError('window.connex is not available');
        setTestResult('FAILED: No Connex object found');
        return;
      }

      addLog('Found window.connex object');

      if (!window.connex.vendor) {
        addError('window.connex.vendor is not available');
        setTestResult('FAILED: No Connex vendor found');
        return;
      }

      addLog('Found window.connex.vendor object');

      if (!window.connex.vendor.sign) {
        addError('window.connex.vendor.sign is not available');
        setTestResult('FAILED: No Connex vendor.sign method found');
        return;
      }

      addLog('Found window.connex.vendor.sign method');
      addLog('Attempting to create certificate signing request...');

      const cert = window.connex.vendor.sign('cert', {
        purpose: 'identification',
        payload: {
          type: 'text',
          content: `ReCircle Debug Test - ${Date.now()}`
        }
      });

      addLog('Certificate request created, awaiting user approval...');

      const result = await cert.request();
      addLog(`Certificate result received: ${JSON.stringify(result, null, 2)}`);

      if (result && result.annex && result.annex.signer) {
        const address = result.annex.signer;
        addLog(`SUCCESS: Connected to wallet address ${address}`);
        setTestResult(`SUCCESS: Connected to ${address}`);
      } else {
        addError('Certificate result missing signer address');
        setTestResult('FAILED: No signer address in result');
      }

    } catch (error: any) {
      const errorMsg = error.message || error.toString();
      addError(`Connection test failed: ${errorMsg}`);
      setTestResult(`FAILED: ${errorMsg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testVeChainConnection = async () => {
    setIsRunning(true);
    setTestResult('');
    addLog('Starting VeChain connection test...');

    try {
      if (!window.vechain) {
        addError('window.vechain is not available');
        setTestResult('FAILED: No VeChain object found');
        return;
      }

      addLog('Found window.vechain object');
      
      // Log all available methods for debugging
      const methods = Object.getOwnPropertyNames(window.vechain);
      addLog(`Available methods: ${methods.join(', ')}`);
      
      // Check what each method returns
      methods.forEach(method => {
        try {
          const value = window.vechain[method];
          const type = typeof value;
          addLog(`vechain.${method}: ${type} ${type === 'function' ? '' : `= ${value}`}`);
        } catch (e) {
          addLog(`vechain.${method}: error accessing`);
        }
      });

      // Test newConnexSigner method
      if (window.vechain.newConnexSigner) {
        addLog('Testing newConnexSigner method...');
        try {
          const connex = window.vechain.newConnexSigner();
          if (connex && connex.vendor && connex.vendor.sign) {
            addLog('newConnexSigner created valid connex object');
            
            const cert = connex.vendor.sign('cert', {
              purpose: 'identification',
              payload: {
                type: 'text',
                content: `ReCircle VeChain Debug Test - ${Date.now()}`
              }
            });

            const result = await cert.request();
            if (result && result.annex && result.annex.signer) {
              const address = result.annex.signer;
              addLog(`SUCCESS: newConnexSigner connected to ${address}`);
              setTestResult(`SUCCESS: newConnexSigner connected to ${address}`);
              return;
            }
          }
        } catch (error: any) {
          addError(`newConnexSigner failed: ${error.message}`);
        }
      }

      // Test direct VeChain sign method
      if (window.vechain.sign) {
        addLog('Testing direct VeChain sign method...');
        try {
          const result = await window.vechain.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: `ReCircle Direct VeChain Test - ${Date.now()}`
            }
          });

          if (result && result.annex && result.annex.signer) {
            const address = result.annex.signer;
            addLog(`SUCCESS: Direct VeChain sign connected to ${address}`);
            setTestResult(`SUCCESS: Direct VeChain sign connected to ${address}`);
            return;
          }
        } catch (error: any) {
          addError(`Direct VeChain sign failed: ${error.message}`);
        }
      }

      addError('No working VeChain connection methods found');
      setTestResult('FAILED: No working VeChain connection methods');

    } catch (error: any) {
      const errorMsg = error.message || error.toString();
      addError(`VeChain connection test failed: ${errorMsg}`);
      setTestResult(`FAILED: ${errorMsg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setDebugInfo(prev => ({
      ...prev,
      logs: [],
      errors: []
    }));
    setTestResult('');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">VeWorld Wallet Debug Center</h1>
        <p className="text-muted-foreground">
          Comprehensive debugging tools for VeWorld wallet connection issues
        </p>
      </div>

      {/* Environment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>User Agent:</strong>
            <p className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
              {debugInfo.userAgent}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <strong>VeWorld Browser:</strong>
              <Badge variant={debugInfo.isVeWorld ? "default" : "secondary"}>
                {debugInfo.isVeWorld ? "YES" : "NO"}
              </Badge>
            </div>
            <div>
              <strong>window.connex:</strong>
              <Badge variant={debugInfo.windowConnex ? "default" : "secondary"}>
                {debugInfo.windowConnex ? "YES" : "NO"}
              </Badge>
            </div>
            <div>
              <strong>window.vechain:</strong>
              <Badge variant={debugInfo.windowVechain ? "default" : "secondary"}>
                {debugInfo.windowVechain ? "YES" : "NO"}
              </Badge>
            </div>
            <div>
              <strong>Total Methods:</strong>
              <Badge variant="outline">
                {debugInfo.connexMethods.length + debugInfo.vechainMethods.length}
              </Badge>
            </div>
          </div>

          {debugInfo.connexMethods.length > 0 && (
            <div>
              <strong>Available Connex Methods:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {debugInfo.connexMethods.map((method, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {debugInfo.vechainMethods.length > 0 && (
            <div>
              <strong>Available VeChain Methods:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {debugInfo.vechainMethods.map((method, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testConnexConnection}
              disabled={isRunning || !debugInfo.windowConnex}
              className="flex-1"
            >
              {isRunning ? 'Testing...' : 'Test Connex Connection'}
            </Button>
            <Button 
              onClick={testVeChainConnection}
              disabled={isRunning || !debugInfo.windowVechain}
              variant="outline"
              className="flex-1"
            >
              {isRunning ? 'Testing...' : 'Test VeChain Connection'}
            </Button>
            <Button onClick={clearLogs} variant="ghost">
              Clear Logs
            </Button>
          </div>

          {testResult && (
            <div className={`p-3 rounded border ${
              testResult.startsWith('SUCCESS') ? 'bg-green-50 border-green-200 text-green-800' :
              'bg-red-50 border-red-200 text-red-800'
            }`}>
              <strong>Test Result:</strong> {testResult}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={[...debugInfo.logs, ...debugInfo.errors].join('\n')}
            readOnly
            className="min-h-[300px] font-mono text-sm"
            placeholder="Debug logs will appear here..."
          />
          <div className="mt-2 flex gap-2">
            <Button 
              onClick={() => {
                const logText = [...debugInfo.logs, ...debugInfo.errors].join('\n');
                navigator.clipboard.writeText(logText).then(() => {
                  alert('Debug logs copied to clipboard!');
                }).catch(() => {
                  // Fallback for older browsers
                  const textarea = document.createElement('textarea');
                  textarea.value = logText;
                  document.body.appendChild(textarea);
                  textarea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textarea);
                  alert('Debug logs copied to clipboard!');
                });
              }}
              variant="outline"
              size="sm"
            >
              Copy Logs
            </Button>
            <Button 
              onClick={() => {
                // Send logs to server for permanent storage
                fetch('/api/debug-logs', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    logs: [...debugInfo.logs, ...debugInfo.errors],
                    userAgent: debugInfo.userAgent,
                    timestamp: new Date().toISOString()
                  })
                }).then(() => {
                  alert('Debug logs saved to server!');
                }).catch(() => {
                  alert('Failed to save logs to server');
                });
              }}
              variant="outline"
              size="sm"
            >
              Save to Server
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Persistent Log Display */}
      <Card>
        <CardHeader>
          <CardTitle>Persistent Debug Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-4 bg-black text-green-400 font-mono text-sm rounded border">
              <div>User Agent: {debugInfo.userAgent}</div>
              <div>VeWorld Browser: {debugInfo.isVeWorld ? 'YES' : 'NO'}</div>
              <div>window.connex: {debugInfo.windowConnex ? 'YES' : 'NO'}</div>
              <div>window.vechain: {debugInfo.windowVechain ? 'YES' : 'NO'}</div>
              <div>Available Methods: {debugInfo.connexMethods.length + debugInfo.vechainMethods.length}</div>
              {testResult && (
                <div className="mt-2 p-2 border-t border-green-600">
                  <div className="font-bold">Last Test Result:</div>
                  <div>{testResult}</div>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              This information won't disappear and can be easily copied to share with developers.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Open browser console (F12) and try these commands manually:
          </p>
          <div className="space-y-2 font-mono text-sm bg-muted p-4 rounded">
            <div>console.log('Connex:', window.connex)</div>
            <div>console.log('VeChain:', window.vechain)</div>
            <div>console.log('User Agent:', navigator.userAgent)</div>
            <div>window.connex?.vendor.sign('cert', {'{'} purpose: 'identification' {'}'})</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}