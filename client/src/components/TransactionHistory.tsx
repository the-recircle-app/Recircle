import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "../context/WalletContext";
import { useAchievements } from "../context/AchievementContext";
import { vechain } from "../lib/vechain";
import type { Transaction } from "../types";

const TransactionHistory = () => {
  const { userId, isConnected } = useWallet();
  const { checkForNewAchievements } = useAchievements();
  const [displayLimit, setDisplayLimit] = useState(15);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const { data: transactions, isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: [userId ? `/api/users/${userId}/transactions` : null],
    enabled: !!userId && isConnected,
    refetchInterval: 3000, // Refetch every 3 seconds to ensure all transactions are loaded
    staleTime: 1000, // Consider data stale after 1 second
  });

  const formattedTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    // Sort transactions by createdAt date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sortedTransactions.map((tx: Transaction) => {
      // Format date
      const date = new Date(tx.createdAt);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      // Ensure token claims always have negative amounts
      const fixedAmount = tx.type === 'token_claim' 
        ? -Math.abs(tx.amount) // Force negative for token claims
        : tx.amount;
      
      return {
        ...tx,
        formattedDate: `${formattedDate} at ${formattedTime}`,
        formattedAmount: parseFloat(fixedAmount.toFixed(1)), // Parse to remove trailing zeros if needed
        amountClass: fixedAmount >= 0 ? "text-secondary" : "text-red-500"
      };
    });
  }, [transactions]);
  
  // Force the transaction display to update when new transactions are loaded
  useEffect(() => {
    console.log("Transaction data refreshed with count:", transactions ? transactions.length : 0);
  }, [transactions]);
  
  // Limit the visible transactions
  const visibleTransactions = formattedTransactions.slice(0, displayLimit);
  
  // Update the showLoadMore state when transactions change
  useEffect(() => {
    if (formattedTransactions && formattedTransactions.length > displayLimit) {
      setShowLoadMore(true);
    } else {
      setShowLoadMore(false);
    }
  }, [formattedTransactions, displayLimit]);
  
  // Only check for achievement unlocks once when component initially loads
  // This prevents repeated achievement popups during regular polling
  useEffect(() => {
    const hasTransactions = transactions && Array.isArray(transactions) && transactions.length > 0;
    // Only check once when component mounts and data is available
    if (hasTransactions) {
      // We do not call checkForNewAchievements() here anymore to prevent
      // repeated popups. The AchievementContext will handle checking achievements
      // when actual user actions occur.
      console.log("TransactionHistory loaded with transaction data");
    }
  }, []);
  
  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 5);
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardHeader className="p-4 border-b flex justify-between items-center">
          <CardTitle className="font-semibold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex justify-between items-start mb-1">
                <div className="w-32">
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardHeader className="p-4 border-b flex justify-between items-center">
          <CardTitle className="font-semibold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Connect your wallet to view transaction history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardHeader className="p-4 border-b flex justify-between items-center">
        <CardTitle className="font-semibold">Transaction History</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary font-medium">Export</Button>
      </CardHeader>
      <CardContent className="p-0">
        {formattedTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="w-full overflow-x-hidden">
            <div className="divide-y divide-gray-100">
              {visibleTransactions.map((tx: any) => (
                <div key={tx.id} className="px-4 py-3">
                  {/* Use CSS Grid for more robust layout */}
                  <div className="grid grid-cols-12 gap-2 mb-1">
                    {/* Left column: Transaction type - fixed at 5 columns */}
                    <div className="col-span-5">
                      <div className="bg-gray-50 px-2 py-1 rounded-md text-center">
                        <span className="font-medium text-sm block truncate">
                          {/* Show wallet destination for clarity */}
                          {tx.type === "receipt_verification" && "User Reward"}
                          {tx.type === "store_addition" && "User Reward"}
                          {tx.type === "token_redemption" && "Redemption"}
                          {tx.type === "token_claim" && "Token Claim"}
                          {tx.type === "achievement_reward" && "User Reward"}
                          {tx.type === "sustainability_creator" && "Creator Fund"}
                          {tx.type === "sustainability_app" && "App Fund"}
                          {tx.type === "admin_action" && "Admin"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Right column: Amount - fixed at 7 columns */}
                    <div className="col-span-7 text-right">
                      <div className={`inline-block px-2 py-1 rounded-md ${tx.formattedAmount >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                        <span className="font-semibold text-sm whitespace-nowrap">
                          {tx.type === 'token_claim' 
                            ? "-" + Math.abs(tx.formattedAmount) + " B3TR"
                            : (tx.formattedAmount >= 0 ? "+" : "-") + Math.abs(tx.formattedAmount) + " B3TR"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description row */}
                  <div className="mb-1 bg-white px-2 py-1 rounded-md">
                    <div className="text-xs text-gray-500 truncate w-full">
                      {tx.type === "sustainability_creator" 
                        ? "Creator sustainability fund (additional tokens)" 
                        : tx.type === "sustainability_app"
                          ? "App sustainability fund (additional tokens)"
                          : tx.type === "admin_action"
                            ? "System maintenance action"
                            : tx.type === "receipt_verification" 
                              ? "Transportation receipt reward → Connected wallet"
                              : tx.type === "store_addition"
                                ? "Added new transportation service → Connected wallet"
                                : tx.type === "achievement_reward"
                                  ? "Achievement bonus → Connected wallet"
                                  : tx.type === "token_claim"
                                    ? "Claimed to blockchain wallet"
                                    : tx.description.includes(":") 
                                      ? tx.description.split(":")[1].trim().substring(0, 25) + (tx.description.split(":")[1].trim().length > 25 ? "..." : "") 
                                      : tx.description.substring(0, 25) + (tx.description.length > 25 ? "..." : "")
                      }
                    </div>
                  </div>
                  
                  {/* Bottom row: Date and VeChain link */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div>
                      {tx.formattedDate}
                    </div>
                    <div>
                      {tx.txHash && (
                        <>
                          {tx.txHash.startsWith('0x') ? (
                            <a 
                              href={`https://explore.vechain.org/transactions/${tx.txHash}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary ml-2"
                            >
                              View on VeChain
                            </a>
                          ) : (
                            <span className="text-amber-500 ml-2" title="This is a simulated transaction. In production, this would be a real blockchain transaction.">
                              {tx.type === 'token_claim' ? 'Pending Claim' : 'Demo Transaction'}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      {showLoadMore && (
        <CardFooter className="p-3 text-center border-t">
          <Button 
            variant="link" 
            className="text-primary font-medium text-sm w-full"
            onClick={handleLoadMore}
          >
            Load More
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TransactionHistory;
