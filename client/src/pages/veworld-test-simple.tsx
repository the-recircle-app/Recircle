import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { veWorldDirect } from '@/lib/veworld-direct';

export default function VeWorldTestSimple() {
  const [status, setStatus] = useState('Ready to test');
  const [address, setAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const testConnection = async () => {
    setIsConnecting(true);
    setStatus('Connecting...');
    addLog('Starting VeWorld connection test');
    
    try {
      const connection = await veWorldDirect.connect();
      setAddress(connection.address);
      setStatus(`Connected: ${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`);
      addLog(`SUCCESS: Connected to ${connection.address}`);
    } catch (error: any) {
      setStatus(`Failed: ${error.message}`);
      addLog(`ERROR: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const saveToServer = async () => {
    try {
      await fetch('/api/debug-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          testType: 'VeWorld Direct Connection Test'
        })
      });
      alert('Logs saved to server!');
    } catch (error) {
      alert('Failed to save logs');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>VeWorld Simple Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Status Display */}
          <div className="p-4 bg-black text-green-400 font-mono text-sm rounded border">
            <div>Status: {status}</div>
            {address && <div>Address: {address}</div>}
            <div>VeWorld Object: {typeof window.vechain !== 'undefined' ? 'YES' : 'NO'}</div>
            <div>User Agent: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
          </div>

          {/* Test Button */}
          <Button 
            onClick={testConnection}
            disabled={isConnecting || typeof window.vechain === 'undefined'}
            className="w-full"
            size="lg"
          >
            {isConnecting ? 'Testing Connection...' : 'Test VeWorld Connection'}
          </Button>

          {/* Logs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Connection Logs</h3>
              <Button onClick={saveToServer} variant="outline" size="sm">
                Save to Server
              </Button>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono max-h-60 overflow-y-auto">
              {logs.length === 0 ? 'No logs yet...' : logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>This page tests direct VeWorld connection using multiple methods.</p>
            <p>Make sure you're in the VeWorld in-app browser, not Safari or Chrome.</p>
            {typeof window.vechain === 'undefined' && (
              <p className="text-red-500 font-medium">
                ⚠️ VeWorld object not detected. Open this page in VeWorld app browser.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}