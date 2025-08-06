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
      isInApp: navigator.userAgent.includes('VeWorld') || navigator.userAgent.includes('Sync'),
      
      // Mobile-specific checks
      touchSupport: 'ontouchstart' in window,
      orientation: screen.orientation?.type || 'unknown',
      
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
      
      // Mobile wallet specific checks
      hasVeWorldBridge: typeof (win as any).vechain?.request === 'function',
      veWorldMethods: (win as any).vechain ? Object.keys((win as any).vechain) : [],
      dappKitStatus: typeof (win as any).DAppKit !== 'undefined',
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

    // Check for DAppKit providers and mobile-specific providers
    const dappKitProviders = ['veworld', 'sync2', 'sync', 'DAppKit'];
    dappKitProviders.forEach(provider => {
      if (win[provider]) {
        info.walletProviders.push(provider);
      }
    });
    
    // Mobile wallet bridge checks
    if ((win as any).vechain?.request) {
      info.walletProviders.push('VeWorld Bridge');
    }
    
    // Check for ReCircle-specific wallet state
    const localStorage = win.localStorage;
    if (localStorage) {
      try {
        info.storedWalletData = {
          hasStoredWallet: !!localStorage.getItem('wallet_address'),
          hasConnexState: !!localStorage.getItem('connex_state'),
          walletEvents: localStorage.getItem('wallet_events')?.length || 0
        };
      } catch (e) {
        info.storageError = 'Cannot access localStorage';
      }
    }

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
            
            // Test certificate method for mobile wallet
            const certMethod = win.connex.vendor.sign('cert');
            results.tests.push({
              name: 'Certificate Method Available',
              status: certMethod ? 'PASS' : 'FAIL',
              details: certMethod ? 'Certificate method found' : 'Certificate method missing'
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
      
      // Test VeWorld mobile bridge
      if ((win as any).vechain?.request) {
        try {
          results.tests.push({
            name: 'VeWorld Bridge Available',
            status: 'PASS',
            details: 'VeWorld request method found'
          });
          
          // Test accounts method
          const accounts = (win as any).vechain.request({ method: 'eth_accounts' });
          results.tests.push({
            name: 'Accounts Method Test',
            status: accounts ? 'PASS' : 'FAIL',
            details: accounts ? 'Can request accounts' : 'Cannot request accounts'
          });
        } catch (e: any) {
          results.tests.push({
            name: 'VeWorld Bridge Test',
            status: 'ERROR',
            details: e?.message || 'Bridge test failed'
          });
        }
      } else {
        results.tests.push({
          name: 'VeWorld Bridge Available',
          status: 'FAIL',
          details: 'VeWorld bridge not found - mobile connection may be broken'
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
            Mobile Wallet Connection Debug
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
                  debugInfo.isVeWorld ? 'VeWorld App' :
                  debugInfo.isSync2 ? 'Sync2 App' :
                  debugInfo.isSync ? 'Sync App' : 'Mobile Browser'
                }</div>
                <div><strong>In-App:</strong> {debugInfo.isInApp ? '✅ Yes' : '❌ No'}</div>
                <div><strong>Touch:</strong> {debugInfo.touchSupport ? '✅ Supported' : '❌ Not detected'}</div>
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
                <div><strong>Bridge:</strong> {debugInfo.hasVeWorldBridge ? '✅ Available' : '❌ Missing'}</div>
                <div><strong>DAppKit:</strong> {debugInfo.dappKitStatus ? '✅ Available' : '❌ Missing'}</div>
              </CardContent>
            </Card>
          </div>

          {/* Storage Info */}
          {debugInfo.storedWalletData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Mobile Wallet Storage</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div><strong>Stored Wallet:</strong> {debugInfo.storedWalletData.hasStoredWallet ? '✅ Found' : '❌ Missing'}</div>
                <div><strong>Connex State:</strong> {debugInfo.storedWalletData.hasConnexState ? '✅ Found' : '❌ Missing'}</div>
                <div><strong>Wallet Events:</strong> {debugInfo.storedWalletData.walletEvents} events</div>
              </CardContent>
            </Card>
          )}

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