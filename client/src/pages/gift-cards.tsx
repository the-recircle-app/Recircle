import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "../context/WalletContext";
import { useWallet as useVeChainKitWallet } from "@vechain/vechain-kit";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Gift, CreditCard, CheckCircle, Clock, XCircle, Search, AlertCircle, Wallet, ExternalLink, ShieldCheck } from "lucide-react";
import LiveB3TRBalance from "../components/LiveB3TRBalance";
import B3trLogo from "../components/B3trLogo";
import { DirectB3TRTransfer } from "../components/DirectB3TRTransfer";
import { formatDistanceToNow } from "date-fns";

interface GiftCardProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  minAmount: number;
  maxAmount: number;
  imageUrl?: string;
  minB3TRAmount: number;
  markupUsd: number;
  b3trPriceUsd: number;
  countries?: string[];
  currencies?: string[];
}

export default function GiftCards() {
  const { userId, tokenBalance, isConnected, address: walletAddress } = useWallet();
  const { account } = useVeChainKitWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<GiftCardProduct | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'transferring' | 'verifying' | 'creating_order' | 'success' | 'error'>('idle');
  
  // Balance check states
  const [liveBalance, setLiveBalance] = useState<number>(tokenBalance);
  const [insufficientBalanceDialog, setInsufficientBalanceDialog] = useState(false);
  const [balanceCheckData, setBalanceCheckData] = useState<{ required: number; available: number } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debug Connex state
  const [connexDebugInfo, setConnexDebugInfo] = useState<any>(null);
  
  useEffect(() => {
    const checkConnex = () => {
      const info = {
        hasWindow: typeof window !== 'undefined',
        hasConnex: !!(window as any).connex,
        hasVendor: !!(window as any).connex?.vendor,
        hasSign: !!(window as any).connex?.vendor?.sign,
        hasThor: !!(window as any).connex?.thor,
        connexVersion: (window as any).connex?.version || 'N/A',
        timestamp: new Date().toISOString()
      };
      setConnexDebugInfo(info);
      console.log('[GIFT-CARDS] Connex check:', info);
    };
    
    // Check immediately and every 2 seconds
    checkConnex();
    const interval = setInterval(checkConnex, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const { data: catalogData, isLoading: catalogLoading } = useQuery<{
    catalog: GiftCardProduct[];
    b3trPriceUsd: number;
    markupUsd: number;
  }>({
    queryKey: ['/api/gift-cards/catalog'],
    enabled: isConnected,
  });

  const { data: priceData } = useQuery<{
    price: number;
    timestamp: number;
  }>({
    queryKey: ['/api/b3tr/price'],
    refetchInterval: 60000,
  });

  const { data: ordersData } = useQuery<{
    success: boolean;
    orders: any[];
  }>({
    queryKey: ['/api/gift-cards/orders'],
    enabled: isConnected,
  });

  const filteredCatalog = useMemo(() => {
    if (!catalogData?.catalog) return [];
    
    return catalogData.catalog.filter(product => {
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [catalogData, searchQuery]);

  const purchaseMutation = useMutation({
    mutationFn: async (data: any) => {
      setPaymentStatus('creating_order');
      const response = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Purchase failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setPaymentStatus('success');
      
      // Success toast with transaction details
      toast({
        title: "✅ Gift Card Purchased Successfully!",
        description: (
          <div className="space-y-2 mt-2">
            <p>Your ${amount} {selectedProduct?.name} gift card has been sent to {email}</p>
            {paymentTxHash && (
              <div className="flex items-center gap-2 text-xs">
                <ExternalLink className="h-3 w-3" />
                <span>TX: {paymentTxHash.slice(0, 10)}...{paymentTxHash.slice(-8)}</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Check your email for redemption details</p>
          </div>
        ),
        duration: 8000,
      });
      
      // Reset states after short delay to show success
      setTimeout(() => {
        setPurchaseModalOpen(false);
        setAmount("");
        setEmail("");
        setSelectedProduct(null);
        setIsPaymentStep(false);
        setPaymentTxHash(null);
        setPaymentStatus('idle');
        setIsVerifyingPayment(false);
      }, 2000);
      
      queryClient.invalidateQueries({ queryKey: ['/api/gift-cards/orders'] });
    },
    onError: (error: Error) => {
      setPaymentStatus('error');
      
      // More detailed error messages based on error type
      let errorTitle = "Purchase Failed";
      let errorDescription = error.message;
      
      if (error.message.includes('blockchain verification')) {
        errorTitle = "❌ Payment Verification Failed";
        errorDescription = "Could not verify your B3TR payment on the blockchain. Please ensure the transaction was confirmed.";
      } else if (error.message.includes('network')) {
        errorTitle = "🌐 Network Error";
        errorDescription = "Connection issue occurred. Please check your network and try again.";
      } else if (error.message.includes('insufficient')) {
        errorTitle = "💰 Insufficient Funds";
        errorDescription = "Your B3TR balance is too low for this purchase.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
        duration: 6000,
      });
      
      setIsPaymentStep(false);
      setPaymentStatus('idle');
      setIsVerifyingPayment(false);
    },
  });

  const handlePurchase = () => {
    if (!selectedProduct || !amount || !email || !confirmEmail) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Normalize emails (trim whitespace, lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedConfirmEmail = confirmEmail.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      toast({
        title: "⚠️ Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Validate emails match
    if (normalizedEmail !== normalizedConfirmEmail) {
      toast({
        title: "⚠️ Emails Don't Match",
        description: "Please make sure both email addresses are the same",
        variant: "destructive",
      });
      return;
    }

    if (!account?.address) {
      toast({
        title: "⚠️ Wallet Not Connected",
        description: "Please connect your VeWorld wallet to continue",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < selectedProduct.minAmount || amountNum > selectedProduct.maxAmount) {
      toast({
        title: "⚠️ Invalid Amount",
        description: `Amount must be between $${selectedProduct.minAmount} and $${selectedProduct.maxAmount}`,
        variant: "destructive",
      });
      return;
    }

    const b3trCost = calculateB3TRCost(amountNum);
    
    // Check live balance before proceeding
    if (b3trCost > liveBalance) {
      setBalanceCheckData({
        required: b3trCost,
        available: liveBalance
      });
      setInsufficientBalanceDialog(true);
      return;
    }

    // Move to payment step
    setIsPaymentStep(true);
    setPaymentStatus('idle');
  };

  const handlePaymentSuccess = (txId: string) => {
    console.log('[GIFT-CARD] Payment successful, txId:', txId);
    setPaymentTxHash(txId);
    setPaymentStatus('verifying');
    setIsVerifyingPayment(true);
    
    // Show verifying toast
    toast({
      title: "🔍 Verifying Payment",
      description: "Confirming your B3TR transaction on the blockchain...",
      duration: 3000,
    });
    
    // Simulate blockchain verification delay before calling purchase API
    setTimeout(() => {
      if (selectedProduct && amount && email && account?.address) {
        const amountNum = parseFloat(amount);
        purchaseMutation.mutate({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          amount: amountNum,
          currency: 'USD',
          email: email.trim().toLowerCase(),
          txHash: txId,
          connectedWallet: account.address,
        });
      }
    }, 1500);
  };

  const handlePaymentError = (error: Error) => {
    console.error('[GIFT-CARD] Payment failed:', error);
    setPaymentStatus('error');
    
    // Show the actual error message for debugging
    const actualError = error.message || error.toString() || "Unknown error";
    console.error('[GIFT-CARD] Actual error message:', actualError);
    
    // Distinguish between different error types
    let errorTitle = "❌ Payment Failed";
    let errorDescription = actualError; // Show actual error for debugging
    
    if (error.message?.toLowerCase().includes('reject') || error.message?.toLowerCase().includes('denied')) {
      errorTitle = "🚫 Transaction Rejected";
      errorDescription = "You rejected the transaction in your wallet. No B3TR was transferred.";
    } else if (error.message?.toLowerCase().includes('insufficient')) {
      errorTitle = "💰 Insufficient B3TR Balance";
      errorDescription = `You don't have enough B3TR. Required: ${calculateB3TRCost(parseFloat(amount || '0')).toFixed(2)} B3TR`;
    } else if (error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('timeout')) {
      errorTitle = "🌐 Network Error";
      errorDescription = "Network connection issue. Please check your connection and try again.";
    } else if (error.message?.toLowerCase().includes('connex')) {
      errorTitle = "🔗 VeWorld Not Detected";
      errorDescription = "Cannot connect to VeWorld wallet. Please ensure you're using the VeWorld app and try again.";
    } else if (error.message?.toLowerCase().includes('invalid transaction')) {
      errorTitle = "⚠️ Transaction Setup Failed";
      errorDescription = "Could not prepare the transaction. Please refresh and try again.";
    }
    
    toast({
      title: errorTitle,
      description: errorDescription,
      variant: "destructive",
      duration: 8000,
    });
    
    setIsPaymentStep(false);
    setPaymentStatus('idle');
  };

  const calculateB3TRCost = (usdAmount: number): number => {
    if (!catalogData?.markupUsd || !catalogData?.b3trPriceUsd) return 0;
    const totalUsd = usdAmount + catalogData.markupUsd;
    return Math.ceil((totalUsd / catalogData.b3trPriceUsd) * 100) / 100;
  };

  // Update live balance when it changes
  const handleBalanceChange = (newBalance: number) => {
    setLiveBalance(newBalance);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header gems={0} streak={0} />
        <div className="p-4 text-center">
          <p className="text-gray-400">Connect your wallet to access the gift card marketplace</p>
        </div>
        <BottomNavigation isConnected={isConnected} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      <Header gems={tokenBalance} streak={0} />

      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Gift Card Marketplace</h1>
          <p className="text-gray-400">Redeem your B3TR tokens for real gift cards</p>
          
          <div className="mt-4 bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Balance:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  <LiveB3TRBalance 
                    fallbackBalance={tokenBalance} 
                    onBalanceChange={handleBalanceChange}
                  />
                </span>
                <B3trLogo className="w-6 h-6" color="#38BDF8" />
              </div>
            </div>
            {priceData?.price && (
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-500">B3TR Price:</span>
                <span className="text-gray-400">${priceData.price.toFixed(4)} USD</span>
              </div>
            )}
          </div>
        </div>


        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-pink-600">
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-pink-600">
              My Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="mt-4">
            {catalogLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search gift cards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <span className="text-sm text-gray-400">
                      {filteredCatalog.length} gift cards
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCatalog?.map((product: GiftCardProduct) => (
                  <Card key={product.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-white">{product.name}</CardTitle>
                          <p className="text-sm text-gray-400 mt-1">{product.description}</p>
                        </div>
                        <Gift className="h-6 w-6 text-pink-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Amount Range</p>
                          <p className="text-sm text-gray-300">${product.minAmount} - ${product.maxAmount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Starting from</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-blue-400">{product.minB3TRAmount}</p>
                            <B3trLogo className="w-5 h-5" color="#38BDF8" />
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedProduct(product);
                            setPurchaseModalOpen(true);
                          }}
                          className="w-full bg-pink-600 hover:bg-pink-700"
                        >
                          Redeem
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <div className="space-y-4">
              {ordersData?.orders && ordersData.orders.length > 0 ? (
                ordersData.orders.map((order: any) => (
                  <Card key={order.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{order.giftCardName}</h3>
                          <p className="text-sm text-gray-400">${order.usdAmount} Gift Card</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {order.status === 'fulfilled' && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {order.status === 'processing' && (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                          {order.status === 'failed' && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="text-gray-300 capitalize">{order.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">B3TR Spent:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-blue-400">{order.b3trAmount?.toFixed(2)}</span>
                            <B3trLogo className="w-4 h-4" color="#38BDF8" />
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span className="text-gray-300 truncate max-w-[150px]">{order.userEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Purchased:</span>
                          <span className="text-gray-300">
                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {order.tremendousOrderId && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Order ID:</span>
                            <span className="text-gray-300 font-mono text-xs truncate max-w-[150px]">
                              {order.tremendousOrderId}
                            </span>
                          </div>
                        )}
                        {order.txHash && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Transaction:</span>
                            <span className="text-gray-300 font-mono text-xs truncate max-w-[150px]">
                              {order.txHash.slice(0, 6)}...{order.txHash.slice(-4)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Gift className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No orders yet</p>
                  <p className="text-sm text-gray-500 mt-2">Start redeeming gift cards with your B3TR!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={purchaseModalOpen} onOpenChange={(open) => {
        setPurchaseModalOpen(open);
        if (!open) {
          setIsPaymentStep(false);
          setPaymentTxHash(null);
          setPaymentStatus('idle');
          setIsVerifyingPayment(false);
          setEmail("");
          setConfirmEmail("");
          setAmount("");
        }
      }}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Redeem {selectedProduct?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {isPaymentStep ? (
                paymentStatus === 'verifying' ? 
                  'Verifying your payment on the blockchain...' :
                paymentStatus === 'creating_order' ?
                  'Creating your gift card order...' :
                paymentStatus === 'success' ?
                  'Purchase successful! Check your email.' :
                  'Confirm payment in your VeWorld wallet'
              ) : 'Enter amount and confirm your email address to continue'}
            </DialogDescription>
          </DialogHeader>

          {!isPaymentStep ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">Gift Card Amount (USD)</label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`${selectedProduct?.minAmount} - ${selectedProduct?.maxAmount}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={selectedProduct?.minAmount}
                  max={selectedProduct?.maxAmount}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmEmail" className="block text-sm font-medium mb-1">Confirm Email Address</label>
                <Input
                  id="confirmEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Gift card will be sent to this email - please double-check!</p>
              </div>
              {amount && parseFloat(amount) >= (selectedProduct?.minAmount || 0) && (
                <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Gift Card Value:</span>
                    <span className="text-white">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Markup:</span>
                    <span className="text-white">${catalogData?.markupUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-gray-600 pt-2">
                    <span className="text-gray-300">B3TR Cost:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-400">{calculateB3TRCost(parseFloat(amount)).toFixed(2)}</span>
                      <B3trLogo className="w-4 h-4" color="#38BDF8" />
                    </div>
                  </div>
                  
                  {/* Live balance check */}
                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-gray-400">Your Balance:</span>
                    <div className="flex items-center gap-1">
                      <span className={calculateB3TRCost(parseFloat(amount)) > liveBalance ? "text-red-400" : "text-green-400"}>
                        {liveBalance.toFixed(2)}
                      </span>
                      <B3trLogo className="w-4 h-4" color={calculateB3TRCost(parseFloat(amount)) > liveBalance ? "#EF4444" : "#10B981"} />
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handlePurchase}
                disabled={!amount || !email || !confirmEmail}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Continue to Payment
              </Button>
            </div>
          ) : (
            <DirectB3TRTransfer
              recipientAddress='0x119761865b79bea9e7924edaa630942322ca09d1'
              amount={calculateB3TRCost(parseFloat(amount || '0')).toString()}
              userAddress={walletAddress || ''}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            >
              {({ sendTransfer, isPending, error, txReceipt }) => {
                console.log('[GIFT-CARD] DirectB3TRTransfer render:', {
                  sendTransfer: typeof sendTransfer,
                  isPending,
                  error: error?.message,
                  txReceipt: !!txReceipt,
                  paymentStatus,
                  amount: calculateB3TRCost(parseFloat(amount || '0')).toString(),
                  recipientAddress: '0x119761865b79bea9e7924edaa630942322ca09d1',
                  userAddress: walletAddress,
                  accountAddress: account?.address,
                  hasConnex: !!window.connex,
                });
                return (
                <div className="space-y-4">
                  {/* Payment status indicator */}
                  {paymentStatus === 'success' && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-semibold text-green-400">Purchase Successful!</p>
                        <p className="text-sm text-gray-400">Your gift card has been sent to {email}</p>
                      </div>
                    </div>
                  )}

                  {paymentStatus === 'verifying' && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-blue-500 animate-pulse" />
                      <div>
                        <p className="font-semibold text-blue-400">Verifying Payment</p>
                        <p className="text-sm text-gray-400">Confirming transaction on blockchain...</p>
                      </div>
                    </div>
                  )}

                  {paymentStatus === 'creating_order' && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex items-center gap-3">
                      <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                      <div>
                        <p className="font-semibold text-purple-400">Creating Order</p>
                        <p className="text-sm text-gray-400">Processing your gift card purchase...</p>
                      </div>
                    </div>
                  )}

                  {paymentStatus !== 'success' && paymentStatus !== 'verifying' && paymentStatus !== 'creating_order' && (
                    <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-white">Payment Required</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gift Card:</span>
                          <span className="text-white">${parseFloat(amount || '0').toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Markup:</span>
                          <span className="text-white">${catalogData?.markupUsd.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-gray-600 pt-2">
                          <span className="text-gray-300">B3TR Payment:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-blue-400">{calculateB3TRCost(parseFloat(amount || '0')).toFixed(2)}</span>
                            <B3trLogo className="w-4 h-4" color="#38BDF8" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!txReceipt && paymentStatus !== 'verifying' && paymentStatus !== 'creating_order' && paymentStatus !== 'success' && (
                    <>
                      {/* Warning: Don't close browser */}
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-400">Important: Do not close this window</p>
                          <p className="text-xs text-gray-400 mt-1">
                            After approving the payment in your wallet, wait for the order confirmation. Closing the app early may result in losing your B3TR without receiving the gift card.
                          </p>
                        </div>
                      </div>
                      
                      <Button
                      onClick={() => {
                        console.log('[GIFT-CARD] Pay button clicked!', {
                          sendTransfer: typeof sendTransfer,
                          isPending,
                          purchaseMutation: purchaseMutation.isPending,
                          paymentStatus,
                          hasConnex: !!window.connex,
                          connexVersion: window.connex?.version,
                        });
                        sendTransfer();
                      }}
                      disabled={isPending || purchaseMutation.isPending}
                      className="w-full bg-pink-600 hover:bg-pink-700"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Waiting for wallet confirmation...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay with B3TR
                        </>
                      )}
                    </Button>
                    </>
                  )}

                  {txReceipt && !purchaseMutation.isPending && paymentStatus !== 'success' && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm text-green-400 font-semibold">Payment sent!</p>
                        <p className="text-xs text-gray-400 mt-1">TX: {txReceipt.meta?.txID?.slice(0, 10)}...</p>
                      </div>
                    </div>
                  )}

                  {purchaseMutation.isPending && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {paymentStatus === 'verifying' ? 'Verifying payment...' : 'Creating your gift card order...'}
                    </div>
                  )}

                  {error && !txReceipt && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-400">Payment Failed</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {error.message?.toLowerCase().includes('reject') ? 
                              'Transaction was rejected in wallet' :
                              'Please try again or contact support'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}}
            </DirectB3TRTransfer>
          )}
        </DialogContent>
      </Dialog>

      {/* Insufficient Balance Warning Dialog */}
      <AlertDialog open={insufficientBalanceDialog} onOpenChange={setInsufficientBalanceDialog}>
        <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-yellow-500" />
              Insufficient B3TR Balance
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-gray-300">
                <p>You don't have enough B3TR tokens to complete this purchase.</p>
                
                {balanceCheckData && (
                  <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Required:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-red-400 font-bold">{balanceCheckData.required.toFixed(2)}</span>
                        <B3trLogo className="w-4 h-4" color="#EF4444" />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Your Balance:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 font-bold">{balanceCheckData.available.toFixed(2)}</span>
                        <B3trLogo className="w-4 h-4" color="#EAB308" />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-600 pt-2">
                      <span className="text-gray-400">Shortage:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-orange-400 font-bold">
                          {(balanceCheckData.required - balanceCheckData.available).toFixed(2)}
                        </span>
                        <B3trLogo className="w-4 h-4" color="#FB923C" />
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-sm">You can earn more B3TR tokens by:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Recycling more items</li>
                  <li>• Completing daily challenges</li>
                  <li>• Maintaining your streak</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="bg-gray-700 hover:bg-gray-600"
              onClick={() => setInsufficientBalanceDialog(false)}
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DEBUG PANEL - Remove after testing */}
      {connexDebugInfo && (
        <div className="fixed bottom-20 right-4 bg-black/90 text-green-400 p-4 rounded-lg text-xs font-mono max-w-xs z-50 border border-green-500">
          <div className="text-yellow-400 mb-2">🔍 CONNEX DEBUG</div>
          <div>Window: {connexDebugInfo.hasWindow ? '✅' : '❌'}</div>
          <div>Connex: {connexDebugInfo.hasConnex ? '✅' : '❌'}</div>
          <div>Vendor: {connexDebugInfo.hasVendor ? '✅' : '❌'}</div>
          <div>Sign: {connexDebugInfo.hasSign ? '✅' : '❌'}</div>
          <div>Thor: {connexDebugInfo.hasThor ? '✅' : '❌'}</div>
          <div>Version: {connexDebugInfo.connexVersion}</div>
          <div className="text-gray-500 mt-1">{new Date(connexDebugInfo.timestamp).toLocaleTimeString()}</div>
        </div>
      )}

      <BottomNavigation isConnected={isConnected} />
    </div>
  );
}