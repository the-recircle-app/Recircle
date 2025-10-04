import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "../context/WalletContext";
import { vechain } from "../lib/vechain";
import TransactionHistory from "../components/TransactionHistory";
import StreakCelebration from "../components/StreakCelebration";
import { UserManagement } from "../components/UserManagement";
import LiveWalletAddress from "../components/LiveWalletAddress";
import { useState } from "react";
import { useLocation } from "wouter";
import { useSmartNavigation } from "../utils/navigation";
import { Settings } from "lucide-react";
import { SettingsMenu } from "../components/SettingsMenu";

const Profile = () => {
  const { isConnected, userId, address, tokenBalance, disconnect } = useWallet();
  const [, setLocation] = useLocation();
  const { goHome } = useSmartNavigation();
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streakCount, setStreakCount] = useState(7);
  const [showSettings, setShowSettings] = useState(false);

  const handleConnect = () => {
    // Redirect to home page which has the connect wallet button
    goHome();
  };
  
  // Handler for showing streak celebration with a specific count
  const showStreakCelebrationDemo = (count: number) => {
    setStreakCount(count);
    setShowStreakCelebration(true);
  };
  
  // Handler for when the celebration animation completes
  const handleStreakCelebrationComplete = () => {
    setShowStreakCelebration(false);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-gray-100 w-20 h-20 flex items-center justify-center mb-4">
          <i className="fa-solid fa-wallet text-gray-400 text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600 text-center mb-6 max-w-xs">
          Connect your VeChain wallet to view your profile and transaction history
        </p>
        <Button onClick={handleConnect} className="bg-primary">
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Streak Celebration */}
      {showStreakCelebration && (
        <StreakCelebration 
          isVisible={showStreakCelebration}
          onComplete={handleStreakCelebrationComplete}
          streakCount={streakCount}
        />
      )}
      {/* Back Button */}
      <div className="mb-4">
        <Button 
          variant="secondary" 
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium shadow-sm" 
          onClick={goHome}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </Button>
      </div>
      
      {/* Profile Header */}
      <Card className="bg-white rounded-lg shadow mb-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </Button>
        <CardContent className="p-6 text-center">
          <div className="inline-block h-24 w-24 rounded-full overflow-hidden bg-gray-100 mb-4">
            <div className="h-full w-full bg-gray-300 flex items-center justify-center">
              <i className="fa-solid fa-user text-gray-400 text-4xl"></i>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-1">Web3User</h2>
          <p className="mb-2 text-gray-500">
            <span className="wallet-address">
              <LiveWalletAddress fallbackAddress={address} formatted={true} />
            </span>
          </p>
          <div className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium">
            <i className="fa-solid fa-circle text-xs mr-1 text-green-500"></i> 
            Active Member
          </div>
        </CardContent>
      </Card>
      
      <SettingsMenu 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
    </div>
  );
};

export default Profile;
