import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "../context/WalletContext";
import { vechain } from "../lib/vechain";
import TransactionHistory from "../components/TransactionHistory";
import StreakCelebration from "../components/StreakCelebration";
import { UserManagement } from "../components/UserManagement";
import { useState } from "react";
import { useLocation } from "wouter";

const Profile = () => {
  const { isConnected, userId, address, tokenBalance, disconnect } = useWallet();
  const [, setLocation] = useLocation();
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streakCount, setStreakCount] = useState(7);

  const handleConnect = () => {
    // Redirect to home page which has the connect wallet button
    setLocation("/");
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
          onClick={() => setLocation("/")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </Button>
      </div>
      
      {/* Profile Header */}
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardContent className="p-6 text-center">
          <div className="inline-block h-24 w-24 rounded-full overflow-hidden bg-gray-100 mb-4">
            <div className="h-full w-full bg-gray-300 flex items-center justify-center">
              <i className="fa-solid fa-user text-gray-400 text-4xl"></i>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-1">Web3User</h2>
          <p className="mb-2 text-gray-500">
            <span className="wallet-address">{vechain.formatAddress(address)}</span>
          </p>
          <div className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium">
            <i className="fa-solid fa-circle text-xs mr-1 text-green-500"></i> 
            Active Member
          </div>
        </CardContent>
      </Card>
      
      {/* Token Balance */}
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardHeader className="p-4 border-b">
          <CardTitle className="font-semibold">B3TR Token Balance</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="mb-3">
            <span className="text-3xl font-bold text-primary">{tokenBalance.toFixed(1)}</span>
            <span className="ml-1 text-lg font-medium text-primary">B3TR</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="py-2" onClick={() => setLocation("/redeem")}>
              <i className="fa-solid fa-arrow-up mr-1"></i> Send
            </Button>
            <Button className="py-2 bg-primary" onClick={() => setLocation("/redeem")}>
              <i className="fa-solid fa-certificate mr-1"></i> Redeem
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Transaction History */}
      <TransactionHistory />
      
      {/* Settings */}
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardHeader className="p-4 border-b">
          <CardTitle className="font-semibold">Settings</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-gray-500">Get alerts for rewards and activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Biometric Authentication</p>
              <p className="text-sm text-gray-500">Use fingerprint or face ID</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="p-4 space-y-4">
            <UserManagement />
            <div className="text-gray-500 text-sm text-center p-4 bg-gray-50 rounded-lg">
              💡 Use the wallet button on the home page to disconnect
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Developer Test Section - For streak celebration testing - Only visible in development */}
      {import.meta.env.DEV && (
        <Card className="bg-white rounded-lg shadow mb-6 border-dashed border-2 border-orange-500">
          <CardHeader className="p-4 border-b bg-orange-50">
            <CardTitle className="font-semibold flex items-center">
              <div className="mr-2 text-orange-500">🔥</div>
              Streak Celebration Test Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500 mb-3">
              This section is for testing purposes only. Click a button to preview how the streak celebration
              will appear for the corresponding milestone.
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-4">
              {[3, 5, 7, 10, 14, 21, 30].map((days) => (
                <Button 
                  key={days}
                  variant="outline" 
                  className="text-sm py-1 px-2"
                  onClick={() => showStreakCelebrationDemo(days)}
                >
                  {days} Days
                </Button>
              ))}
            </div>
            
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
              Note: In the real app, streak celebrations appear automatically when users reach milestone streaks.
              This testing tool lets you preview the celebration animations.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
