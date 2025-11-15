import { createContext, useState, useContext, useEffect, ReactNode, useRef } from "react";
import { vechain } from "../lib/vechain";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import type { User } from "../types";
import ConnectionCelebration from "../components/ConnectionCelebration";
import { featureFlags, environment } from "../lib/environment";
import { useWallet as useVeChainKitWallet } from '@vechain/vechain-kit';

interface WalletContextType {
  address: string;
  isConnecting: boolean;
  isConnected: boolean;
  tokenBalance: number;
  userId: number | null;
  connecting: boolean;
  connect: (walletType: string, walletAddress?: string, options?: { skipCelebration?: boolean }) => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  refreshTokenBalance: () => Promise<number>;
  refreshUserData: () => Promise<void>;
  showCelebration: boolean;
}

const WalletContext = createContext<WalletContextType>({
  address: "",
  isConnecting: false,
  isConnected: false,
  tokenBalance: 0,
  userId: null,
  connecting: false,
  connect: async () => false,
  disconnect: async () => false,
  refreshTokenBalance: async () => 0,
  refreshUserData: async () => {},
  showCelebration: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  // 🔥 CRITICAL: Remove local address state - use VeChain Kit as single source of truth
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [isVerifyingWallet, setIsVerifyingWallet] = useState<boolean>(false); // Block queries during verification
  const { toast } = useToast();
  
  // VeChain Kit hooks for live wallet state and proper disconnect
  const { disconnect: kitDisconnect, account } = useVeChainKitWallet();
  const kitConnected = !!account; // Kit is connected if account exists
  
  // 🔥 SINGLE SOURCE OF TRUTH: Derive address from VeChain Kit account
  const address = account?.address || "";
  
  // 🔥 Track latest Kit address AND userId to prevent race conditions
  const latestKitAddressRef = useRef<string | null>(null);
  const lastUserIdRef = useRef<number | null>(null);
  latestKitAddressRef.current = account?.address || null;
  
  // 🔥 CRITICAL: Only update ref when userId is non-null (preserves across disconnect)
  if (userId !== null) {
    lastUserIdRef.current = userId;
  }

  // 🔥 WALLET RECOVERY: Use VeChain Kit as single source of truth for address
  // Only recover user data when Kit provides a live wallet address
  useEffect(() => {
    if (!account?.address) {
      // Kit disconnected or no account - clear all state
      console.log("[WALLET-RECOVERY] Kit account is null - clearing wallet state");
      
      // 🔥 CRITICAL: Use ref to get last userId (persists even after setUserId(null))
      const oldUserId = lastUserIdRef.current;
      
      // Clear React Query cache for old user
      if (oldUserId !== null) {
        console.log(`[WALLET-RECOVERY] Clearing React Query cache for user ${oldUserId}`);
        queryClient.cancelQueries({
          predicate: (query) => {
            const queryKey = query.queryKey[0];
            return typeof queryKey === 'string' && queryKey.includes(`/api/users/${oldUserId}`);
          }
        });
        queryClient.removeQueries({
          predicate: (query) => {
            const queryKey = query.queryKey[0];
            return typeof queryKey === 'string' && queryKey.includes(`/api/users/${oldUserId}`);
          }
        });
        console.log(`[WALLET-RECOVERY] ✅ Cleared cache for user ${oldUserId}`);
      }
      
      // Clear all state
      setUserId(null);
      setTokenBalance(0);
      setIsConnected(false);
      // No userId in localStorage anymore
      
      return;
    }
    
    const liveAddress = account.address;
    console.log(`[WALLET-RECOVERY] VeChain Kit account found: ${liveAddress}`);
    console.log(`[WALLET-RECOVERY] Current userId in state: ${userId}`);
    
    // 🔥 CRITICAL: Clear userId IMMEDIATELY to block queries during verification
    // This prevents components from using stale userId while we verify Kit address
    const currentUserId = userId;
    if (currentUserId !== null) {
      console.log(`[WALLET-RECOVERY] Clearing userId ${currentUserId} during verification to block stale queries`);
      setUserId(null);
      setIsConnected(false);
    }
    
    // Recover user data for this LIVE address (not localStorage address!)
    recoverWalletConnection(liveAddress);
  }, [account?.address]); // Trigger when Kit's address changes

  // No more healWalletMismatch - Kit account recovery handles everything

  // 🧹 CRITICAL FIX: Clear React Query cache IMMEDIATELY on mount to prevent stale queries
  // This runs BEFORE components mount and create queries, solving the race condition
  const previousUserIdRef = useRef<number | null>(null);
  const hasRunInitialCleanupRef = useRef(false);
  
  useEffect(() => {
    // STAGE 1: On initial mount, immediately clear ALL stale user queries
    if (!hasRunInitialCleanupRef.current) {
      // No more localStorage userId - only use state
      const currentUserId = userId;
      
      console.log(`[WALLET-CACHE] 🧹 Initial cleanup starting - current user: ${currentUserId}`);
      
      // CANCEL all active user queries first (stops fetching)
      queryClient.cancelQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return typeof queryKey === 'string' && queryKey.includes('/api/users/');
        }
      });
      
      // Then REMOVE all user queries except current user
      if (currentUserId !== null) {
        const allQueries = queryClient.getQueryCache().getAll();
        const otherUserQueries = allQueries.filter(query => {
          const queryKey = query.queryKey[0];
          if (typeof queryKey === 'string' && queryKey.includes('/api/users/')) {
            return !queryKey.includes(`/api/users/${currentUserId}`);
          }
          return false;
        });
        
        console.log(`[WALLET-CACHE] Found ${otherUserQueries.length} queries for other users:`, 
          otherUserQueries.map(q => q.queryKey[0]));
        
        queryClient.removeQueries({
          predicate: (query) => {
            const queryKey = query.queryKey[0];
            if (typeof queryKey === 'string' && queryKey.includes('/api/users/')) {
              return !queryKey.includes(`/api/users/${currentUserId}`);
            }
            return false;
          }
        });
        
        console.log(`[WALLET-CACHE] ✅ Initial cleanup complete - removed ${otherUserQueries.length} stale user queries`);
      }
      
      hasRunInitialCleanupRef.current = true;
    }
    
    // STAGE 2: When userId changes (wallet switch), clean up old user
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== userId && userId !== null) {
      const oldUserId = previousUserIdRef.current;
      console.log(`[WALLET-CACHE] 🧹 User switch detected: ${oldUserId} → ${userId}`);
      
      // CANCEL old user queries first (critical!)
      queryClient.cancelQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return typeof queryKey === 'string' && queryKey.includes(`/api/users/${oldUserId}`);
        }
      });
      
      // Then REMOVE them
      queryClient.removeQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return typeof queryKey === 'string' && queryKey.includes(`/api/users/${oldUserId}`);
        }
      });
      
      console.log(`[WALLET-CACHE] ✅ Cleaned up user ${oldUserId} queries`);
    }
    
    previousUserIdRef.current = userId;
  }, [userId]);

  // URL-triggered reset for mobile browsers
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === '1') {
      console.log('[WALLET-RESET] URL reset triggered - performing hard reset');
      hardResetDappStorage();
    }
  }, []);

  // 🔥 CRITICAL: Re-verify wallet on page visibility change (app resume from background)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && account?.address && userId !== null) {
        console.log('[WALLET-RESUME] App resumed - re-verifying wallet connection');
        console.log(`[WALLET-RESUME] Kit address: ${account.address}, Current userId: ${userId}`);
        
        // 🔥 BLOCK QUERIES IMMEDIATELY: Set userId to null to prevent stale fetches
        const currentUserId = userId;
        setUserId(null);
        setIsVerifyingWallet(true);
        
        try {
          // Cancel all in-flight user queries immediately
          await queryClient.cancelQueries({
            predicate: (query) => {
              const queryKey = query.queryKey[0];
              return typeof queryKey === 'string' && queryKey.includes('/api/users/');
            }
          });
          
          // Re-fetch user by wallet address to verify it matches
          const response = await fetch(`/api/users/wallet/${account.address}`, {
            credentials: "include",
          });
          
          if (response.ok) {
            const userData: User = await response.json();
            
            // If userId doesn't match, we have a mismatch - force full reconnection
            if (userData.id !== currentUserId) {
              console.error(`[WALLET-RESUME] ⚠️ MISMATCH DETECTED! Kit shows ${account.address} (user ${userData.id}) but state had userId ${currentUserId}`);
              console.log('[WALLET-RESUME] Forcing full reconnection with correct user...');
              
              // Remove old user queries
              queryClient.removeQueries({
                predicate: (query) => {
                  const queryKey = query.queryKey[0];
                  return typeof queryKey === 'string' && queryKey.includes(`/api/users/${currentUserId}`);
                }
              });
              
              // Full reconnection (will set userId back after fetching correct user)
              setIsVerifyingWallet(false);
              recoverWalletConnection(account.address);
            } else {
              // Verified - wallet matches, restore userId
              console.log(`[WALLET-RESUME] ✅ Wallet verified - userId ${userData.id} matches Kit address ${account.address}`);
              setUserId(currentUserId);
              setIsVerifyingWallet(false);
            }
          } else {
            // ANY non-200 response (404, 500, etc.) means we must re-verify
            console.error(`[WALLET-RESUME] ⚠️ Wallet verification failed (HTTP ${response.status}) - forcing reconnection to fix state`);
            
            // Remove old user queries
            queryClient.removeQueries({
              predicate: (query) => {
                const queryKey = query.queryKey[0];
                return typeof queryKey === 'string' && queryKey.includes(`/api/users/${currentUserId}`);
              }
            });
            
            // Always reconnect (handles 404 new wallets too)
            setIsVerifyingWallet(false);
            recoverWalletConnection(account.address);
          }
        } catch (error) {
          console.error('[WALLET-RESUME] Failed to verify wallet - forcing reconnection:', error);
          
          // On error, always reconnect to be safe
          queryClient.removeQueries({
            predicate: (query) => {
              const queryKey = query.queryKey[0];
              return typeof queryKey === 'string' && queryKey.includes(`/api/users/${currentUserId}`);
            }
          });
          
          setIsVerifyingWallet(false);
          recoverWalletConnection(account.address);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [account?.address, userId]);

  // Mobile-safe hard reset function for cache/storage issues
  const hardResetDappStorage = async () => {
    try {
      console.log('[WALLET-RESET] 🧹 Starting mobile-safe hard reset');
      
      // Step 1: Disconnect VeChain Kit gracefully
      if (kitDisconnect) {
        try {
          await kitDisconnect();
          console.log('[WALLET-RESET] ✅ VeChain Kit disconnected');
        } catch (error) {
          console.log('[WALLET-RESET] ⚠️ Kit disconnect error (continuing):', error);
        }
      }
      
      // Step 2: Clear localStorage and sessionStorage
      const preserveKeys = ['referralCode']; // Keep referral codes
      const lsKeys = Object.keys(localStorage);
      lsKeys.forEach(key => {
        if (!preserveKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      console.log('[WALLET-RESET] ✅ Browser storage cleared');
      
      // Step 3: Clear IndexedDB databases (mobile-safe)
      if ('indexedDB' in window && indexedDB.databases) {
        try {
          const databases = await indexedDB.databases();
          const deletePromises = databases.map(db => {
            if (db.name && ['vechain-kit', '@vechain/dapp-kit', 'privy', 'privy-auth'].some(prefix => db.name?.includes(prefix))) {
              return indexedDB.deleteDatabase(db.name);
            }
          }).filter(Boolean);
          
          await Promise.all(deletePromises);
          console.log('[WALLET-RESET] ✅ IndexedDB cleared');
        } catch (error) {
          console.log('[WALLET-RESET] ⚠️ IndexedDB clear error (continuing):', error);
        }
      }
      
      // Step 4: Clear component state (address auto-clears when Kit disconnects)
      setTokenBalance(0);
      setUserId(null);
      setIsConnected(false);
      setIsConnecting(false);
      setConnecting(false);
      
      // Step 5: Force reload to fresh state
      console.log('[WALLET-RESET] 🔄 Redirecting to fresh session');
      window.location.replace(window.location.origin + '/?fresh=1');
      
    } catch (error) {
      console.error('[WALLET-RESET] ❌ Hard reset failed:', error);
      toast({
        title: "Reset Failed",
        description: "Manual browser refresh may be needed",
        variant: "destructive"
      });
    }
  };

  const recoverWalletConnection = async (address: string) => {
    try {
      console.log('[WALLET] Attempting to recover wallet connection for address:', address);
      setIsConnecting(true);
      
      // 🔥 STAGE 1: CLEAR STATE FIRST (before fetching new user)
      const oldUserId = userId;
      console.log(`[WALLET] Stage 1: Clearing old user ${oldUserId} before connecting to ${address}`);
      
      // Set userId to null FIRST to disable all queries
      setUserId(null);
      setIsConnected(false);
      
      // Cancel all active user queries
      if (oldUserId !== null) {
        await queryClient.cancelQueries({
          predicate: (query) => {
            const queryKey = query.queryKey[0];
            return typeof queryKey === 'string' && queryKey.includes('/api/users/');
          }
        });
        
        // Remove old user queries
        queryClient.removeQueries({
          predicate: (query) => {
            const queryKey = query.queryKey[0];
            return typeof queryKey === 'string' && queryKey.includes(`/api/users/${oldUserId}`);
          }
        });
        
        console.log(`[WALLET] ✅ Canceled and removed queries for user ${oldUserId}`);
      }
      
      // No userId in localStorage anymore - Kit address is sole source of truth
      
      // 🔥 STAGE 2: FETCH NEW USER DATA
      console.log(`[WALLET] Stage 2: Fetching user data for ${address}`);
      const response = await fetch(`/api/users/wallet/${address}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const userData: User = await response.json();
        
        // 🔥 RACE CONDITION GUARD: Only set state if Kit address hasn't changed
        if (latestKitAddressRef.current?.toLowerCase() !== address.toLowerCase()) {
          console.log(`[WALLET] ⚠️ Kit address changed during recovery (${address} → ${latestKitAddressRef.current}) - aborting state write`);
          return;
        }
        
        // 🔥 STAGE 3: SET NEW USER (only after verification succeeds AND address still matches)
        console.log(`[WALLET] Stage 3: Setting new user ${userData.id} with kit address: ${address}`);
        setTokenBalance(userData.tokenBalance);
        setUserId(userData.id);
        setIsConnected(true);
        
        // 🔥 NO LONGER CACHE userId - Kit address is the only source of truth
        // This prevents stale userId from being used after wallet switch
        
        // CRITICAL: Refresh balance from blockchain after connection
        console.log("🔄 Connection successful - refreshing balance from blockchain...");
        setTimeout(async () => {
          try {
            const liveBalance = await refreshTokenBalance();
            console.log(`✅ Live balance refreshed: ${liveBalance} B3TR`);
          } catch (error) {
            console.error("❌ Failed to refresh balance from blockchain:", error);
          }
        }, 500); // Small delay to ensure connection is fully established
      } else {
        // If user doesn't exist, create a new one
        if (response.status === 404) {
          console.log(`[WALLET] Stage 2b: User not found - creating new user for ${address}`);
          const username = `user_${Math.random().toString(36).substring(2, 10)}`;
          const newUser = await apiRequest("POST", "/api/users", {
            username,
            password: Math.random().toString(36).substring(2, 15),
            walletAddress: address
          });
          
          if (newUser.ok) {
            const userData: User = await newUser.json();
            
            // 🔥 RACE CONDITION GUARD: Only set state if Kit address hasn't changed
            if (latestKitAddressRef.current?.toLowerCase() !== address.toLowerCase()) {
              console.log(`[WALLET] ⚠️ Kit address changed during new user creation (${address} → ${latestKitAddressRef.current}) - aborting state write`);
              return;
            }
            
            // 🔥 STAGE 3: SET NEW USER (only after creation succeeds AND address still matches)
            console.log(`[WALLET] Stage 3: Setting new user ${userData.id} with kit address: ${address}`);
            setTokenBalance(userData.tokenBalance);
            setUserId(userData.id);
            setIsConnected(true);
            
            // 🔥 NO LONGER CACHE userId - Kit address is the only source of truth
            // This prevents stale userId from being used after wallet switch
            
            // CRITICAL: Refresh balance from blockchain after new user creation
            console.log("🔄 New user created - refreshing balance from blockchain...");
            setTimeout(async () => {
              try {
                const liveBalance = await refreshTokenBalance();
                console.log(`✅ Live balance refreshed for new user: ${liveBalance} B3TR`);
              } catch (error) {
                console.error("❌ Failed to refresh balance from blockchain:", error);
              }
            }, 500); // Small delay to ensure connection is fully established
          } else {
            throw new Error("Failed to create user account");
          }
        } else {
          throw new Error("Failed to fetch user data");
        }
      }
    } catch (error) {
      console.error("Error recovering wallet connection:", error);
      // 🔥 No userId in localStorage - Kit address is sole source of truth
      // Clear state but don't show error toast (address auto-clears when Kit disconnects)
      setTokenBalance(0);
      setUserId(null);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const connect = async (walletType: string, walletAddress?: string, options: { skipCelebration?: boolean } = {}): Promise<boolean> => {
    try {
      console.log(`[WALLET] Connect called with walletType: ${walletType}, explicit address: ${walletAddress}`);
      
      // IDEMPOTENCE GUARD: Short-circuit if already connected to the same address
      if (walletAddress && isConnected && address === walletAddress) {
        console.log(`[WALLET] Already connected to ${walletAddress} - skipping duplicate connection`);
        return true;
      }
      
      setConnecting(true);
      
      // If an explicit wallet address is provided (from DAppKit or StandardWalletConnect), use it
      // Otherwise, use our built-in connection method
      let walletInfo;
      if (walletAddress) {
        walletInfo = { address: walletAddress, balance: 0 };
      } else if (walletType === "dappkit") {
        // DAppKit handles the connection, we just need the address
        throw new Error("DAppKit connections require explicit address");
      } else {
        walletInfo = await vechain.connectWallet(walletType);
      }
      
      if (!walletInfo) {
        throw new Error("Failed to connect wallet");
      }
      
      console.log(`[WALLET] Connecting to wallet: ${walletInfo.address} using ${walletType}`);
      
      // Fetch or create user
      const response = await fetch(`/api/users/wallet/${walletInfo.address}`, {
        credentials: "include",
      });
      
      let userData: User;
      
      if (response.ok) {
        userData = await response.json();
      } else if (response.status === 404) {
        // Create new user
        const username = `user_${Math.random().toString(36).substring(2, 10)}`;
        
        // Check for referral code from localStorage (stored by /join?ref=code)
        const referralCode = localStorage.getItem('referralCode');
        let referredBy = null;
        
        if (referralCode) {
          // Validate and get referrer info
          try {
            console.log(`[REFERRAL DEBUG] Validating referral code: ${referralCode}`);
            const referralResponse = await fetch(`/api/referrals/code/${referralCode}`);
            
            if (referralResponse.ok) {
              const referralData = await referralResponse.json();
              referredBy = referralData.referrerId;
              console.log(`[REFERRAL] ✅ New user referred by user ${referredBy} with code ${referralCode}`);
              
              // Show success toast
              toast({
                title: "Invitation Accepted!",
                description: `You were invited by someone awesome! 🎉`,
              });
            } else {
              const errorText = await referralResponse.text();
              console.error(`[REFERRAL] ❌ Invalid referral code ${referralCode}: ${referralResponse.status} - ${errorText}`);
              
              // Show error toast for invalid referral code
              toast({
                title: "Invalid Invitation Code",
                description: "The invitation link appears to be invalid or expired. You can still join without it!",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('[REFERRAL] ❌ Network error validating referral code:', error);
            
            // Show error toast for network issues
            toast({
              title: "Connection Issue",
              description: "Could not verify invitation link. You can still join without it!",
              variant: "destructive"
            });
          }
        }
        
        const newUserResponse = await apiRequest("POST", "/api/users", {
          username,
          password: Math.random().toString(36).substring(2, 15),
          walletAddress: walletInfo.address,
          referredBy
        });
        
        if (!newUserResponse.ok) {
          throw new Error("Failed to create user account");
        }
        
        userData = await newUserResponse.json();
        
        // Clear referral code from localStorage after successful user creation
        if (referralCode) {
          localStorage.removeItem('referralCode');
          console.log('[REFERRAL] Referral code processed and cleared from localStorage');
        }
      } else {
        throw new Error("Failed to fetch or create user");
      }
      
      // Address is now derived from Kit's account (no setAddress needed)
      console.log(`[WALLET] User ${userData.id} connected with kit address: ${address}`);
      setTokenBalance(userData.tokenBalance);
      setUserId(userData.id);
      setIsConnected(true);
      
      // 🔥 NO LONGER CACHE userId - Kit address is the only source of truth
      localStorage.setItem("connectedWallet", walletType);
      
      // Show celebration only once per session to prevent loops
      if (!options.skipCelebration && !sessionStorage.getItem('celebrationShown')) {
        setShowCelebration(true);
        sessionStorage.setItem('celebrationShown', 'true');
      } else {
        // Show simple toast without celebration
        toast({
          title: "Wallet Connected",
          description: "Your VeChain wallet has been connected successfully",
        });
      }
      
      return true;
    } catch (error) {
      console.error("[WALLET] Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive"
      });
      return false;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async (): Promise<boolean> => {
    try {
      console.log("[WALLET] Starting complete disconnect process...");
      
      // 🔥 CRITICAL FIX: Call VeChain Kit disconnect FIRST
      try {
        if (kitDisconnect) {
          console.log("[WALLET] Calling VeChain Kit disconnect...");
          await kitDisconnect();
          console.log("[WALLET] VeChain Kit disconnect successful");
        }
      } catch (error) {
        console.error("[WALLET] VeChain Kit disconnect failed:", error);
        // Continue with manual cleanup even if VeChain Kit disconnect fails
      }
      
      // Clear all wallet connection data from localStorage
      // 🔥 No userId in localStorage anymore - Kit address is sole source of truth
      localStorage.removeItem("connectedWallet");
      localStorage.removeItem("veworld-connected");
      localStorage.removeItem("veworld-address");
      
      // Clear VeChainKit and Privy related storage
      localStorage.removeItem("privy:token");
      localStorage.removeItem("privy:refresh_token");  
      localStorage.removeItem("privy:did_token");
      localStorage.removeItem("vechain-kit-account");
      
      // Clear VeChainKit session storage and indexedDB
      if (typeof window !== 'undefined') {
        // Clear session storage
        sessionStorage.removeItem("vechain-kit-account");
        sessionStorage.removeItem("@vechain/dapp-kit");
        
        // Clear all VeChain-related localStorage keys
        Object.keys(localStorage).forEach(key => {
          if (key.includes('vechain') || key.includes('privy') || key.includes('dappkit') || key.includes('@vechain')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear all VeChain-related sessionStorage keys
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('vechain') || key.includes('privy') || key.includes('dappkit') || key.includes('@vechain')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
      // Try to disconnect from the VeChain SDK and DAppKit
      try {
        await vechain.disconnectWallet();
        
        // Also clear DAppKit data if available
        if (typeof window !== 'undefined' && window.localStorage) {
          // Clear DAppKit storage keys
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('dappkit') || key.includes('vechain') || key.includes('@vechain'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }
      } catch (err) {
        console.log("Vechain disconnect failed, but continuing with local disconnect");
      }
      
      // Clear all state (address auto-clears when Kit disconnects)
      setTokenBalance(0);
      setUserId(null);
      setIsConnected(false);
      
      // Also clear the wallet state in the hook if window is defined (browser context)
      if (typeof window !== 'undefined') {
        // Clear any wallet connection in the hook
        if (window.clearVeWorldWallet) {
          window.clearVeWorldWallet();
        }
        
        // Always clear all localStorage entries that might contain wallet data
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("connectedWallet");
      }
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
      
      return true;
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive"
      });
      return false;
    }
  };

  // Refresh token balance from the server (with blockchain sync)
  const refreshTokenBalance = async (): Promise<number> => {
    if (!userId || !isConnected) {
      return tokenBalance;
    }
    
    try {
      console.log("🔄 Refreshing token balance from blockchain...");
      
      // First, refresh balance from blockchain to sync database
      const refreshResponse = await fetch(`/api/users/${userId}/refresh-balance`, {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        console.log(`✅ Balance synced from blockchain: ${refreshData.oldBalance} → ${refreshData.newBalance} B3TR`);
        
        // Update token balance state with the new balance
        setTokenBalance(refreshData.newBalance);
        return refreshData.newBalance;
      } else {
        console.log("❌ Blockchain refresh failed, falling back to database value");
        
        // Fallback: fetch from database if blockchain refresh fails
        const response = await fetch(`/api/users/${userId}`, {
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const userData: User = await response.json();
          console.log("Fallback: database token balance:", userData.tokenBalance);
          
          // Update token balance state
          setTokenBalance(userData.tokenBalance);
          return userData.tokenBalance;
        } else {
          throw new Error("Failed to fetch user data");
        }
      }
    } catch (error) {
      console.error("Error refreshing token balance:", error);
      return tokenBalance; // Return current balance on error
    }
  };
  
  // Refresh all user data
  const refreshUserData = async (): Promise<void> => {
    if (!userId || !isConnected) {
      return;
    }
    
    try {
      // Refresh the token balance
      await refreshTokenBalance();
      
      console.log("Forcing user data refresh after receipts update");
      
      // Signal to other components that data should be refreshed
      if (typeof window !== 'undefined') {
        // Set a timestamp that components can check to know when to refresh
        localStorage.setItem('forceDataRefresh', Date.now().toString());
        
        // Create and dispatch a custom event that components can listen for
        const refreshEvent = new CustomEvent('userDataRefreshed', {
          detail: { userId, timestamp: Date.now() }
        });
        window.dispatchEvent(refreshEvent);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh user data",
        variant: "destructive"
      });
    }
  };

  // Handler for completing the celebration
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected,
        tokenBalance,
        userId,
        connecting,
        connect,
        disconnect,
        refreshTokenBalance,
        refreshUserData,
        showCelebration,
      }}
    >
      {showCelebration && (
        <ConnectionCelebration
          isVisible={showCelebration}
          onComplete={handleCelebrationComplete}
        />
      )}
      {children}
    </WalletContext.Provider>
  );
};
