import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogEntry {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any[];
}

// Browser-persistent logging system using sessionStorage
const DEBUG_LOGS_KEY = 'recircle_debug_logs';
const DEBUG_CAPTURING_KEY = 'recircle_debug_capturing';

const getStoredLogs = (): LogEntry[] => {
  try {
    const stored = sessionStorage.getItem(DEBUG_LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setStoredLogs = (logs: LogEntry[]) => {
  try {
    sessionStorage.setItem(DEBUG_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('Failed to store logs:', e);
  }
};

const getIsCapturing = (): boolean => {
  try {
    return sessionStorage.getItem(DEBUG_CAPTURING_KEY) === 'true';
  } catch {
    return false;
  }
};

const setIsCapturing = (capturing: boolean) => {
  try {
    sessionStorage.setItem(DEBUG_CAPTURING_KEY, capturing.toString());
  } catch (e) {
    console.warn('Failed to store capture state:', e);
  }
};

// Global console override system
let originalConsole: any = {};
let isConsolePatched = false;

const initializeConsoleCapture = () => {
  if (isConsolePatched) return;
  
  // Store original console methods
  originalConsole.log = console.log;
  originalConsole.warn = console.warn;
  originalConsole.error = console.error;
  originalConsole.debug = console.debug;

  const captureLog = (level: LogEntry['level'], originalFn: Function) => {
    return (...args: any[]) => {
      // Call original function first
      originalFn.apply(console, args);
      
      // Capture for our debug view if capturing is enabled
      if (getIsCapturing()) {
        const timestamp = new Date().toLocaleTimeString();
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)
        ).join(' ');
        
        const newEntry: LogEntry = {
          timestamp,
          level,
          message,
          data: args
        };
        
        try {
          // Add to stored logs with fallback
          const currentLogs = getStoredLogs();
          currentLogs.push(newEntry);
          setStoredLogs(currentLogs);
          
          // Also add a marker to the original console to confirm capture is working
          if (message.includes('[DISCONNECT]') || message.includes('[SYNC]')) {
            originalFn.call(console, '🔴 [DEBUG-CAPTURE] Captured:', level, message.substring(0, 50) + '...');
          }
        } catch (e) {
          originalFn.call(console, '❌ [DEBUG-CAPTURE] Failed to store log:', e);
        }
      }
    };
  };

  // Override console methods
  console.log = captureLog('log', originalConsole.log);
  console.warn = captureLog('warn', originalConsole.warn);
  console.error = captureLog('error', originalConsole.error);
  console.debug = captureLog('debug', originalConsole.debug);
  
  isConsolePatched = true;
  
  // Add a test log to confirm capture is working
  console.log('🟢 [DEBUG-CAPTURE] Console capture initialized successfully');
};

const restoreConsole = () => {
  if (!isConsolePatched || !originalConsole.log) return;
  
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
  
  isConsolePatched = false;
};

const Debug = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCapturing, setIsCaptureState] = useState(false);
  const [storageResult, setStorageResult] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Load state from session storage on component mount
    const storedLogs = getStoredLogs();
    const storedCapturing = getIsCapturing();
    
    setLogs(storedLogs);
    setIsCaptureState(storedCapturing);

    // Initialize console patching if capturing is active
    if (storedCapturing && !isConsolePatched) {
      initializeConsoleCapture();
    }

    // Set up periodic refresh to sync with stored data
    const syncInterval = setInterval(() => {
      const currentLogs = getStoredLogs();
      const currentCapturing = getIsCapturing();
      
      setLogs([...currentLogs]);
      setIsCaptureState(currentCapturing);
    }, 1000);

    return () => {
      clearInterval(syncInterval);
    };
  }, []);

  const startCapture = () => {
    // Clear existing logs and start capturing
    setStoredLogs([]);
    setIsCapturing(true);
    setLogs([]);
    setIsCaptureState(true);
    
    // Initialize console capture
    initializeConsoleCapture();
  };

  const stopCapture = () => {
    // Stop capturing
    setIsCapturing(false);
    setIsCaptureState(false);
    
    // Restore original console methods
    restoreConsole();
  };

  const clearLogs = () => {
    setStoredLogs([]);
    setLogs([]);
  };

  const resetSession = () => {
    // Clear all logs
    setStoredLogs([]);
    setLogs([]);
    
    // Reset connection cycle counter
    try {
      sessionStorage.removeItem('wallet_connection_count');
      localStorage.removeItem('wallet_debug_logs');
      console.log('🔄 [DEBUG] Session reset - connection cycle counter and persistent logs cleared');
    } catch (e) {
      console.warn('Failed to reset session:', e);
    }
  };

  const loadPersistentLogs = () => {
    try {
      const persistentLogs = JSON.parse(localStorage.getItem('wallet_debug_logs') || '[]');
      console.log('📋 [DEBUG] Loading persistent wallet logs:', persistentLogs);
      
      if (persistentLogs.length === 0) {
        console.log('📋 [DEBUG] No persistent logs found in localStorage');
        setLogs(['No wallet events logged yet. Perform connect/disconnect actions first.']);
      } else {
        setLogs(persistentLogs);
        console.log('📋 [DEBUG] Loaded', persistentLogs.length, 'persistent wallet logs');
      }
    } catch (e) {
      console.warn('Failed to load persistent logs:', e);
      setLogs(['Error loading persistent logs: ' + e.message]);
    }
  };

  const copyToClipboard = async () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(logText);
      alert('Logs copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = logText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Logs copied to clipboard!');
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      case 'debug': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Debug Console</CardTitle>
            <CardDescription className="text-gray-400">
              Capture and view console logs for debugging wallet connection issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={startCapture}
                disabled={isCapturing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCapturing ? 'Capturing...' : 'Start Capture'}
              </Button>
              
              <Button 
                onClick={stopCapture}
                disabled={!isCapturing}
                variant="outline"
              >
                Stop Capture
              </Button>
              
              <Button 
                onClick={clearLogs}
                variant="outline"
              >
                Clear Logs
              </Button>
              
              <Button 
                onClick={resetSession}
                variant="outline"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Reset Session
              </Button>
              
              <Button 
                onClick={loadPersistentLogs}
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Load Wallet Logs
              </Button>
              
              <Button 
                onClick={() => {
                  try {
                    const logs = localStorage.getItem('wallet_debug_logs');
                    console.log('Raw localStorage wallet_debug_logs:', logs);
                    
                    if (!logs) {
                      setStorageResult('❌ localStorage is empty - no wallet events stored yet');
                      return;
                    }
                    
                    const parsedLogs = JSON.parse(logs);
                    setStorageResult(`✅ Found ${parsedLogs.length} wallet events in localStorage:\n${parsedLogs.join('\n')}`);
                  } catch (e) {
                    setStorageResult(`❌ Error reading localStorage: ${e instanceof Error ? e.message : 'Unknown error'}`);
                  }
                }}
                variant="outline"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Check Storage
              </Button>
              
              <Button 
                onClick={() => {
                  try {
                    const testEvent = `[${new Date().toISOString()}] TEST_EVENT: Manual test from debug page`;
                    
                    const existingLogs = JSON.parse(localStorage.getItem('wallet_debug_logs') || '[]');
                    existingLogs.push(testEvent);
                    localStorage.setItem('wallet_debug_logs', JSON.stringify(existingLogs));
                    
                    setTestResult(`✅ Added test event to localStorage:\n${testEvent}`);
                  } catch (e) {
                    setTestResult(`❌ Failed to add test event: ${e instanceof Error ? e.message : 'Unknown error'}`);
                  }
                }}
                variant="outline"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Test Storage
              </Button>
              
              <Button 
                onClick={copyToClipboard}
                disabled={logs.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Copy to Clipboard
              </Button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge variant={isCapturing ? "default" : "secondary"}>
                {isCapturing ? 'Capturing' : 'Stopped'}
              </Badge>
              <span className="text-sm text-gray-400">
                {logs.length} log entries captured
              </span>
            </div>

            {/* Storage Test Results */}
            {(storageResult || testResult) && (
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-2 text-white">Storage Test Results:</h3>
                  {storageResult && (
                    <div className="mb-4 p-3 bg-gray-800 rounded text-sm text-green-400 whitespace-pre-wrap">
                      {storageResult}
                    </div>
                  )}
                  {testResult && (
                    <div className="mb-4 p-3 bg-gray-800 rounded text-sm text-blue-400 whitespace-pre-wrap">
                      {testResult}
                    </div>
                  )}
                  <Button 
                    onClick={() => {
                      setStorageResult('');
                      setTestResult('');
                    }}
                    variant="outline"
                    size="sm"
                    className="text-white border-gray-600"
                  >
                    Clear Results
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2 text-white">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                  <li>Click "Test Storage" to verify localStorage works</li>
                  <li>Click "Check Storage" to see if wallet logs are being stored</li>
                  <li>Navigate to home page and perform multiple connect/disconnect cycles</li>
                  <li>Return here and click "Check Storage" again to see the sequence</li>
                  <li>Look for CONNECTION_ATTEMPT and DISCONNECT_ATTEMPT patterns</li>
                  <li>Copy logs to share the complete sequence</li>
                </ol>
                
                {/* Test Button */}
                <div className="mt-4 p-3 bg-gray-600 rounded">
                  <h4 className="text-sm font-medium text-white mb-2">Test Logging:</h4>
                  <Button 
                    onClick={() => {
                      console.log("🔴 [TEST] Manual test log from debug page");
                      console.log("[DISCONNECT] This is a test disconnect log");
                      console.log("[SYNC] This is a test sync log");
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Test Log Capture
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">
                    Click to verify log capture is working
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Log Display */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-sm text-white">Console Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  {logs.length === 0 ? (
                    <p className="text-gray-400 text-sm">No logs captured yet. Start capture and perform actions to see logs here.</p>
                  ) : (
                    <div className="space-y-1">
                      {logs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 rounded text-xs font-mono">
                          <Badge variant={getLevelColor(log.level)} className="text-xs">
                            {log.level}
                          </Badge>
                          <span className="text-gray-400 min-w-20">
                            {log.timestamp}
                          </span>
                          <span className="text-gray-100 break-all">
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="pt-4">
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                ← Back to Home
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Debug;