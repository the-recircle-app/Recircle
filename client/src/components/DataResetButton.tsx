import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "../context/WalletContext";
import { apiRequest } from "../lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const DataResetButton = () => {
  const [isResetting, setIsResetting] = useState(false);
  const { userId, refreshTokenBalance, refreshUserData } = useWallet();
  const { toast } = useToast();

  const handleReset = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "No user ID found",
        variant: "destructive"
      });
      return;
    }

    setIsResetting(true);

    try {
      const response = await apiRequest("POST", `/api/users/${userId}/reset`, {});
      
      if (response.ok) {
        const result = await response.json();
        
        // Clear all localStorage to force a clean state
        localStorage.clear();
        
        // Set the current user ID back to maintain context
        localStorage.setItem("userId", userId.toString());
        
        toast({
          title: "Data Reset Complete",
          description: `All data for user ${userId} has been reset successfully. Reloading...`,
        });
        
        // Reload the page to apply all changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to reset data");
      }
    } catch (error) {
      console.error("Error resetting user data:", error);
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset user data",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={!userId}>
          Reset Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset User Data</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all receipts, transactions, and reset your token balance to 0 for user {userId}.
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
  );
};