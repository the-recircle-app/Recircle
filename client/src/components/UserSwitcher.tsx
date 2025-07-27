import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "../context/WalletContext";

export const UserSwitcher = () => {
  const [isSwitching, setIsSwitching] = useState(false);
  const { userId, refreshTokenBalance, refreshUserData } = useWallet();
  const { toast } = useToast();

  const switchToUser = async (targetUserId: number) => {
    setIsSwitching(true);

    try {
      // Store the new user ID in localStorage
      localStorage.setItem("userId", targetUserId.toString());
      
      // Clear any wallet address to force demo mode
      localStorage.removeItem("walletAddress");
      
      // Refresh the page to apply the changes
      window.location.reload();
      
      toast({
        title: "User Switched",
        description: `Switched to User ${targetUserId}`,
      });
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

  return (
    <div className="flex items-center gap-2">
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
  );
};