import React, { useState, useEffect } from 'react';
import { useWallet, useWalletModal } from '@vechain/dapp-kit-react';
import { Button } from "@/components/ui/button";
import { useWallet as useAppWallet } from "../context/WalletContext";

/**
 * Official VeChain DAppKit Wallet Connection Component
 * Following VeChain Builders Academy guidelines
 */
export function OfficialWalletConnect() {
  const { connect, disconnect, tokenBalance, isConnected: appConnected } = useAppWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [isManuallyDisconnecting, setIsManuallyDisconnecting] = useState(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  
  // Connection throttling to prevent DAppKit state corruption
  const CONNECTION_COOLDOWN_MS = 2000; // 2 seconds between attempts
  
  // Update cooldown display
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, CONNECTION_COOLDOWN_MS - (now - lastConnectionAttempt));
      setCooldownRemaining(remaining);
    }, 100);
    
    return () => clearInterval(interval);
  }, [lastConnectionAttempt]);
  
  // Track connection cycles to identify when the bug occurs
  const getConnectionCount = () => {
    try {
      return parseInt(sessionStorage.getItem('wallet_connection_count') || '0');
    } catch {
      return 0;
    }
  };
  
  const incrementConnectionCount = () => {
    try {
      const count = getConnectionCount() + 1;
      sessionStorage.setItem('wallet_connection_count', count.toString());
      return count;
    } catch {
      return 0;
    }
  };

  // Track disconnect attempts separately to identify the real issue
  const getDisconnectCount = () => {
    try {
      return parseInt(sessionStorage.getItem('wallet_disconnect_count') || '0');
    } catch {
      return 0;
    }
  };

  const incrementDisconnectCount = () => {
    try {
      const count = getDisconnectCount() + 1;
      sessionStorage.setItem('wallet_disconnect_count', count.toString());
      return count;
    } catch {
      return 0;
    }
  };
  
  // Official DAppKit hooks
  const walletHook = useWallet();
  const { account, source, disconnect: dappKitDisconnect } = walletHook;
  const modalHook = useWalletModal();
  const { open, close } = modalHook;

  const isConnected = !!account;
  const address = account;

  // Persistent wallet event logging (survives page navigation)
  useEffect(() => {
    const logWalletEvent = (type: string, data: any) => {
      const timestamp = new Date().toISOString();
      const eventMsg = `[${timestamp}] ${type}: ${JSON.stringify(data)}`;
      
      // Log to console
      console.log(eventMsg);
      
      // Store persistently in localStorage
      try {
        const existingLogs = JSON.parse(localStorage.getItem('wallet_debug_logs') || '[]');
        existingLogs.push(eventMsg);
        
        // Keep only last 50 logs to prevent storage overflow
        if (existingLogs.length > 50) {
          existingLogs.splice(0, existingLogs.length - 50);
        }
        
        localStorage.setItem('wallet_debug_logs', JSON.stringify(existingLogs));
      } catch (e) {
        console.warn('Failed to store wallet debug log:', e);
      }
    };

    // Log when account state changes
    if (account !== undefined) {
      logWalletEvent('ACCOUNT_CHANGE', account);
    }

    // Log source changes
    if (source !== undefined) {
      logWalletEvent('SOURCE_CHANGE', source);
    }
  }, [account, source]);

  // Sync DAppKit wallet state with app context
  useEffect(() => {
    console.log("[SYNC] === WALLET SYNC CHECK ===");
    console.log("[SYNC] DAppKit state - isConnected:", isConnected, "address:", address, "source:", source);
    console.log("[SYNC] App state - appConnected:", appConnected, "isManuallyDisconnecting:", isManuallyDisconnecting);
    
    // Add a log that should be captured by the debug system
    const logMessage = `[SYNC-CAPTURED] ${new Date().toLocaleTimeString()} - DAppKit: ${isConnected ? 'CONNECTED' : 'DISCONNECTED'}, App: ${appConnected ? 'CONNECTED' : 'DISCONNECTED'}`;
    console.log(logMessage);
    
    // Try to call the debug capture directly if it exists
    if (typeof window !== 'undefined' && (window as any).debugCapture) {
      (window as any).debugCapture.push(logMessage);
    }
    
    if (isConnected && address && !appConnected && !isManuallyDisconnecting) {
      const currentCount = getConnectionCount();
      
      console.log("[SYNC] ⚠️  CONDITION MET FOR AUTO-RECONNECTION");
      console.log(`[SYNC] ⚠️  AUTO-RECONNECTION TRIGGERED AFTER ${currentCount} CONNECTION CYCLES`);
      console.log("[SYNC] DAppKit has wallet connection but app does not - triggering auto-connect");
      console.log("[SYNC] This is likely the source of the auto-reconnection issue!");
      console.log("[SYNC] Wallet connected via", source, "address:", address);
      
      if (currentCount >= 2) {
        console.log(`🚨 [SYNC] CRITICAL BUG REPRODUCED: Auto-reconnection after ${currentCount} connection cycles!`);
        console.log(`🚨 [SYNC] This confirms the pattern: works for first 1-2 cycles, then breaks`);
      }
      
      // Use "dappkit" as the wallet type to bypass the old VeChain SDK
      connect("dappkit", address, { skipCelebration: false });
    } else if (!isConnected && appConnected && !isManuallyDisconnecting) {
      console.log("[DAPPKIT] AUTO-DISCONNECTING: Wallet disconnected, clearing app context");
      disconnect();
    }
  }, [isConnected, address, appConnected, connect, disconnect, source, isManuallyDisconnecting]);

  const handleConnect = async () => {
    const now = Date.now();
    
    // Implement connection throttling to prevent DAppKit state corruption
    if (now - lastConnectionAttempt < CONNECTION_COOLDOWN_MS) {
      const timeRemaining = Math.ceil((CONNECTION_COOLDOWN_MS - (now - lastConnectionAttempt)) / 1000);
      console.log(`🚫 [THROTTLE] Connection attempt blocked - ${timeRemaining}s cooldown remaining`);
      console.log(`🚫 [THROTTLE] This prevents DAppKit state corruption from rapid connection attempts`);
      return;
    }
    
    setLastConnectionAttempt(now);
    
    const currentCount = getConnectionCount();
    const newCount = incrementConnectionCount();
    
    const connectMsg = `CONNECTION_ATTEMPT_${newCount}`;
    console.log(`🟢 [CONNECT] ========== CONNECTION ATTEMPT #${newCount} ==========`);
    console.log(`🟢 [CONNECT] Previous connection count: ${currentCount}`);
    console.log(`🟢 [CONNECT] This is ${newCount === 1 ? 'FIRST' : newCount === 2 ? 'SECOND' : 'SUBSEQUENT'} connection attempt`);
    console.log(`🟢 [CONNECT] Connection throttling: ${CONNECTION_COOLDOWN_MS}ms cooldown implemented`);
    
    // Persistent logging
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ${connectMsg}: count=${newCount}`;
      console.log(logEntry);
      
      const existingLogs = JSON.parse(localStorage.getItem('wallet_debug_logs') || '[]');
      existingLogs.push(logEntry);
      
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('wallet_debug_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.warn('Failed to store connect log:', e);
    }
    
    if (newCount > 2) {
      console.log(`⚠️ [CONNECT] WARNING: This is attempt #${newCount} - auto-reconnection bug may occur after disconnect`);
    }
    
    setIsLoading(true);
    try {
      // Open the official DAppKit wallet modal
      open();
    } catch (error) {
      console.error("[DAPPKIT] Connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    const currentCount = getConnectionCount();
    const disconnectNumber = incrementDisconnectCount();
    
    const disconnectMsg = `DISCONNECT_ATTEMPT_#${disconnectNumber}_AFTER_${currentCount}_CONNECTIONS`;
    console.log("🔴 [DISCONNECT] ========== DISCONNECT BUTTON CLICKED ==========");
    console.log(`🔴 [DISCONNECT] This is disconnect attempt #${disconnectNumber} after ${currentCount} connections`);
    
    // COMPREHENSIVE DISCONNECT DEBUGGING
    console.log(`🔴 [DISCONNECT-DEBUG] DAppKit functions available:`, {
      'dappKitDisconnect exists': !!dappKitDisconnect,
      'dappKitDisconnect type': typeof dappKitDisconnect,
      'close exists': !!close,
      'close type': typeof close,
      'isConnected': isConnected,
      'address': address,
      'source': source
    });
    
    // Check if this is the problematic second+ disconnect
    if (disconnectNumber >= 2) {
      console.log(`🚨 [DISCONNECT-DEBUG] CRITICAL: This is disconnect attempt #${disconnectNumber}!`);
      console.log(`🚨 [DISCONNECT-DEBUG] Previous disconnect may have failed - analyzing state...`);
      console.log(`🚨 [DISCONNECT-DEBUG] DAppKit state should be clean but may be corrupted`);
    }
    
    // Persistent logging
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ${disconnectMsg}: connections=${currentCount}, disconnect=${disconnectNumber}`;
      console.log(logEntry);
      
      const existingLogs = JSON.parse(localStorage.getItem('wallet_debug_logs') || '[]');
      existingLogs.push(logEntry);
      
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('wallet_debug_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.warn('Failed to store disconnect log:', e);
    }
    
    console.log("🔴 [DISCONNECT] Button click registered - starting disconnect sequence");
    console.log("[DAPPKIT] ========== MANUAL DISCONNECT STARTED ==========");
    console.log("[DAPPKIT] Initial state - isConnected:", isConnected, "appConnected:", appConnected);
    
    setIsLoading(true);
    setIsManuallyDisconnecting(true);
    
    try {
      console.log("[DAPPKIT] Step 1: Setting manual disconnect flag");
      
      // DETAILED FUNCTION ANALYSIS
      const debugInfo = `DISCONNECT-DEBUG] Pre-disconnect analysis:
- dappKitDisconnect function exists: ${!!dappKitDisconnect}
- dappKitDisconnect is callable: ${typeof dappKitDisconnect === 'function'}
- close function exists: ${!!close}
- close is callable: ${typeof close === 'function'}
- disconnect function exists: ${!!disconnect}
- disconnect is callable: ${typeof disconnect === 'function'}`;
      
      console.log(`🔍 [${debugInfo}`);
      
      // Also save to debug page logs
      try {
        const debugLogs = JSON.parse(localStorage.getItem('wallet_debug_logs') || '[]');
        debugLogs.push(`[${new Date().toISOString()}] ${debugInfo}`);
        localStorage.setItem('wallet_debug_logs', JSON.stringify(debugLogs));
      } catch (e) {
        console.warn('Failed to store debug info:', e);
      }
      
      // First: Use DAppKit's native disconnect method to clear its state
      if (dappKitDisconnect) {
        console.log("[DAPPKIT] Step 2: Calling DAppKit's native disconnect method...");
        console.log(`🔍 [DISCONNECT-DEBUG] About to call dappKitDisconnect()`);
        
        try {
          const result = await dappKitDisconnect();
          console.log("[DAPPKIT] Step 2 complete - DAppKit disconnect called");
          console.log(`🔍 [DISCONNECT-DEBUG] dappKitDisconnect() returned:`, result);
          
          // Log success to debug page
          const debugLogs = JSON.parse(localStorage.getItem('wallet_debug_logs') || '[]');
          debugLogs.push(`[${new Date().toISOString()}] ✅ dappKitDisconnect() SUCCESS - returned: ${JSON.stringify(result)}`);
          localStorage.setItem('wallet_debug_logs', JSON.stringify(debugLogs));
        } catch (dappKitError) {
          console.error(`🚨 [DISCONNECT-DEBUG] dappKitDisconnect() failed:`, dappKitError);
          console.error(`🚨 [DISCONNECT-DEBUG] This might be why subsequent disconnects fail!`);
          
          // Log error to debug page
          const debugLogs = JSON.parse(localStorage.getItem('wallet_debug_logs') || '[]');
          debugLogs.push(`[${new Date().toISOString()}] 🚨 dappKitDisconnect() FAILED: ${dappKitError?.message || dappKitError}`);
          localStorage.setItem('wallet_debug_logs', JSON.stringify(debugLogs));
        }
      } else {
        console.warn(`🚨 [DISCONNECT-DEBUG] dappKitDisconnect function not available!`);
      }
      
      // Second: Close modal
      console.log("[DAPPKIT] Step 3: Closing modal...");
      console.log(`🔍 [DISCONNECT-DEBUG] About to call close()`);
      
      try {
        close();
        console.log("[DAPPKIT] Step 3 complete - Modal closed");
        console.log(`🔍 [DISCONNECT-DEBUG] close() executed successfully`);
      } catch (closeError) {
        console.error(`🚨 [DISCONNECT-DEBUG] close() failed:`, closeError);
      }
      
      // Third: Wait a moment for DAppKit state to settle
      console.log("[DAPPKIT] Step 4: Waiting for state to settle...");
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log("[DAPPKIT] Step 4 complete - State settled");
      
      // Fourth: Call our app's disconnect to clear internal state
      console.log("[DAPPKIT] Step 5: Calling app disconnect...");
      console.log(`🔍 [DISCONNECT-DEBUG] About to call disconnect()`);
      
      try {
        await disconnect();
        console.log("[DAPPKIT] Step 5 complete - App disconnect called");
        console.log(`🔍 [DISCONNECT-DEBUG] disconnect() executed successfully`);
      } catch (appDisconnectError) {
        console.error(`🚨 [DISCONNECT-DEBUG] disconnect() failed:`, appDisconnectError);
      }
      
      console.log("[DAPPKIT] ========== MANUAL DISCONNECT COMPLETED ==========");
      
      // POST-DISCONNECT STATE VERIFICATION
      console.log(`🔍 [DISCONNECT-DEBUG] Post-disconnect state verification:`);
      console.log(`🔍 [DISCONNECT-DEBUG] - isConnected: ${isConnected}`);
      console.log(`🔍 [DISCONNECT-DEBUG] - address: ${address}`);
      console.log(`🔍 [DISCONNECT-DEBUG] - source: ${source}`);
      console.log(`🔍 [DISCONNECT-DEBUG] - appConnected: ${appConnected}`);
      
      // Check if disconnect actually worked
      if (isConnected || address || appConnected) {
        console.error(`🚨 [DISCONNECT-DEBUG] DISCONNECT FAILED! State not properly cleared:`);
        console.error(`🚨 [DISCONNECT-DEBUG] - isConnected: ${isConnected} (should be false)`);
        console.error(`🚨 [DISCONNECT-DEBUG] - address: ${address} (should be null)`);
        console.error(`🚨 [DISCONNECT-DEBUG] - appConnected: ${appConnected} (should be false)`);
        console.error(`🚨 [DISCONNECT-DEBUG] This explains why disconnect #${disconnectNumber} may not work!`);
      } else {
        console.log(`✅ [DISCONNECT-DEBUG] Disconnect #${disconnectNumber} appears successful - all state cleared`);
      }
      
    } catch (error) {
      console.error("[DAPPKIT] Disconnect error:", error);
      console.error(`🚨 [DISCONNECT-DEBUG] Full disconnect sequence failed:`, error);
    } finally {
      setIsLoading(false);
      // Reset the flag after a longer delay to prevent auto-reconnection
      setTimeout(() => {
        console.log("[DISCONNECT] ⚠️  TIMEOUT TRIGGERED: Resetting isManuallyDisconnecting to false");
        console.log("[DISCONNECT] This timing might be the issue if DAppKit connection persists");
        console.log("[DISCONNECT] Current DAppKit state - isConnected:", isConnected, "address:", address);
        console.log(`🔍 [DISCONNECT-DEBUG] Final state after timeout - disconnect #${disconnectNumber}:`);
        console.log(`🔍 [DISCONNECT-DEBUG] - isConnected: ${isConnected}`);
        console.log(`🔍 [DISCONNECT-DEBUG] - address: ${address}`);
        console.log(`🔍 [DISCONNECT-DEBUG] - appConnected: ${appConnected}`);
        setIsManuallyDisconnecting(false);
        console.log("[DISCONNECT] Manual disconnect protection removed - auto-reconnection now possible");
      }, 5000); // Increased from 3 to 5 seconds
    }
  };

  if (isConnected && address) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-bold text-green-400 mb-2">✅ Wallet Connected</h3>
          <p className="text-gray-300 text-sm mb-2">
            Connected via: {source || 'VeWorld'}
          </p>
          <p className="text-gray-300 text-sm mb-2">
            Address: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <p className="text-gray-300 text-sm mb-4">Balance: {tokenBalance} B3TR</p>
          <Button 
            onClick={handleDisconnect} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
          >
            {isLoading ? "Disconnecting..." : "Disconnect"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Connect Your VeChain Wallet</h3>
        <p className="text-gray-300 text-sm mb-4">
          Connect with VeWorld, Sync2, or WalletConnect
        </p>
        
        <Button 
          onClick={handleConnect}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          disabled={isLoading || cooldownRemaining > 0}
        >
          {isLoading ? "Connecting..." : 
           cooldownRemaining > 0 ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s` : 
           "Connect Mobile Wallet"}
        </Button>
        
        {cooldownRemaining > 0 && (
          <p className="text-yellow-400 text-xs mt-2">
            Connection throttling active - prevents DAppKit state corruption
          </p>
        )}
        
        <p className="text-gray-400 text-xs mt-4">
          Supports VeWorld mobile, VeWorld extension, Sync2, and WalletConnect
        </p>
      </div>
    </div>
  );
}

export default OfficialWalletConnect;