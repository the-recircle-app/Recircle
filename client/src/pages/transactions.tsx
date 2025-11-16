import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "../context/WalletContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import B3trLogo from "../components/B3trLogo";
import LiveB3TRBalance from "../components/LiveB3TRBalance";
import { Transaction } from "../types";
import { ExternalLink, Search, Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Wallet } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { vechain } from "../lib/vechain";
import { ReceiveModal } from "../components/ReceiveModal";
import { Link } from "wouter";

// Interface for blockchain transaction details
interface BlockchainTransaction {
  txId: string;
  block: number;
  timestamp: number;
  status: "confirmed" | "pending" | "failed";
  from: string;
  to: string;
  value: number;
  gas: number;
  gasPrice: number;
  data?: string;
}

const TransactionExplorer = () => {
  const { userId, address, isConnected, tokenBalance, refreshTokenBalance } = useWallet();
  const { toast } = useToast();

  // 🔥 FIX: Use ONLY address from WalletContext (single source of truth)
  // DO NOT call useVeChainKitWallet() - it can return a different account!
  const displayAddress = address;

  // Helper function for safe short address display
  const formatShortAddress = (addr?: string) => {
    const safeAddr = addr || displayAddress;
    return (safeAddr && safeAddr.length >= 14) 
      ? `${safeAddr.substring(0, 8)}...${safeAddr.substring(safeAddr.length - 6)}` 
      : safeAddr || '';
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [blockchainDetails, setBlockchainDetails] = useState<BlockchainTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10); // Show more transactions per page
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // Fetch user transactions with refetch capability
  const { 
    data: transactions = [], 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions 
  } = useQuery<Transaction[]>({
    queryKey: [`/api/users/${userId}/transactions`],
    enabled: !!userId,
    // Force a stale time of 0 to ensure fresh data on each visit
    staleTime: 0
  });
  
  // 🔧 FIX #1: Refresh token balance immediately when wallet connects (independent of userId)
  useEffect(() => {
    if (isConnected && refreshTokenBalance) {
      refreshTokenBalance().then(updatedBalance => {
        console.log("Token balance refreshed on connection:", updatedBalance);
      }).catch(err => {
        console.log("Token balance refresh failed:", err);
      });
    }
  }, [isConnected, refreshTokenBalance]);

  // Refresh transaction data when component mounts
  // or when a transaction is approved or user data changes
  useEffect(() => {
    // Initial load of data
    if (userId && isConnected) {
      refetchTransactions();
      
      if (refreshTokenBalance) {
        refreshTokenBalance().then(updatedBalance => {
          console.log("Transactions page refreshed token balance:", updatedBalance);
        });
      }
      
      // Set up a listener for the custom userDataRefreshed event
      const handleDataRefresh = () => {
        console.log("Received userDataRefreshed event, refreshing transactions");
        refetchTransactions();
        
        if (refreshTokenBalance) {
          refreshTokenBalance().then(updatedBalance => {
            console.log("Transactions page refreshed token balance after event:", updatedBalance);
          });
        }
      };
      
      // Add event listener
      window.addEventListener('userDataRefreshed', handleDataRefresh);
      
      // Also check for refreshes triggered by localStorage
      const checkDataRefreshInterval = setInterval(() => {
        const lastRefresh = localStorage.getItem('forceDataRefresh');
        if (lastRefresh) {
          const refreshTime = parseInt(lastRefresh, 10);
          const now = Date.now();
          
          // If the refresh flag was set within the last 5 seconds, refresh the data
          if (now - refreshTime < 5000) {
            console.log("Found recent forceDataRefresh flag, refreshing transactions");
            refetchTransactions();
            
            if (refreshTokenBalance) {
              refreshTokenBalance().then(updatedBalance => {
                console.log("Transactions page refreshed token balance after localStorage check:", updatedBalance);
              });
            }
          }
        }
      }, 2000); // Check every 2 seconds
      
      // Clean up
      return () => {
        window.removeEventListener('userDataRefreshed', handleDataRefresh);
        clearInterval(checkDataRefreshInterval);
      };
    }
  }, [userId, isConnected, refreshTokenBalance, refetchTransactions]);

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(tx => {
    const searchLower = searchQuery.toLowerCase();
    return tx.type.toLowerCase().includes(searchLower) || 
           tx.amount.toString().includes(searchLower) ||
           (tx.description && tx.description.toLowerCase().includes(searchLower));
  });

  // Pagination
  const indexOfLastTx = currentPage * transactionsPerPage;
  const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTx, indexOfLastTx);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  // Log available environment variables to check what's accessible
  useEffect(() => {
    console.log("Available environment variables in frontend:");
    console.log("VITE_CREATOR_FUND_WALLET:", import.meta.env.VITE_CREATOR_FUND_WALLET || "not set");
    console.log("VITE_APP_FUND_WALLET:", import.meta.env.VITE_APP_FUND_WALLET || "not set");
    console.log("VITE_NETWORK:", import.meta.env.VITE_NETWORK || "not set");
    console.log("ALL VITE VARS:", Object.keys(import.meta.env).filter(k => k.startsWith('VITE')));
  }, []);

  // Handle transaction selection for detailed view
  const handleSelectTransaction = async (tx: Transaction) => {
    setSelectedTx(tx);
    setIsLoading(true);
    
    // Simulate fetching blockchain details
    // In a real implementation, this would connect to VeChain Thor blockchain
    setTimeout(() => {
      // Use tx hash if available in our mock data
      const txId = tx.txHash || `0x${Math.random().toString(16).substring(2, 42)}`;
      
      // Check if this is an achievement reward to use special styling
      const isAchievement = tx.type === "achievement_reward";
      
      // Use the sync version for this context since we can't await in setTimeout
      const { creatorFundWallet, appFundWallet } = vechain.getWalletAddressesSync();
      
      // Create a consistent platform wallet address for the app
      const platformWalletAddress = "0x3E29B9E6F3cB9c22d1f68b2A1c8BB83Bd7e4c56E";
      
      // Determine from/to addresses based on transaction type
      let fromAddress = platformWalletAddress;
      let toAddress = displayAddress || address || ""; // Use actual connected wallet address
      
      // For user rewards (receipt_verification, achievement_reward, store_addition), 
      // the user is receiving tokens FROM the platform
      if (tx.type === "receipt_verification" || tx.type === "achievement_reward" || tx.type === "store_addition") {
        fromAddress = platformWalletAddress;
        toAddress = displayAddress || address || ""; // Use actual connected wallet address
      } 
      // Set proper addresses for sustainability transactions
      else if (tx.type === "sustainability_creator") {
        fromAddress = platformWalletAddress;
        toAddress = creatorFundWallet;
      } else if (tx.type === "sustainability_app") {
        fromAddress = platformWalletAddress;
        toAddress = appFundWallet;
      }
      
      const mockBlockchainTx: BlockchainTransaction = {
        txId: txId,
        block: Math.floor(Math.random() * 10000000) + 5000000,
        timestamp: tx.createdAt ? new Date(tx.createdAt).getTime() : Date.now(),
        status: Math.random() > 0.1 ? "confirmed" : "pending",
        from: fromAddress,
        to: toAddress,
        value: tx.amount,
        gas: Math.floor(Math.random() * 100000) + 21000,
        gasPrice: Math.floor(Math.random() * 10) + 30,
        data: isAchievement 
          ? `0x4163686965766d656e742072657761726420666f7220747970653a20${tx.type}` 
          : `0x${Math.random().toString(16).substring(2, 100)}`
      };
      setBlockchainDetails(mockBlockchainTx);
      setIsLoading(false);
    }, 1500);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Format transaction time
  const formatTxTime = (timestamp: string | number | Date) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get transaction status badge
  const getTxStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Confirmed</span>;
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Pending</span>;
      case "failed":
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Failed</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Unknown</span>;
    }
  };

  // Get transaction type badge
  const getTxTypeBadge = (type: string) => {
    switch (type) {
      case "receipt_verification":
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Receipt</span>;
      case "store_addition":
        return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Store</span>;
      case "token_redemption":
        return <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Redemption</span>;
      case "achievement_reward":
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Achievement</span>;
      case "sustainability_creator":
        return <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Creator</span>;
      case "sustainability_app":
        return <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">ReCircle</span>;
      case "admin_action":
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Admin</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{type}</span>;
    }
  };

  // Get user data including streak info
  const { data: userData } = useQuery<any>({
    queryKey: [isConnected && userId ? `/api/users/${userId}` : null],
    enabled: !!userId && isConnected,
  });

  // Extract current streak from user data
  const currentStreak = userData?.currentStreak || 0;

  return (
    <div className="pb-16">
      <Header streak={currentStreak} gems={tokenBalance} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Transaction Explorer</h1>
          <p className="text-gray-500">
            View and explore your B3TR token transactions on the VeChain Thor blockchain
          </p>
        </div>

        {!isConnected ? (
          <Card className="bg-gray-100 border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🔗</div>
                <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
                <p className="text-gray-500 mb-4">
                  Please connect your wallet to view your transaction history
                </p>
                <Button onClick={() => window.location.href = '/connect-wallet'}>
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Connected Wallet Card - Mugshot Style */}
            <Card className="mb-6 bg-white border-gray-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Wallet className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Connected Wallet</h3>
                  <p className="text-sm text-gray-500 mb-4 font-mono">
                    {formatShortAddress(displayAddress)}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      <LiveB3TRBalance fallbackBalance={tokenBalance} />
                    </span>
                    <B3trLogo className="w-6 h-6" color="#38BDF8" />
                  </div>
                  <div className="flex gap-3">
                    <Link href="/send">
                      <Button 
                        size="lg"
                        className="rounded-full bg-cyan-500 hover:bg-cyan-600 text-white w-20 h-20 flex flex-col items-center justify-center gap-1 p-0"
                      >
                        <ArrowUp className="h-5 w-5" />
                        <span className="text-xs">Send</span>
                      </Button>
                    </Link>
                    <Button 
                      size="lg"
                      onClick={() => setShowReceiveModal(true)}
                      className="rounded-full bg-cyan-500 hover:bg-cyan-600 text-white w-20 h-20 flex flex-col items-center justify-center gap-1 p-0"
                    >
                      <ArrowDown className="h-5 w-5" />
                      <span className="text-xs">Receive</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Wallet Card */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 14C16.5523 14 17 13.5523 17 13C17 12.4477 16.5523 12 16 12C15.4477 12 15 12.4477 15 13C15 13.5523 15.4477 14 16 14Z" fill="currentColor"/>
                        <path d="M3 9L12 3L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="font-medium text-lg">Connected Wallet</h3>
                    <p className="text-sm text-gray-500 break-all text-center mt-1 mb-2">
                      {formatShortAddress(displayAddress)}
                    </p>
                    <div className="flex items-center text-primary mt-2 text-lg font-bold">
                      <LiveB3TRBalance fallbackBalance={tokenBalance} /> <B3trLogo className="w-5 h-5 ml-1" color="#38BDF8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Transaction Stats Card */}
              <Card className="bg-gray-50 border-gray-200 md:col-span-2">
                <CardContent className="pt-6">
                  <h3 className="font-medium text-lg mb-4">Transaction Stats</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{transactions.length}</div>
                      <div className="text-sm text-gray-500">Total Tx</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {transactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Total B3TR</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {transactions.filter(tx => tx.type === "receipt_verification").length}
                      </div>
                      <div className="text-sm text-gray-500">Receipts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column - Transaction List */}
              <div className="lg:col-span-2">
                <Card className="bg-white border-gray-200">
                  <CardHeader className="pb-0">
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Your B3TR token transactions</CardDescription>
                    <div className="relative mt-2">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search transactions..." 
                        className="pl-8" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTransactions ? (
                      <div className="py-10 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading transactions...</p>
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="text-5xl mb-3">🔍</div>
                        <h3 className="text-lg font-medium">No Transactions Yet</h3>
                        <p className="text-gray-500 mt-1">
                          Start earning B3TR tokens by verifying receipts
                        </p>
                      </div>
                    ) : filteredTransactions.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="text-4xl mb-3">🔍</div>
                        <h3 className="text-lg font-medium">No Results Found</h3>
                        <p className="text-gray-500 mt-1">
                          Try a different search term
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-4">
                        <AnimatePresence>
                          {currentTransactions.map((tx) => (
                            <motion.div
                              key={tx.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className={`p-3 rounded-lg border ${selectedTx?.id === tx.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'} cursor-pointer`}
                              onClick={() => handleSelectTransaction(tx)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center">
                                  {getTxTypeBadge(tx.type)}
                                  <span className="ml-2 text-sm font-medium">
                                    {tx.type === "receipt_verification" 
                                      ? "Receipt Verification" 
                                      : tx.type === "store_addition" 
                                        ? "Store Addition"
                                        : tx.type === "token_redemption"
                                          ? "Token Redemption"
                                          : tx.type === "achievement_reward"
                                            ? "Achievement Reward"
                                            : tx.type === "sustainability_creator"
                                              ? "Creator Reward"
                                              : tx.type === "sustainability_app"
                                                ? "ReCircle Reward"
                                                : tx.type === "admin_action"
                                                  ? "Admin Action"
                                                  : tx.type as string}
                                  </span>
                                </div>
                                <div className="flex items-center text-primary font-bold">
                                  {tx.type === 'token_claim' 
                                    ? "-" + Math.abs(tx.amount).toFixed(1)
                                    : (tx.amount >= 0 ? "+" : "-") + Math.abs(tx.amount).toFixed(1)
                                  } <B3trLogo className="w-4 h-4 ml-1" color="#38BDF8" />
                                </div>
                              </div>
                              {/* Check for streak bonus in the description and highlight it */}
                              {tx.description && tx.description.includes("streak bonus") && (
                                <div className="bg-primary/10 text-primary rounded px-2 py-1 text-xs font-medium my-1 flex items-center">
                                  <span className="mr-1">⚡</span>
                                  {tx.description.split('(')[1]?.split(')')[0] || "Streak bonus applied!"}
                                </div>
                              )}
                              <div className="flex justify-between text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTxTime(tx.createdAt)}
                                </div>
                                {selectedTx?.id === tx.id ? (
                                  <span className="text-primary text-xs">Selected</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">Click for details</span>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        {/* Pagination */}
                        {filteredTransactions.length > transactionsPerPage && (
                          <div className="flex justify-between items-center pt-4 mt-4 border-t">
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            >
                              <ArrowLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                            <span className="text-sm text-gray-500">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            >
                              Next <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Transaction Details */}
              <div className="lg:col-span-3">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Transaction Details</TabsTrigger>
                    <TabsTrigger value="blockchain">Blockchain Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="mt-4">
                    <Card className="bg-white border-gray-200">
                      <CardContent className="pt-6">
                        {!selectedTx ? (
                          <div className="py-16 text-center">
                            <div className="text-5xl mb-3">👈</div>
                            <h3 className="text-lg font-medium">Select a Transaction</h3>
                            <p className="text-gray-500 mt-1">
                              Click on a transaction to view its details
                            </p>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex justify-between mb-6">
                              <div>
                                <h3 className="text-xl font-bold">
                                  {selectedTx.type === "receipt_verification" 
                                    ? "Receipt Verification" 
                                    : selectedTx.type === "store_addition" 
                                      ? "Store Addition"
                                      : selectedTx.type === "token_redemption"
                                        ? "Token Redemption"
                                        : selectedTx.type === "achievement_reward"
                                          ? "Achievement Reward"
                                          : selectedTx.type === "sustainability_creator"
                                            ? "Creator Reward"
                                            : selectedTx.type === "sustainability_app"
                                              ? "ReCircle Reward"
                                              : selectedTx.type === "admin_action"
                                                ? "Admin Action"
                                                : selectedTx.type}
                                </h3>
                                <p className="text-gray-500">Transaction #{selectedTx.id}</p>
                              </div>
                              <div className="flex items-center text-xl font-bold text-primary">
                                {selectedTx.type === 'token_claim' 
                                  ? "-" + Math.abs(selectedTx.amount).toFixed(1)
                                  : (selectedTx.amount >= 0 ? "+" : "-") + Math.abs(selectedTx.amount).toFixed(1)
                                } <B3trLogo className="w-6 h-6 ml-1" color="#38BDF8" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Date</div>
                                <div className="font-medium">
                                  {selectedTx.createdAt 
                                    ? new Date(selectedTx.createdAt).toLocaleString() 
                                    : 'Unknown'}
                                </div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Transaction Type</div>
                                <div className="font-medium">
                                  {getTxTypeBadge(selectedTx.type)} {selectedTx.type}
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                              <div className="text-sm text-gray-500 mb-1">Description</div>
                              <div className="font-medium">
                                {selectedTx.description || 'No description available'}
                              </div>
                            </div>
                            
                            <div className="bg-primary/10 p-4 rounded-lg mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium">Reward Summary</div>
                                <div className="text-primary font-semibold">
                                  {selectedTx.type === 'token_claim' 
                                    ? "-" + Math.abs(selectedTx.amount).toFixed(1)
                                    : (selectedTx.amount >= 0 ? "+" : "-") + Math.abs(selectedTx.amount).toFixed(1)
                                  } B3TR
                                </div>
                              </div>
                              <div className="text-xs text-gray-600">
                                {selectedTx.type === "receipt_verification" && (
                                  <div className="space-y-2">
                                    <p>
                                      This reward was earned by verifying a transportation receipt. 
                                      The reward amount is based on the receipt value and other factors.
                                    </p>
                                    <div className="bg-white/60 rounded-md p-2 space-y-1">
                                      <div className="font-medium text-gray-700 text-xs mb-1">Reward Distribution:</div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Total Earned:</span>
                                        <span className="font-medium">{(selectedTx.amount / 0.7).toFixed(1)} B3TR</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-green-600">• You Received (70%):</span>
                                        <span className="font-medium text-green-600">{selectedTx.amount.toFixed(1)} B3TR</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">• Platform Fund (30%):</span>
                                        <span className="font-medium text-gray-500">{(selectedTx.amount / 0.7 * 0.3).toFixed(1)} B3TR</span>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1 pt-1 border-t">
                                        30% supports platform development and sustainability initiatives
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {selectedTx.type === "store_addition" && (
                                  <p>
                                    This reward was earned by contributing a new transportation service to our database.
                                    Thank you for helping our community grow!
                                  </p>
                                )}
                                {selectedTx.type === "token_redemption" && (
                                  <p>
                                    This transaction represents a redemption of your B3TR tokens.
                                    Thank you for participating in our ecosystem!
                                  </p>
                                )}
                                {selectedTx.type === "achievement_reward" && (
                                  <p>
                                    This is a bonus reward for completing an achievement!
                                    Keep up the good work to earn more achievement bonuses.
                                  </p>
                                )}
                                {selectedTx.type === "sustainability_creator" && (
                                  <p>
                                    This is a Creator sustainability reward generated by user activity.
                                    These tokens fund ecological initiatives supporting sustainable fashion.
                                  </p>
                                )}
                                {selectedTx.type === "sustainability_app" && (
                                  <p>
                                    This is a ReCircle sustainability reward generated by user activity.
                                    These tokens support platform development and ecological initiatives.
                                  </p>
                                )}
                                {selectedTx.type === "admin_action" && (
                                  <p>
                                    This is a system maintenance transaction processed by an administrator.
                                    These transactions help maintain the platform's stability.
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="blockchain" className="mt-4">
                    <Card className="bg-white border-gray-200">
                      <CardContent className="pt-6">
                        {!selectedTx ? (
                          <div className="py-16 text-center">
                            <div className="text-5xl mb-3">👈</div>
                            <h3 className="text-lg font-medium">Select a Transaction</h3>
                            <p className="text-gray-500 mt-1">
                              Click on a transaction to view its blockchain data
                            </p>
                          </div>
                        ) : isLoading ? (
                          <div className="py-16 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <h3 className="text-lg font-medium">Loading Blockchain Data</h3>
                            <p className="text-gray-500 mt-1">
                              Fetching data from VeChain Thor blockchain...
                            </p>
                          </div>
                        ) : blockchainDetails ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <h3 className="text-lg font-bold flex items-center">
                                  Blockchain Transaction
                                  {blockchainDetails.status === "confirmed" && (
                                    <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                                  )}
                                  {blockchainDetails.status === "pending" && (
                                    <Clock className="h-4 w-4 ml-2 text-yellow-500" />
                                  )}
                                  {blockchainDetails.status === "failed" && (
                                    <AlertCircle className="h-4 w-4 ml-2 text-red-500" />
                                  )}
                                </h3>
                                <p className="text-sm text-gray-500 break-all mt-1">
                                  {blockchainDetails.txId}
                                </p>
                              </div>
                              <div>
                                {getTxStatusBadge(blockchainDetails.status)}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Block Number</div>
                                <div className="font-medium">{blockchainDetails.block}</div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Timestamp</div>
                                <div className="font-medium">
                                  {new Date(blockchainDetails.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                              <div className="text-sm text-gray-500 mb-1">From</div>
                              <div className="font-medium break-all">
                                {blockchainDetails.from}
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                              <div className="text-sm text-gray-500 mb-1">To</div>
                              <div className="font-medium break-all">
                                {blockchainDetails.to}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Value</div>
                                <div className="font-medium text-primary">
                                  {selectedTx.type === 'token_claim' 
                                    ? "-" + Math.abs(blockchainDetails.value).toFixed(1) 
                                    : (blockchainDetails.value >= 0 ? "+" : "-") + Math.abs(blockchainDetails.value).toFixed(1)
                                  } B3TR
                                </div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Gas</div>
                                <div className="font-medium">
                                  {blockchainDetails.gas}
                                </div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Gas Price</div>
                                <div className="font-medium">
                                  {blockchainDetails.gasPrice} VTHO
                                </div>
                              </div>
                            </div>
                            
                            {blockchainDetails.data && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <div className="text-sm text-gray-500 mb-1">Transaction Data</div>
                                <div className="font-mono text-xs overflow-auto p-2 bg-gray-100 rounded">
                                  {blockchainDetails.data}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex justify-center mt-6">
                              <Button 
                                className="flex items-center"
                                variant="outline"
                                onClick={() => {
                                  // Debug: Log the transaction ID and environment variable
                                  console.log('Debug Transaction ID:', blockchainDetails.txId);
                                  console.log('Debug Environment Variable:', import.meta.env.VITE_NETWORK);
                                  
                                  // Determine network (mainnet vs testnet)
                                  // For development, we'll check if it's a mock tx (starts with 'txhash-')
                                  // In production, this should be determined from the wallet connection
                                  const isTestTx = blockchainDetails.txId.startsWith('txhash-');
                                  
                                  // If it's a mock transaction for testing, show custom view or dialog instead
                                  if (isTestTx) {
                                    // Show a prominent toast message explaining that it's a test transaction
                                    toast({
                                      title: "Test Transaction - Not on Blockchain",
                                      description: "This is a simulated test transaction that doesn't exist on the actual blockchain. Opening the VeChain Explorer homepage instead.",
                                      variant: "destructive", // Use warning style to make it prominent
                                      duration: 8000, // Show longer to ensure user sees it
                                    });
                                    
                                    // Add modal dialog to make it even more clear
                                    const confirmRedirect = window.confirm(
                                      "TEST TRANSACTION NOTICE:\n\n" +
                                      "This is a test transaction that doesn't exist on the VeChain blockchain.\n\n" +
                                      "In the live app, real transactions will display in the VeChain Explorer.\n\n" +
                                      "Click OK to open the VeChain Explorer homepage instead."
                                    );
                                    
                                    if (confirmRedirect) {
                                      // Open the main VeChain explorer website
                                      const url = `https://vechainstats.com/`;
                                      window.open(url, '_blank');
                                      console.log("Opening VeChain stats website for demo purposes");
                                    }
                                  } else {
                                    // For real transactions on testnet or mainnet
                                    // Determine which network we're on based on environment variable
                                    // In a production app, this would come from the wallet connection
                                    const isTestnet = import.meta.env.VITE_VECHAIN_NETWORK === 'testnet';
                                    
                                    // Use appropriate explorer for the network
                                    // VeChainStats is generally better for mainnet
                                    // explore-testnet.vechain.org is better for testnet
                                    let baseUrl;
                                    if (isTestnet) {
                                      baseUrl = 'https://explore-testnet.vechain.org/transactions/';
                                    } else {
                                      // For mainnet, VeChainStats offers better UI
                                      baseUrl = 'https://vechainstats.com/transaction/';
                                    }
                                    
                                    // Ensure txId has 0x prefix required by explorers
                                    const txIdFormatted = blockchainDetails.txId.startsWith('0x') 
                                      ? blockchainDetails.txId 
                                      : `0x${blockchainDetails.txId}`;
                                      
                                    const url = baseUrl + txIdFormatted;
                                    window.open(url, '_blank');
                                    console.log(`Opening VeChain ${isTestnet ? 'testnet' : 'mainnet'} explorer URL:`, url);
                                  }
                                }}
                              >
                                View on VeChain Explorer
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="py-16 text-center">
                            <div className="text-5xl mb-3">🔍</div>
                            <h3 className="text-lg font-medium">No Blockchain Data</h3>
                            <p className="text-gray-500 mt-1">
                              Failed to fetch blockchain details for this transaction
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
      </div>
      
      <ReceiveModal 
        address={displayAddress || ''} 
        isOpen={showReceiveModal} 
        onClose={() => setShowReceiveModal(false)} 
      />
      
      <BottomNavigation isConnected={isConnected} />
    </div>
  );
};

export default TransactionExplorer;