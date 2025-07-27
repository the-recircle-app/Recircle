import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Wallet } from "lucide-react";
import { useWallet, useWalletModal } from "@vechain/dapp-kit-react";
import { useWallet as useAppWallet } from "@/context/WalletContext";

export default function VeChainWalletButton() {
  const { account, source } = useWallet();
  const { open } = useWalletModal();
  const { connect } = useAppWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (account) {
      // Already connected, connect to app context
      setIsConnecting(true);
      try {
        await connect("vechain", account, { skipCelebration: true });
        setError(null);
      } catch (err: any) {
        setError(`App connection failed: ${err.message}`);
      } finally {
        setIsConnecting(false);
      }
    } else {
      // Open wallet modal to connect
      open();
    }
  };

  const disconnect = () => {
    localStorage.removeItem('walletAddress');
    setError(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>VeChain dApp Kit Wallet</CardTitle>
        <CardDescription>
          {account 
            ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
            : 'Connect to VeChain testnet'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {account ? (
          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Wallet Connected</span>
            {source && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {source}
              </span>
            )}
          </div>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Wallet not connected</AlertDescription>
          </Alert>
        )}

        {!account ? (
          <Button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              "Connecting..."
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Mobile Wallet
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Wallet Address:</p>
              <p className="font-mono text-sm break-all">{account}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting ? "Syncing..." : "Sync to App"}
              </Button>
              <Button 
                onClick={disconnect} 
                variant="outline" 
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Uses official VeChain dApp Kit</p>
          <p>• Supports VeWorld, Sync2, and other VeChain wallets</p>
          <p>• Testnet connection for B3TR rewards</p>
        </div>
      </CardContent>
    </Card>
  );
}