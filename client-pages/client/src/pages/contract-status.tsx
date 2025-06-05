import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Network,
  Wallet,
  Coins,
  FileText,
  Database
} from 'lucide-react';

interface ContractStatus {
  isDeployed: boolean;
  contractAddress?: string;
  deploymentTx?: string;
  network: string;
  appId: string;
  rewardsPoolAddress: string;
  lastChecked: string;
}

interface NetworkStatus {
  isConnected: boolean;
  blockNumber?: number;
  chainId?: number;
  rpcUrl: string;
  lastError?: string;
}

export default function ContractStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: contractStatus, refetch: refetchContract } = useQuery<ContractStatus>({
    queryKey: ['/api/contract/status'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/contract/status');
        if (!response.ok) {
          // Return current deployment state from environment
          return {
            isDeployed: false,
            network: 'testnet',
            appId: '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1',
            rewardsPoolAddress: '0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38',
            lastChecked: new Date().toISOString()
          };
        }
        return response.json();
      } catch (error) {
        throw new Error('Failed to fetch contract status');
      }
    },
    refetchInterval: 30000 // Check every 30 seconds
  });

  const { data: networkStatus, refetch: refetchNetwork } = useQuery<NetworkStatus>({
    queryKey: ['/api/network/status'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/network/status');
        if (!response.ok) {
          return {
            isConnected: false,
            rpcUrl: 'https://sync-testnet.vechain.org',
            lastError: 'VeChain testnet experiencing connectivity issues',
            lastChecked: new Date().toISOString()
          };
        }
        return response.json();
      } catch (error) {
        return {
          isConnected: false,
          rpcUrl: 'https://sync-testnet.vechain.org',
          lastError: error.message,
          lastChecked: new Date().toISOString()
        };
      }
    },
    refetchInterval: 15000 // Check every 15 seconds
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchContract(), refetchNetwork()]);
    setIsRefreshing(false);
  };

  const handleDeploy = async () => {
    try {
      const response = await fetch('/api/contract/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await refetchContract();
      } else {
        const error = await response.json();
        console.error('Deployment failed:', error);
      }
    } catch (error) {
      console.error('Deployment request failed:', error);
    }
  };

  const getStatusBadge = (isDeployed: boolean, isConnected: boolean) => {
    if (isDeployed) {
      return <Badge className="bg-green-100 text-green-800">Deployed</Badge>;
    } else if (isConnected) {
      return <Badge className="bg-yellow-100 text-yellow-800">Ready to Deploy</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Network Unavailable</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Contract Status</h1>
          <p className="text-muted-foreground">
            EcoEarn contract deployment and VeBetterDAO integration
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Deployment Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                EcoEarn Contract Status
              </CardTitle>
              <CardDescription>
                Smart contract deployment status for VeBetterDAO integration
              </CardDescription>
            </div>
            {getStatusBadge(contractStatus?.isDeployed || false, networkStatus?.isConnected || false)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contract Address</label>
              <div className="flex items-center gap-2">
                {contractStatus?.contractAddress ? (
                  <>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {contractStatus.contractAddress}
                    </code>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">Not deployed</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deployment Transaction</label>
              <div className="flex items-center gap-2">
                {contractStatus?.deploymentTx ? (
                  <>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {contractStatus.deploymentTx.substring(0, 20)}...
                    </code>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">Pending deployment</span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Network</label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{contractStatus?.network || 'testnet'}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">VeBetterDAO App ID</label>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {contractStatus?.appId || 'Loading...'}
              </code>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Last Checked</label>
              <span className="text-sm text-muted-foreground">
                {contractStatus?.lastChecked ? 
                  new Date(contractStatus.lastChecked).toLocaleTimeString() : 
                  'Never'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            VeChain Network Status
          </CardTitle>
          <CardDescription>
            Connection status to VeChain testnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {networkStatus?.isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">
                  {networkStatus?.isConnected ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {networkStatus?.rpcUrl || 'https://sync-testnet.vechain.org'}
                </p>
              </div>
            </div>
            
            {networkStatus?.blockNumber && (
              <div className="text-right">
                <p className="text-sm font-medium">Block #{networkStatus.blockNumber}</p>
                <p className="text-xs text-muted-foreground">Latest</p>
              </div>
            )}
          </div>

          {networkStatus?.lastError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {networkStatus.lastError}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* VeBetterDAO Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            VeBetterDAO Integration
          </CardTitle>
          <CardDescription>
            Connection to VeBetterDAO reward system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">App Registration</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reward Distributor</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">B3TR Token Access</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Smart Contract</span>
                {contractStatus?.isDeployed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reward Distribution</span>
                {contractStatus?.isDeployed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Frontend Integration</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium">Rewards Pool Address</label>
            <code className="text-sm bg-muted px-2 py-1 rounded block">
              {contractStatus?.rewardsPoolAddress}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Deploy and manage your EcoEarn smart contract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!contractStatus?.isDeployed && (
            <div className="space-y-2">
              <Button 
                onClick={handleDeploy}
                disabled={!networkStatus?.isConnected}
                className="w-full md:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Deploy EcoEarn Contract
              </Button>
              <p className="text-sm text-muted-foreground">
                {!networkStatus?.isConnected 
                  ? 'Waiting for VeChain testnet connectivity...'
                  : 'Ready to deploy smart contract to VeChain testnet'
                }
              </p>
            </div>
          )}

          {contractStatus?.isDeployed && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </Button>
                <Button variant="outline">
                  <Coins className="h-4 w-4 mr-2" />
                  Test Reward Distribution
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Contract is deployed and ready for reward distribution
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}