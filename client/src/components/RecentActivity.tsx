import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "../context/WalletContext";
import { vechain } from "../lib/vechain";
import type { Transaction } from "../types";
import B3trLogo from "./B3trLogo";

const RecentActivity = () => {
  const { userId, isConnected } = useWallet();

  const { data: transactions, isLoading } = useQuery({
    queryKey: [userId ? `/api/users/${userId}/transactions` : null],
    enabled: !!userId && isConnected,
  });

  const activities = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.slice(0, 3).map((tx: Transaction) => {
      const formattedTx = vechain.formatTransactionForDisplay(tx);
      
      let iconClass = "fa-circle";
      let bgColorClass = "bg-gray-100";
      let iconColorClass = "text-gray-500";
      
      if (tx.type === "receipt_verification") {
        iconClass = "fa-receipt";
        bgColorClass = "bg-green-100";
        iconColorClass = "text-green-500";
      } else if (tx.type === "store_addition") {
        iconClass = "fa-store";
        bgColorClass = "bg-blue-100";
        iconColorClass = "text-blue-500";
      } else if (tx.type === "token_redemption") {
        iconClass = "fa-certificate";
        bgColorClass = "bg-orange-100";
        iconColorClass = "text-orange-500";
      }
      
      // Format time ago
      const txDate = new Date(tx.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - txDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo;
      if (diffHours < 1) {
        timeAgo = "Just now";
      } else if (diffHours === 1) {
        timeAgo = "1 hour ago";
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hours ago`;
      } else if (diffDays === 1) {
        timeAgo = "Yesterday";
      } else {
        timeAgo = `${diffDays} days ago`;
      }
      
      return {
        ...formattedTx,
        iconClass,
        bgColorClass,
        iconColorClass,
        timeAgo
      };
    });
  }, [transactions]);

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-14"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center py-8">
          <p className="text-gray-500 mb-4">Connect your wallet to view your recent activity</p>
        </CardContent>
      </Card>
    );
  }

  const blue = "#1565C0";

  return (
    <div>
      <CardContent className="divide-y">
        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No recent activity found</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="py-4 flex items-center">
              <div className={`${activity.bgColorClass} rounded-full p-3 mr-4 shadow-sm flex items-center justify-center`} style={{ width: "40px", height: "40px" }}>
                {activity.type === "receipt_verification" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                )}
                {activity.type === "store_addition" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                )}
                {activity.type === "token_redemption" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{activity.description.split(":")[0]}</p>
                <p className="text-sm text-gray-500">{activity.description.split(":")[1]?.trim()}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end mb-1">
                  <p className={`font-semibold mr-1 ${activity.amount > 0 ? "text-blue-600" : "text-red-500"}`}>
                    {activity.amount > 0 ? "+" : ""}{activity.amount.toFixed(1)}
                  </p>
                  <div className="flex items-center rounded-full bg-blue-100 p-1">
                    <B3trLogo className="w-4 h-4" color={blue} />
                  </div>
                </div>
                <p className="text-xs text-gray-500">{activity.timeAgo}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
      <div className="py-2 px-4 text-center border-t border-gray-100">
        <Button variant="ghost" className="text-blue-600 font-medium text-sm hover:text-blue-800 hover:bg-blue-50 w-full">
          View All Activity
        </Button>
      </div>
    </div>
  );
};

export default RecentActivity;
