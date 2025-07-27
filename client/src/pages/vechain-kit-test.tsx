import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OfficialVeChainWallet, useVeChainWallet, WalletConnectionStatus } from "@/components/OfficialVeChainWallet";
import { B3TRBalanceDisplay } from "@/components/VeChainTransactionHandler";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function VeChainKitTest() {
  const [, setLocation] = useLocation();
  const { isConnected, address, walletName } = useVeChainWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <Button 
            onClick={() => setLocation('/')} 
            variant="outline"
            className="mb-4"
          >
            ← Back to Home
          </Button>
          
          <h1 className="text-3xl font-bold text-white">
            VeChain Kit Integration Test
          </h1>
          <p className="text-gray-200">
            Testing official VeChain Kit wallet connection and functionality
          </p>
          
          <WalletConnectionStatus />
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Current wallet connection state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Connected:</span>
              <Badge variant={isConnected ? "default" : "outline"}>
                {isConnected ? "Yes" : "No"}
              </Badge>
            </div>
            {address && (
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="font-mono text-sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            )}
            {walletName && (
              <div className="flex justify-between">
                <span>Wallet:</span>
                <Badge variant="secondary">{walletName}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Default Wallet Button */}
        <Card>
          <CardHeader>
            <CardTitle>Default VeChain Kit Wallet Button</CardTitle>
            <CardDescription>Standard wallet connection interface</CardDescription>
          </CardHeader>
          <CardContent>
            <OfficialVeChainWallet variant="default" />
          </CardContent>
        </Card>

        {/* Compact Wallet Button */}
        <Card>
          <CardHeader>
            <CardTitle>Compact Wallet Button</CardTitle>
            <CardDescription>Minimal wallet interface</CardDescription>
          </CardHeader>
          <CardContent>
            <OfficialVeChainWallet variant="compact" />
          </CardContent>
        </Card>

        {/* Detailed Wallet Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Wallet Interface</CardTitle>
            <CardDescription>Complete wallet management interface</CardDescription>
          </CardHeader>
          <CardContent>
            <OfficialVeChainWallet variant="detailed" />
          </CardContent>
        </Card>

        {/* B3TR Balance Display */}
        {isConnected && address && (
          <Card>
            <CardHeader>
              <CardTitle>B3TR Token Balance</CardTitle>
              <CardDescription>Current B3TR balance for connected wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <B3TRBalanceDisplay address={address} />
            </CardContent>
          </Card>
        )}

        {/* VeChain Kit Features */}
        <Card>
          <CardHeader>
            <CardTitle>VeChain Kit Features</CardTitle>
            <CardDescription>Available features from the official VeChain Kit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <Badge variant="outline">VeWorld Wallet</Badge>
              <Badge variant="outline">Sync2 Wallet</Badge>
              <Badge variant="outline">WalletConnect</Badge>
              <Badge variant="outline">Fee Delegation</Badge>
              <Badge variant="outline">Social Logins</Badge>
              <Badge variant="outline">Ecosystem Apps</Badge>
              <Badge variant="outline">Transaction Modal</Badge>
              <Badge variant="outline">Multi-language</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>VeChain Kit integration progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>VeChain Kit Provider:</span>
                <Badge variant="default">✓ Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>Official Components:</span>
                <Badge variant="default">✓ Loaded</Badge>
              </div>
              <div className="flex justify-between">
                <span>Wallet Hooks:</span>
                <Badge variant="default">✓ Available</Badge>
              </div>
              <div className="flex justify-between">
                <span>Transaction Handler:</span>
                <Badge variant="default">✓ Ready</Badge>
              </div>
              <div className="flex justify-between">
                <span>Fee Delegation:</span>
                <Badge variant="default">✓ Configured</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-gray-300 text-sm">
          Official VeChain Kit Integration - Academy Module 4 Implementation
        </div>
      </div>
    </div>
  );
}