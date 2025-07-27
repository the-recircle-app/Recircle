import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

interface VeChainKitRedeemButtonProps {
  userAddress: string;
  rewardAmount: number;
  onSuccess?: (result: any) => void;
}

export function VeChainKitRedeemButton({ 
  userAddress, 
  rewardAmount, 
  onSuccess 
}: VeChainKitRedeemButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRedeem = async () => {
    if (!userAddress || rewardAmount <= 0) {
      toast({
        title: "Error",
        description: "Invalid redemption request",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('[REDEEM] Triggering VeBetterDAO distribution for:', {
        userAddress,
        rewardAmount,
        addressLength: userAddress.length,
        fullAddress: userAddress
      });

      // Call our backend API that handles VeBetterDAO distribution
      const result = await apiRequest('/api/redeem-pending-tokens', 'POST', {
        userId: null, // Will be resolved from wallet address  
        walletAddress: userAddress
      });

      console.log('[REDEEM] ✅ VeBetterDAO distribution successful:', result);

      toast({
        title: "Redemption Successful!",
        description: `${rewardAmount} B3TR tokens have been distributed to your wallet`,
      });

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      console.error('[REDEEM] ❌ VeBetterDAO distribution failed:', error);
      
      toast({
        title: "Redemption Failed",
        description: "Failed to distribute B3TR tokens. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 Send B3TR Tokens</h3>
        <p className="text-sm text-blue-700 mb-3">
          Redeem {rewardAmount} B3TR reward tokens
        </p>
        <div className="text-xs text-blue-600">
          • Tokens will be sent from VeBetterDAO distributor
          • Destination: {userAddress.substring(0, 6)}...{userAddress.substring(-4)}
          • Real blockchain transaction on VeChain testnet
        </div>
      </div>

      <Button 
        onClick={handleRedeem}
        disabled={isLoading || rewardAmount <= 0}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Distributing B3TR...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send with Modal
          </>
        )}
      </Button>
      
      <div className="text-xs text-gray-500 text-center">
        This triggers VeBetterDAO smart contract distribution
      </div>
    </div>
  );
}