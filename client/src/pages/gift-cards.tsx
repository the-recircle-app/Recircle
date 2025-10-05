import { useState, useMemo } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Gift, CreditCard, CheckCircle, Clock, XCircle, Search } from "lucide-react";
import LiveB3TRBalance from "../components/LiveB3TRBalance";
import B3trLogo from "../components/B3trLogo";
import { B3TRTransfer } from "../components/B3TRTransfer";
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
  const { userId, tokenBalance, isConnected } = useWallet();
  const { account } = useVeChainKitWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<GiftCardProduct | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');

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
    onSuccess: () => {
      toast({
        title: "Gift card purchased!",
        description: "Check your email for your gift card details.",
      });
      setPurchaseModalOpen(false);
      setAmount("");
      setEmail("");
      setSelectedProduct(null);
      setIsPaymentStep(false);
      setPaymentTxHash(null);
      queryClient.invalidateQueries({ queryKey: ['/api/gift-cards/orders'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
      setIsPaymentStep(false);
    },
  });

  const handlePurchase = () => {
    if (!selectedProduct || !amount || !email || !account?.address) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < selectedProduct.minAmount || amountNum > selectedProduct.maxAmount) {
      toast({
        title: "Invalid amount",
        description: `Amount must be between $${selectedProduct.minAmount} and $${selectedProduct.maxAmount}`,
        variant: "destructive",
      });
      return;
    }

    const b3trCost = calculateB3TRCost(amountNum);
    if (b3trCost > tokenBalance) {
      toast({
        title: "Insufficient balance",
        description: `You need ${b3trCost.toFixed(2)} B3TR but only have ${tokenBalance.toFixed(2)} B3TR`,
        variant: "destructive",
      });
      return;
    }

    // Move to payment step
    setIsPaymentStep(true);
  };

  const handlePaymentSuccess = (txId: string) => {
    console.log('[GIFT-CARD] Payment successful, txId:', txId);
    setPaymentTxHash(txId);
    
    // Now call the purchase API with the transaction hash
    // Backend verifies payment using authenticated user's wallet from database
    // and checks that current connected wallet matches stored wallet
    if (selectedProduct && amount && email && account?.address) {
      const amountNum = parseFloat(amount);
      purchaseMutation.mutate({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        amount: amountNum,
        currency: 'USD',
        email,
        txHash: txId,
        connectedWallet: account.address, // Current VeChain Kit connected wallet
      });
    }
  };

  const handlePaymentError = (error: Error) => {
    console.error('[GIFT-CARD] Payment failed:', error);
    toast({
      title: "Payment failed",
      description: error.message || "B3TR transfer failed. Please try again.",
      variant: "destructive",
    });
    setIsPaymentStep(false);
  };

  const calculateB3TRCost = (usdAmount: number): number => {
    if (!catalogData?.markupUsd || !catalogData?.b3trPriceUsd) return 0;
    const totalUsd = usdAmount + catalogData.markupUsd;
    return Math.ceil((totalUsd / catalogData.b3trPriceUsd) * 100) / 100;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header gems={0} streak={0} />
        <div className="p-4 text-center">
          <p className="text-gray-400">Connect your wallet to access the gift card marketplace</p>
        </div>
        <BottomNavigation />
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
                  <LiveB3TRBalance fallbackBalance={tokenBalance} />
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
        }
      }}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Redeem {selectedProduct?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {isPaymentStep ? 'Confirm payment in your VeWorld wallet' : 'Enter the amount and your email to receive the gift card'}
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
                />
                <p className="text-xs text-gray-500 mt-1">Gift card will be sent to this email</p>
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
                </div>
              )}

              <Button
                onClick={handlePurchase}
                disabled={!amount || !email}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Continue to Payment
              </Button>
            </div>
          ) : (
            <B3TRTransfer
              recipientAddress={process.env.VITE_APP_FUND_WALLET || '0x119761865b79bea9e7924edaa630942322ca09d1'}
              amount={calculateB3TRCost(parseFloat(amount || '0')).toString()}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            >
              {({ sendTransfer, isPending, error, txReceipt }) => (
                <div className="space-y-4">
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

                  {!txReceipt && (
                    <Button
                      onClick={sendTransfer}
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
                  )}

                  {purchaseMutation.isPending && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating your gift card order...
                    </div>
                  )}

                  {error && !txReceipt && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                      Payment failed. Please try again.
                    </div>
                  )}
                </div>
              )}
            </B3TRTransfer>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}
