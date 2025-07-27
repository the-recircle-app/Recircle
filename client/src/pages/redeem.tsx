import React, { useState } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/context/WalletContext';
import TokenIcon from '@/components/TokenIcon';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VeChainKitRedeemButton } from '@/components/VeChainKitB3TRTransfer';
import { useWallet as useVeChainKitWallet } from '@vechain/vechain-kit';
import { apiRequest } from '@/lib/queryClient';

const RedeemPage: React.FC = () => {
  const { toast } = useToast();
  const { isConnected, userId, tokenBalance, refreshUserData } = useWallet();
  const { account } = useVeChainKitWallet();
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Token Redemption</h1>
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view redemption options
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/connect-wallet">
              <Button>Connect Wallet</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleRedeemAllTokens = () => {
    // Check if user has any tokens to redeem
    if (tokenBalance <= 0) {
      toast({
        title: "No tokens available",
        description: "You don't have any tokens to redeem.",
        variant: "destructive",
      });
      return;
    }
    
    // Show confirmation dialog
    setConfirmOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!userId || tokenBalance <= 0 || !walletAddress) return;
    
    setIsProcessing(true);
    
    try {
      console.log('[REDEEM] Starting VeWorld transaction signing process');
      console.log('[REDEEM] Wallet Address:', walletAddress);
      console.log('[REDEEM] Token Balance:', tokenBalance);
      
      // Access VeChain Connex from global window object
      const connex = (window as any).connex;
      if (!connex) {
        throw new Error('VeWorld wallet not connected. Please refresh and reconnect.');
      }
      
      // VeBetterDAO testnet contract addresses  
      const X2EARN_REWARDS_POOL = '0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38';
      const APP_ID = '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1';
      
      // Convert token amount to wei (18 decimals)
      const amountWei = (BigInt(Math.floor(tokenBalance * 1e18))).toString();
      
      console.log('[REDEEM] Contract:', X2EARN_REWARDS_POOL);
      console.log('[REDEEM] App ID:', APP_ID);
      console.log('[REDEEM] Amount Wei:', amountWei);
      
      // Prepare VeBetterDAO distributeReward transaction clause
      const clause = connex.thor.account(X2EARN_REWARDS_POOL).method({
        "inputs": [
          {"name": "appId", "type": "bytes32"},
          {"name": "recipient", "type": "address"}, 
          {"name": "amount", "type": "uint256"}
        ],
        "name": "distributeReward",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
      }).asClause(APP_ID, walletAddress, amountWei);
      
      console.log('[REDEEM] Transaction clause prepared:', clause);
      
      // Sign transaction with VeWorld - this will prompt user for signature
      console.log('[REDEEM] Requesting VeWorld signature...');
      const signingService = connex.vendor.sign('tx', [clause]);
      signingService.comment('Redeem B3TR tokens from ReCircle');
      
      const result = await signingService.request();
      console.log('[REDEEM] ✅ Transaction signed successfully:', result.txid);
      
      // Update user balance immediately (optimistic update)
      await refreshUserData();
      
      toast({
        title: "Transaction Successful!",
        description: `Redeemed ${tokenBalance.toFixed(2)} B3TR tokens to your VeWorld wallet. Transaction: ${result.txid.substring(0, 10)}...`,
        variant: "default",
      });
      
      setConfirmOpen(false);
      
    } catch (error: any) {
      console.error('[REDEEM] Transaction failed:', error);
      
      let errorMessage = "Failed to sign transaction. Please try again.";
      if (error.message?.includes('user denied')) {
        errorMessage = "Transaction cancelled by user.";
      } else if (error.message?.includes('insufficient')) {
        errorMessage = "Insufficient gas (VTHO) for transaction.";
      }
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <BackButton href="/" />
          <h1 className="text-2xl font-bold">Token Redemption</h1>
        </div>
        <TokenIcon value={tokenBalance} size="lg" />
      </div>
      
      <Card className="mb-8 overflow-hidden border-primary">
        <CardHeader className="bg-primary/5">
          <CardTitle>Claim All B3TR Tokens</CardTitle>
          <CardDescription>
            Transfer all your accumulated B3TR tokens to your VeChain wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TokenIcon value={tokenBalance} />
              <span>Available Balance</span>
            </div>
            <span className="text-sm text-gray-500">Immediate transfer to your wallet</span>
          </div>
        </CardContent>
        <CardFooter className="bg-primary/10 px-6 py-4">
          <Button 
            onClick={handleRedeemAllTokens} 
            disabled={tokenBalance <= 0}
            className="w-full"
            size="lg"
          >
            Claim All Tokens
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Redemption History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">
            No redemption history yet
          </p>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm Token Claim
            </AlertDialogTitle>
            <AlertDialogDescription>
              You're about to claim <span className="font-semibold">{tokenBalance} B3TR</span> tokens
              to your connected wallet. These tokens will be available in your VeChain wallet for use 
              in any dApp that supports the B3TR token. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Separator />
          <div className="py-3">
            <div className="flex justify-between mb-2">
              <span>Claiming:</span>
              <TokenIcon value={tokenBalance} />
            </div>
            
            <div className="flex justify-between">
              <span>Remaining App Balance:</span>
              <TokenIcon value="0.0" />
            </div>
            
            {import.meta.env.DEV && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                <p><strong>Note:</strong> In a production environment, this action would mint B3TR tokens 
                directly to your blockchain wallet using the VIP-180 token standard on VeChain Thor.</p>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRedeem}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm Claim All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RedeemPage;