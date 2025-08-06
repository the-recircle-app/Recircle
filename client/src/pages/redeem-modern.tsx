import React from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/context/WalletContext';
// import { useWallet as useVeChainKitWallet } from '@vechain/vechain-kit'; // Temporarily disabled
import TokenIcon from '@/components/TokenIcon';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { VeChainKitRedeemButton, useB3TRToWei } from '@/components/VeChainKitB3TRTransfer'; // Temporarily disabled
import { apiRequest } from '@/lib/queryClient';

const ModernRedeemPage: React.FC = () => {
  const { toast } = useToast();
  const { isConnected, userId, tokenBalance, refreshUserData } = useWallet();
  // const { account } = useVeChainKitWallet(); // Temporarily disabled
  const account = null; // Fallback until VeChain Kit is restored

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

  if (!account?.address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Token Redemption</h1>
        <Card>
          <CardHeader>
            <CardTitle>VeChain Wallet Required</CardTitle>
            <CardDescription>
              Please connect your VeChain wallet to redeem B3TR tokens
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>
              Refresh Connection
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleRedeemSuccess = async (txReceipt: any) => {
    console.log('[REDEEM] ✅ VeChain Kit transaction successful:', txReceipt);
    
    try {
      // Update database to mark tokens as claimed
      await apiRequest(`/api/redeem-pending-tokens`, 'POST', {
        userId,
        transactionHash: txReceipt.meta?.txID || 'unknown',
        tokenAmount: tokenBalance
      });
      
      toast({
        title: "Tokens Claimed Successfully!",
        description: `${tokenBalance} B3TR transferred to your wallet using VeChain Kit!`,
        variant: "default",
      });
      
      // Refresh user data after successful redemption
      await refreshUserData();
      
    } catch (error) {
      console.error('[REDEEM] Database update failed:', error);
      toast({
        title: "Transaction successful, but database update failed",
        description: "Please contact support if your balance doesn't update.",
        variant: "destructive",
      });
    }
  };

  const handleRedeemError = (error: Error) => {
    console.error('[REDEEM] VeChain Kit transaction failed:', error);
    
    let errorMessage = "Transaction failed. Please try again.";
    if (error.message?.includes('user denied') || error.message?.includes('cancelled')) {
      errorMessage = "Transaction cancelled by user.";
    } else if (error.message?.includes('insufficient')) {
      errorMessage = "Insufficient gas (VTHO) for transaction.";
    }
    
    toast({
      title: "Transaction Failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <BackButton href="/" />
          <h1 className="text-2xl font-bold">B3TR Token Redemption</h1>
        </div>
        <TokenIcon value={tokenBalance} size="lg" />
      </div>
      
      <Card className="mb-8 overflow-hidden border-primary">
        <CardHeader className="bg-primary/5">
          <CardTitle>Modern VeChain Kit Redemption</CardTitle>
          <CardDescription>
            Use the official VeChain Kit to transfer B3TR tokens to your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TokenIcon value={tokenBalance} />
              <span>Available Balance</span>
            </div>
            <span className="text-sm text-gray-500">Connected: {account.address.substring(0, 6)}...{account.address.substring(-4)}</span>
          </div>
          
          <div className="space-y-4">
            {tokenBalance > 0 ? (
              <VeChainKitRedeemButton 
                userAddress={account.address}
                rewardAmount={tokenBalance}
                onSuccess={() => handleRedeemSuccess}
              />
            ) : (
              <Button disabled className="w-full">
                No tokens available to redeem
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>About VeChain Kit Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Uses official VeChain Kit v2.0 transaction modal</p>
            <p>• Automatic B3TR token contract integration</p>
            <p>• Real blockchain transactions with VeWorld</p>
            <p>• Proper transaction confirmation and error handling</p>
            <p>• Built-in fee delegation support</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernRedeemPage;