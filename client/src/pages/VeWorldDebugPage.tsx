import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Download, Smartphone, Wifi, Battery } from 'lucide-react';

interface DebugLog {
  timestamp: string;
  level: string;
  message: string;
  source: string;
  data?: any;
}

interface WalletInfo {
  address?: string;
  balance?: string;
  connected?: boolean;
  chainId?: string;
  provider?: string;
}

export default function VeWorldDebugPage() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const { toast } = useToast();

  // Add debug log
  const addLog = (level: string, message: string, source: string, data?: any) => {
    const newLog: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      data
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  // Capture device and browser info
  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      timestamp: new Date().toISOString()
    };
    setDeviceInfo(info);
    addLog('info', 'Debug page loaded', 'system', info);
  }, []);

  // Monitor wallet connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // Check if VeWorld is available
        if (typeof window !== 'undefined' && (window as any).vechain) {
          const vechain = (window as any).vechain;
          addLog('info', 'VeChain provider detected', 'wallet', { provider: 'vechain' });
          
          // Try to get accounts
          try {
            const accounts = await vechain.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
              setWalletInfo(prev => ({
                ...prev,
                address: accounts[0],
                connected: true,
                provider: 'vechain'
              }));
              addLog('success', 'Wallet connected', 'wallet', { address: accounts[0] });
            }
          } catch (error) {
            addLog('error', 'Failed to get wallet accounts', 'wallet', error);
          }
        } else {
          addLog('warning', 'VeChain provider not found', 'wallet');
        }
      } catch (error) {
        addLog('error', 'Error checking wallet connection', 'wallet', error);
      }
    };

    checkWalletConnection();
  }, []);

  // Start capturing logs
  const startCapturing = () => {
    setIsCapturing(true);
    addLog('info', 'Started log capture', 'system');
    
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
      originalLog(...args);
      addLog('log', args.join(' '), 'console', args);
    };
    
    console.error = (...args) => {
      originalError(...args);
      addLog('error', args.join(' '), 'console', args);
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warning', args.join(' '), 'console', args);
    };
    
    // Listen for wallet events
    if (typeof window !== 'undefined' && (window as any).vechain) {
      const vechain = (window as any).vechain;
      
      vechain.on('accountsChanged', (accounts: string[]) => {
        addLog('info', 'Wallet accounts changed', 'wallet', { accounts });
        setWalletInfo(prev => ({
          ...prev,
          address: accounts[0],
          connected: accounts.length > 0
        }));
      });
      
      vechain.on('chainChanged', (chainId: string) => {
        addLog('info', 'Chain changed', 'wallet', { chainId });
        setWalletInfo(prev => ({ ...prev, chainId }));
      });
      
      vechain.on('disconnect', () => {
        addLog('warning', 'Wallet disconnected', 'wallet');
        setWalletInfo({});
      });
    }
    
    toast({
      title: "Debug capture started",
      description: "Now monitoring VeWorld wallet activity"
    });
  };

  // Stop capturing logs
  const stopCapturing = () => {
    setIsCapturing(false);
    addLog('info', 'Stopped log capture', 'system');
    
    toast({
      title: "Debug capture stopped",
      description: "Logs saved for analysis"
    });
  };

  // Send logs to server
  const sendLogsToServer = async () => {
    try {
      const response = await fetch('/api/debug-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs,
          walletInfo,
          deviceInfo,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        toast({
          title: "Logs sent successfully",
          description: "Debug information sent to server"
        });
        addLog('success', 'Logs sent to server', 'system');
      } else {
        throw new Error('Failed to send logs');
      }
    } catch (error) {
      addLog('error', 'Failed to send logs to server', 'system', error);
      toast({
        title: "Failed to send logs",
        description: "Check console for details",
        variant: "destructive"
      });
    }
  };

  // Test wallet connection
  const testWalletConnection = async () => {
    try {
      addLog('info', 'Testing wallet connection...', 'test');
      
      if (typeof window !== 'undefined' && (window as any).vechain) {
        const vechain = (window as any).vechain;
        
        // Test account access
        const accounts = await vechain.request({ method: 'eth_requestAccounts' });
        addLog('success', 'Wallet accounts retrieved', 'test', { accounts });
        
        // Test signing capability
        const message = "ReCircle VeWorld Debug Test";
        try {
          const signature = await vechain.request({
            method: 'personal_sign',
            params: [message, accounts[0]]
          });
          addLog('success', 'Wallet signing test passed', 'test', { signature });
        } catch (signError) {
          addLog('error', 'Wallet signing test failed', 'test', signError);
        }
        
        // Test balance check
        try {
          const balance = await vechain.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          });
          addLog('info', 'Wallet balance retrieved', 'test', { balance });
        } catch (balanceError) {
          addLog('error', 'Balance check failed', 'test', balanceError);
        }
        
      } else {
        addLog('error', 'VeChain provider not available', 'test');
      }
    } catch (error) {
      addLog('error', 'Wallet connection test failed', 'test', error);
    }
  };

  // Download logs as JSON
  const downloadLogs = () => {
    const data = {
      logs,
      walletInfo,
      deviceInfo,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veworld-debug-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">VeWorld Debug Console</h1>
        <p className="text-gray-600">Debug VeWorld wallet integration and B3TR token visibility issues</p>
      </div>

      {/* Device Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">User Agent</p>
              <p className="font-mono text-xs break-all">{deviceInfo.userAgent}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform</p>
              <p className="font-mono">{deviceInfo.platform}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Viewport</p>
              <p className="font-mono">{deviceInfo.viewport?.width} x {deviceInfo.viewport?.height}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Connection Status</p>
              <Badge variant={walletInfo.connected ? "default" : "secondary"}>
                {walletInfo.connected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Wallet Address</p>
              <p className="font-mono text-sm">{walletInfo.address || "Not connected"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Debug Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={isCapturing ? stopCapturing : startCapturing}
              variant={isCapturing ? "destructive" : "default"}
            >
              {isCapturing ? "Stop Capture" : "Start Capture"}
            </Button>
            <Button onClick={testWalletConnection} variant="outline">
              Test Wallet
            </Button>
            <Button onClick={sendLogsToServer} variant="outline">
              Send to Server
            </Button>
            <Button onClick={downloadLogs} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Logs
            </Button>
            <Button onClick={() => setLogs([])} variant="outline">
              Clear Logs
            </Button>
          </div>
          {isCapturing && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Capturing logs... ({logs.length} entries)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
          <CardDescription>
            Real-time logs from VeWorld wallet and ReCircle app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No logs yet. Click "Start Capture" to begin monitoring.
                </p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getLevelColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">{log.source}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{log.message}</p>
                    {log.data && (
                      <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}