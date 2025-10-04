import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { B3TRTransfer } from '@/components/B3TRTransfer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send as SendIcon } from 'lucide-react';
import BackButton from '@/components/BackButton';
import TokenIcon from '@/components/TokenIcon';
import { Link } from 'wouter';

export default function SendB3TR() {
  const { isConnected, tokenBalance, address: walletAddress, refreshUserData } = useWallet();
  const { toast } = useToast();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isConnected || !walletAddress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BackButton href="/home" />
          <h1 className="text-2xl font-bold">Send B3TR</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to send B3TR tokens
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/">
              <Button>Connect Wallet</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleSuccess = async (txId: string) => {
    console.log('[SEND] Transfer successful:', txId);
    
    toast({
      title: "Transfer Successful!",
      description: `${amount} B3TR sent successfully`,
    });

    setRecipientAddress('');
    setAmount('');
    setIsSending(false);
    
    await refreshUserData();
  };

  const handleError = (error: Error) => {
    console.error('[SEND] Transfer failed:', error);
    
    let errorMessage = "Transfer failed. Please try again.";
    if (error.message?.includes('user denied') || error.message?.includes('cancelled')) {
      errorMessage = "Transfer cancelled by user.";
    } else if (error.message?.includes('insufficient')) {
      errorMessage = "Insufficient balance or gas (VTHO).";
    }
    
    toast({
      title: "Transfer Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    setIsSending(false);
  };

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const amountNum = parseFloat(amount) || 0;
  const isValidAmount = amountNum > 0 && amountNum <= tokenBalance;
  const canSend = isValidAddress(recipientAddress) && isValidAmount;

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <BackButton href="/home" />
          <h1 className="text-2xl font-bold">Send B3TR</h1>
        </div>
        <TokenIcon value={tokenBalance} size="lg" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transfer B3TR Tokens</CardTitle>
          <CardDescription>
            Send B3TR tokens from your wallet to any VeChain address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 mb-4">
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 flex gap-3">
              <div className="text-blue-400 mt-0.5">ℹ️</div>
              <p className="text-sm text-blue-200">
                You need to send B3TR to a VeChain Wallet. If you don't have one, download VeWorld.
              </p>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 flex gap-3">
              <div className="text-blue-400 mt-0.5">ℹ️</div>
              <p className="text-sm text-blue-200">
                Sending to OceanX or other exchanges may result in loss of funds. Send the tokens to your VeWorld wallet first.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-base">Receiver Address *</Label>
            <Input
              id="recipient"
              placeholder="Enter receiver address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              disabled={isSending}
              className="bg-gray-800/50 border-gray-700"
            />
            {recipientAddress && !isValidAddress(recipientAddress) && (
              <p className="text-sm text-destructive">Invalid VeChain address</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount" className="text-base">Amount *</Label>
              <span className="text-sm text-muted-foreground">Balance: {tokenBalance} B3TR</span>
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={tokenBalance}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSending}
              className="bg-gray-800/50 border-gray-700"
            />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(((tokenBalance * percent) / 100).toFixed(2))}
                  disabled={isSending}
                  className="bg-gray-800/50 border-gray-700 hover:bg-gray-700"
                >
                  {percent}%
                </Button>
              ))}
            </div>
            {amountNum > tokenBalance && (
              <p className="text-sm text-destructive">Insufficient balance</p>
            )}
          </div>

          {recipientAddress && amount && canSend && (
            <div className="bg-primary/5 p-4 rounded-lg space-y-1">
              <p className="text-sm font-medium">Transfer Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">{amount} B3TR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To:</span>
                <span className="font-mono text-xs">
                  {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <B3TRTransfer
            recipientAddress={recipientAddress}
            amount={amount}
            onSuccess={handleSuccess}
            onError={handleError}
          >
            {({ sendTransfer, isPending }) => (
              <Button
                onClick={() => {
                  setIsSending(true);
                  sendTransfer();
                }}
                disabled={!canSend || isPending || isSending}
                className="w-full"
                size="lg"
              >
                {isPending || isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <SendIcon className="mr-2 h-4 w-4" />
                    Send B3TR
                  </>
                )}
              </Button>
            )}
          </B3TRTransfer>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Enter the recipient's VeChain address (starts with 0x)</p>
          <p>• Specify the amount of B3TR tokens to send</p>
          <p>• Review and confirm the transaction in your wallet</p>
          <p>• Transaction is processed on VeChain testnet</p>
        </CardContent>
      </Card>
    </div>
  );
}
