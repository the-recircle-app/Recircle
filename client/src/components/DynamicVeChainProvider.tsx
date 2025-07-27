import { ReactNode, useState, useEffect } from 'react';

interface Props {
  children: ReactNode;
}

export function DynamicVeChainProvider({ children }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [VeChainProvider, setVeChainProvider] = useState<any>(null);

  useEffect(() => {
    const loadVeChainLibraries = async () => {
      console.log(`[DYNAMIC-PROVIDER] 🔥 Starting VeChain library loading...`);
      try {
        // Dynamically import VeChain libraries only when component mounts
        const [{ VeChainKitProvider }, { DAppKitProvider }] = await Promise.all([
          import('@vechain/vechain-kit'),
          import('@vechain/dapp-kit-react')
        ]);
        console.log(`[DYNAMIC-PROVIDER] ✅ VeChain libraries loaded successfully`);

        // Check if we should use solo node for development testing
        const isDevelopment = import.meta.env.MODE === 'development';
        const soloNodeUrl = import.meta.env.VITE_SOLO_NETWORK_URL || 'http://localhost:8669';
        const soloEnabled = import.meta.env.VITE_SOLO_MODE_ENABLED === 'true';
        
        // Use solo node if available, otherwise fall back to testnet
        const nodeUrl = isDevelopment && soloEnabled ? soloNodeUrl : "https://testnet.vechain.org";
        const networkType = isDevelopment && soloEnabled ? 'solo' : 'testnet';
        
        console.log(`[DYNAMIC-PROVIDER] 🚀 SOLO MODE: ${soloEnabled}`);
        console.log(`[DYNAMIC-PROVIDER] 🌐 Using node: ${nodeUrl}`);
        console.log(`[DYNAMIC-PROVIDER] 📡 Network type: ${networkType}`);
        console.log(`[DYNAMIC-PROVIDER] 🎯 PIERRE CONFIGURATION ACTIVE - Frontend connecting to solo node`);

        // Create a combined provider component
        const CombinedProvider = ({ children }: { children: ReactNode }) => (
          <VeChainKitProvider
            feeDelegation={{
              delegatorUrl: isDevelopment && soloEnabled ? '' : 'https://sponsor-testnet.vechain.org/by/90',
              delegateAllTransactions: !soloEnabled,
            }}
            loginMethods={[
              { method: 'dappkit', gridColumn: 12 },
            ]}
            dappKit={{
              allowedWallets: ['veworld', 'sync2'],
              walletConnectOptions: {
                projectId: "48db0c9bb7c3d4bb66a87bba26199cb9",
                metadata: {
                  name: "ReCircle",
                  description: "Sustainable Transportation Rewards",
                  url: "https://recircle.app",
                  icons: ["https://recircle.app/icon.png"]
                }
              }
            }}
            network={networkType}
          >
            <DAppKitProvider
              nodeUrl={nodeUrl}
              usePersistence={true}
            >
              {children}
            </DAppKitProvider>
          </VeChainKitProvider>
        );

        setVeChainProvider(() => CombinedProvider);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load VeChain libraries:', error);
        // Fallback: render children without VeChain providers
        setIsLoaded(true);
      }
    };

    loadVeChainLibraries();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">Loading blockchain components...</span>
      </div>
    );
  }

  if (VeChainProvider) {
    return <VeChainProvider>{children}</VeChainProvider>;
  }

  // Fallback if VeChain libraries failed to load
  return <>{children}</>;
}