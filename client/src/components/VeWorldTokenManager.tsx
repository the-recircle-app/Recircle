import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Solo network B3TR token configuration
const B3TR_TOKEN_CONFIG = {
  address: '0x5ef79995fe8a89e0812330e4378eb2660cede699',
  symbol: 'B3TR',
  decimals: 18,
  name: 'B3TR Token'
};

const SOLO_NETWORK_CONFIG = {
  chainId: '0x27', // 39 in hex
  chainName: 'VeChain Solo',
  rpcUrls: ['http://localhost:8669'],
  blockExplorerUrls: ['http://localhost:8669']
};

export function VeWorldTokenManager() {
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [tokenAdded, setTokenAdded] = useState(false);
  const [networkAdded, setNetworkAdded] = useState(false);
  const [isDevelopment] = useState(() => {
    return window.location.hostname === 'localhost' || window.location.hostname.includes('replit.dev');
  });
  const { toast } = useToast();

  const addB3TRToken = async () => {
    setIsAddingToken(true);
    try {
      // Check if VeWorld is available
      const vechain = (window as any).vechain;
      if (!vechain) {
        throw new Error('VeWorld wallet not detected. Please use VeWorld mobile app or install VeWorld extension.');
      }

      // Check if request method exists
      if (typeof vechain.request !== 'function') {
        throw new Error('VeWorld API not available. Please add B3TR token manually in VeWorld settings.');
      }

      // Request to add B3TR token to VeWorld
      await vechain.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: B3TR_TOKEN_CONFIG.address,
            symbol: B3TR_TOKEN_CONFIG.symbol,
            decimals: B3TR_TOKEN_CONFIG.decimals,
          },
        },
      });

      setTokenAdded(true);
      toast({
        title: "B3TR Token Added",
        description: "B3TR token has been added to your VeWorld wallet. Switch to Solo network to see your balance.",
      });
    } catch (error: any) {
      console.error('Failed to add B3TR token:', error);
      
      // Provide helpful manual instructions
      toast({
        title: "Manual Setup Required",
        description: "Please add B3TR token manually in VeWorld: Go to Assets → Add Token → Custom Token",
        variant: "destructive"
      });
    } finally {
      setIsAddingToken(false);
    }
  };

  const addSoloNetwork = async () => {
    setIsAddingNetwork(true);
    try {
      const vechain = (window as any).vechain;
      if (!vechain) {
        throw new Error('VeWorld wallet not detected. Please use VeWorld mobile app or install VeWorld extension.');
      }

      // Check if request method exists
      if (typeof vechain.request !== 'function') {
        throw new Error('VeWorld API not available. Please add Solo network manually in VeWorld settings.');
      }

      // Request to add Solo network to VeWorld
      await vechain.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: SOLO_NETWORK_CONFIG.chainId,
          chainName: SOLO_NETWORK_CONFIG.chainName,
          rpcUrls: SOLO_NETWORK_CONFIG.rpcUrls,
          blockExplorerUrls: SOLO_NETWORK_CONFIG.blockExplorerUrls,
        }],
      });

      setNetworkAdded(true);
      toast({
        title: "Solo Network Added",
        description: "VeChain Solo network has been added to VeWorld. You can now switch to it to see real B3TR tokens.",
      });
    } catch (error: any) {
      console.error('Failed to add Solo network:', error);
      
      // Provide helpful manual instructions
      toast({
        title: "Manual Setup Required", 
        description: "Please add Solo network manually in VeWorld: Settings → Networks → Add Custom Network",
        variant: "destructive"
      });
    } finally {
      setIsAddingNetwork(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          VeWorld Setup
        </CardTitle>
        <CardDescription>
          Add Solo network and B3TR token to see real rewards in VeWorld
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Solo Network Setup */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Solo Network</span>
            {networkAdded && <Badge variant="secondary" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Added
            </Badge>}
          </div>
          <Button 
            onClick={addSoloNetwork}
            disabled={isAddingNetwork || networkAdded}
            variant="outline"
            className="w-full"
          >
            {isAddingNetwork ? 'Adding Network...' : networkAdded ? 'Solo Network Added' : 'Add Solo Network'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Chain ID: 39, RPC: localhost:8669
          </p>
        </div>

        {/* B3TR Token Setup */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">B3TR Token</span>
            {tokenAdded && <Badge variant="secondary" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Added
            </Badge>}
          </div>
          <Button 
            onClick={addB3TRToken}
            disabled={isAddingToken || tokenAdded}
            className="w-full"
          >
            {isAddingToken ? 'Adding Token...' : tokenAdded ? 'B3TR Token Added' : 'Add B3TR Token'}
          </Button>
          <p className="text-xs text-muted-foreground">
            {B3TR_TOKEN_CONFIG.address.slice(0, 10)}...{B3TR_TOKEN_CONFIG.address.slice(-8)}
          </p>
        </div>

        {/* Development Environment Warning */}
        {isDevelopment && (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Development Environment:</p>
                <p className="text-xs">
                  Automatic setup may not work in development. Use manual configuration below for guaranteed setup.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Use VeWorld mobile app for best compatibility</li>
                <li>If automatic setup fails, use manual configuration below</li>
                <li>Switch to Solo network in VeWorld after adding</li>
                <li>Add B3TR token to see your balance</li>
                <li>Submit receipts to earn real B3TR rewards</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}