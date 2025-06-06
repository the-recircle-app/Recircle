import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "../context/WalletContext";
import { apiRequest } from "../lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { featureFlags } from "../lib/environment";

export const UserManagement = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { userId } = useWallet();
  const { toast } = useToast();

  const handleReset = async () => {
    if (!userId) return;

    setIsResetting(true);

    try {
      const response = await apiRequest("POST", `/api/users/${userId}/reset`, {});
      
      if (response.ok) {
        // Clear wallet connection but preserve user ID
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("connectedWallet");
        localStorage.setItem("userId", userId.toString());
        
        toast({
          title: "Data Reset Complete",
          description: `User ${userId} data reset. Refreshing...`,
        });
        
        // Reload to apply changes while maintaining user context
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error resetting user data:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset user data",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  const switchToUser = async (targetUserId: number) => {
    setIsSwitching(true);

    try {
      // Clear all connection data and set new user
      localStorage.clear();
      localStorage.setItem("userId", targetUserId.toString());
      
      toast({
        title: "Switching Users",
        description: `Switching to User ${targetUserId}...`,
      });
      
      // Reload to apply user switch
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error switching user:", error);
      toast({
        title: "Switch Failed",
        description: "Failed to switch user",
        variant: "destructive"
      });
    } finally {
      setIsSwitching(false);
    }
  };

  // Only show in development
  if (!featureFlags.showDevTools) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">User Management</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">Current: User {userId}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => switchToUser(1)}
            disabled={isSwitching || userId === 1}
          >
            Switch to User 1
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => switchToUser(102)}
            disabled={isSwitching || userId === 102}
          >
            Switch to User 102
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Data Reset</h3>
        <p className="text-sm text-gray-500 mb-2">
          Reset all data for User {userId} (balance, streak, receipts, transactions)
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={!userId}>
              Reset User {userId} Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset User {userId} Data</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all receipts, transactions, and reset the token balance to 0 for User {userId}.
                The wallet will be disconnected but you'll remain as User {userId}.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                disabled={isResetting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isResetting ? "Resetting..." : "Reset Data"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};