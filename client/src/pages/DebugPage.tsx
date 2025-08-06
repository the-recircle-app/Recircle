import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Extend window interface for wallet providers
interface WindowWithWallet extends Window {
  connex?: any;
  vechain?: any;
  [key: string]: any;
}

export function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const collectDebugInfo = () => {
    setIsRefreshing(true);
    const win = window as WindowWithWallet;
    
    const info: any = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      
      // VeChain/Connex Detection
      connexExists: typeof win.connex !== 'undefined',
      vechainExists: typeof win.vechain !== 'undefined',
      connexVersion: win.connex?.version || 'Not found',
      
      // Environment Detection
      isVeWorld: navigator.userAgent.includes('VeWorld'),
      isSync2: navigator.userAgent.includes('Sync2'),
      isSync: navigator.userAgent.includes('Sync'),
      
      // Browser Detection
      isChrome: navigator.userAgent.includes('Chrome'),
      isSafari: navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'),
      isFirefox: navigator.userAgent.includes('Firefox'),
      isEdge: navigator.userAgent.includes('Edge'),
      
      // Wallet State
      walletProviders: [],
      connexMethods: [],
      
      // Network Detection
      url: window.location.href,
      protocol: window.location.protocol,
      host: window.location.host,
    };

    // Check for wallet providers
    if (win.connex) {
      try {
        info.connexMethods = Object.keys(win.connex);
        info.thorInfo = win.connex.thor ? {
          genesisId: win.connex.thor.genesis?.id || 'Unknown',
          status: win.connex.thor.status || 'Unknown'
        } : 'Thor not available';
      } catch (e: any) {
        info.connexError = e?.message || 'Unknown error';
      }
    }

    if (win.vechain) {
      info.walletProviders.push('window.vechain');
    }

    // Check for DAppKit providers
    const dappKitProviders = ['veworld', 'sync2', 'sync'];
    dappKitProviders.forEach(provider => {
      if (win[provider]) {
        info.walletProviders.push(provider);
      }
    });

    setDebugInfo(info);
    setIsRefreshing(false);
  };

  const testWalletConnection = async () => {
    const results: any = { tests: [] };
    const win = window as WindowWithWallet;
    
    try {
      // Test Connex availability
      if (win.connex) {
        results.tests.push({
          name: 'Connex Available',
          status: 'PASS',
          details: `Version: ${win.connex.version}`
        });
        
        // Test Thor availability
        if (win.connex.thor) {
          results.tests.push({
            name: 'Thor Available', 
            status: 'PASS',
            details: `Genesis: ${win.connex.thor.genesis?.id || 'Unknown'}`
          });
        } else {
          results.tests.push({
            name: 'Thor Available',
            status: 'FAIL', 
            details: 'Thor not found in Connex'
          });
        }
        
        // Test Vendor availability  
        if (win.connex.vendor) {
          results.tests.push({
            name: 'Vendor Available',
            status: 'PASS',
            details: 'Vendor methods accessible'
          });
          
          // Test sign method
          try {
            const signMethod = win.connex.vendor.sign;
            results.tests.push({
              name: 'Sign Method Available',
              status: signMethod ? 'PASS' : 'FAIL',
              details: signMethod ? 'Sign method found' : 'Sign method missing'
            });
          } catch (e: any) {
            results.tests.push({
              name: 'Sign Method Test',
              status: 'ERROR',
              details: e?.message || 'Unknown error'
            });
          }
        } else {
          results.tests.push({
            name: 'Vendor Available',
            status: 'FAIL',
            details: 'Vendor not found in Connex'
          });
        }
      } else {
        results.tests.push({
          name: 'Connex Available',
          status: 'FAIL',
          details: 'Connex not found on window object'
        });
      }
      
    } catch (error: any) {
      results.tests.push({
        name: 'Wallet Connection Test',
        status: 'ERROR',
        details: error?.message || 'Unknown error'
      });
    }
    
    setDebugInfo((prev: any) => ({ ...prev, walletTests: results }));
  };

  useEffect(() => {
    collectDebugInfo();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'bg-green-500';
      case 'FAIL': return 'bg-red-500'; 
      case 'ERROR': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Mobile Debug Console
            <div className="space-x-2">
              <Button 
                onClick={collectDebugInfo}
                disabled={isRefreshing}
                size="sm"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Info'}
              </Button>
              <Button
                onClick={testWalletConnection}
                size="sm"
                variant="outline"
              >
                Test Wallet
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Device Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Device Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div><strong>Platform:</strong> {debugInfo.isMobile ? 'Mobile' : 'Desktop'}</div>
                <div><strong>Screen:</strong> {debugInfo.screenSize}</div>
                <div><strong>Browser:</strong> {
                  debugInfo.isChrome ? 'Chrome' :
                  debugInfo.isSafari ? 'Safari' :
                  debugInfo.isFirefox ? 'Firefox' :
                  debugInfo.isEdge ? 'Edge' : 'Unknown'
                }</div>
                <div><strong>Environment:</strong> {
                  debugInfo.isVeWorld ? 'VeWorld' :
                  debugInfo.isSync2 ? 'Sync2' :
                  debugInfo.isSync ? 'Sync' : 'Browser'
                }</div>
              </CardContent>
            </Card>

            {/* Wallet Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Wallet Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div><strong>Connex:</strong> {debugInfo.connexExists ? '✅ Available' : '❌ Missing'}</div>
                <div><strong>Version:</strong> {debugInfo.connexVersion}</div>
                <div><strong>Providers:</strong> {debugInfo.walletProviders?.join(', ') || 'None'}</div>
                <div><strong>Methods:</strong> {debugInfo.connexMethods?.slice(0, 3)?.join(', ')}...</div>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Tests */}
          {debugInfo.walletTests && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Wallet Connection Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {debugInfo.walletTests.tests.map((test: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{test.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-white ${getStatusColor(test.status)}`}>
                        {test.status}
                      </Badge>
                      <span className="text-xs text-gray-600">{test.details}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Raw Debug Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Raw Debug Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}