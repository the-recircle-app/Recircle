import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  isConnecting: boolean;
}

interface WalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    isConnecting: false,
  });

  const connectWallet = async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));
    
    try {
      // VeChain wallet connection would use @vechain/dapp-kit here
      // Using environment variables for display purposes only
      const mockAddress = import.meta.env.VITE_CREATOR_FUND_WALLET || '0x...';
      
      setWallet({
        isConnected: true,
        address: mockAddress,
        balance: 0,
        isConnecting: false,
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: 0,
      isConnecting: false,
    });
  };

  const refreshBalance = async () => {
    if (!wallet.address) return;
    
    try {
      // Fetch balance from API using wallet address
      const response = await fetch(`/api/users/balance/${wallet.address}`);
      const data = await response.json();
      
      setWallet(prev => ({ ...prev, balance: data.balance || 0 }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  useEffect(() => {
    // Check if wallet was previously connected (localStorage)
    const savedAddress = localStorage.getItem('wallet_address');
    if (savedAddress) {
      setWallet(prev => ({ 
        ...prev, 
        isConnected: true, 
        address: savedAddress 
      }));
      refreshBalance();
    }
  }, []);

  const value = {
    wallet,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};