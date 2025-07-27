import { ReactNode, createContext, useContext, useState } from 'react';

// Mock Connex Provider for solo node testing
interface MockConnexContextType {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  address: string | null;
  thor: any;
  vendor: any;
}

const MockConnexContext = createContext<MockConnexContextType | null>(null);

export function useWalletModal() {
  const context = useContext(MockConnexContext);
  if (!context) {
    throw new Error('"useWalletModal" must be used within a ConnexProvider');
  }
  
  return {
    open: context.connect,
    close: context.disconnect,
    isOpen: false
  };
}

export function useWallet() {
  const context = useContext(MockConnexContext);
  if (!context) {
    return {
      account: null,
      isConnected: false,
      connect: async () => {},
      disconnect: () => {}
    };
  }
  
  return {
    account: context.address,
    isConnected: context.isConnected,
    connect: context.connect,
    disconnect: context.disconnect
  };
}

export function useDAppKitWallet() {
  const context = useContext(MockConnexContext);
  if (!context) {
    return {
      account: null,
      isConnected: false,
      connect: async () => {},
      disconnect: () => {}
    };
  }
  
  return {
    account: context.address,
    isConnected: context.isConnected,
    connect: context.connect,
    disconnect: context.disconnect
  };
}

interface Props {
  children: ReactNode;
}

export function MockConnexProvider({ children }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connect = async () => {
    console.log('[MOCK-CONNEX] Simulating wallet connection for solo node testing');
    // Use one of the pre-funded solo node accounts
    const soloAddress = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';
    setAddress(soloAddress);
    setIsConnected(true);
    console.log(`[MOCK-CONNEX] Connected to solo node wallet: ${soloAddress}`);
  };

  const disconnect = () => {
    console.log('[MOCK-CONNEX] Disconnecting wallet');
    setAddress(null);
    setIsConnected(false);
  };

  const mockThor = {
    status: {
      head: {
        number: 0,
        id: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a'
      }
    }
  };

  const mockVendor = {
    sign: async () => ({
      txid: `0x${Math.random().toString(16).substr(2, 64)}`
    })
  };

  const contextValue: MockConnexContextType = {
    connect,
    disconnect,
    isConnected,
    address,
    thor: mockThor,
    vendor: mockVendor
  };

  return (
    <MockConnexContext.Provider value={contextValue}>
      {children}
    </MockConnexContext.Provider>
  );
}