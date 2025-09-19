import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "../context/WalletContext";
import { WalletButton } from '@vechain/vechain-kit';
import { Button } from "../components/ui/button";
import ReCircleLogo from "../components/ReCircleLogo";
import ReCircleSymbol from "../components/ReCircleSymbol";
import ReCircleLogoEarth from "../components/ReCircleLogoEarth";
import B3trLogo from "../components/B3trLogo";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import ActivityCard from "../components/ActivityCard";
import SupportFooter from "../components/SupportFooter";
import TokenBalanceRefresher from "../components/TokenBalanceRefresher";
import { Link } from "wouter";

const Home = () => {
  const { userId, isConnected, tokenBalance, address, refreshTokenBalance } = useWallet();
  const [stats, setStats] = useState({
    totalRewards: 0,
    receiptsCount: 0,
    streak: 0,
    dailyActions: 0  // Add daily actions counter
  });

  // Get user receipts for stats
  const { data: receipts = [] } = useQuery<any[]>({
    queryKey: [userId ? `/api/users/${userId}/receipts` : null],
    enabled: !!userId && isConnected,
  });
  
  // Get transactions to track daily actions
  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: [userId ? `/api/users/${userId}/transactions` : null],
    enabled: !!userId && isConnected,
  });
  
  // Get user data including streak info - disabled automatic refetching to prevent infinite loops
  const { data: userData, refetch: refetchUserData } = useQuery<any>({
    queryKey: [isConnected && userId ? `/api/users/${userId}` : null],
    enabled: !!userId && isConnected,
    refetchInterval: false, // Completely disabled automatic refetching
    refetchOnWindowFocus: false, // Disabled automatic refetch on focus
    staleTime: 300000, // 5 minute stale time to prevent unnecessary requests
  });
  
  // Disabled to prevent infinite loops
  // useEffect(() => {
  //   if (userId && isConnected) {
  //     refetchUserData();
  //     console.log("Initial user data refresh on mount");
  //   }
  // }, [userId, isConnected]);
  
  // Add event listener for receipt approvals
  useEffect(() => {
    // Function to handle receipt approval events
    const handleReceiptApproval = () => {
      if (refreshTokenBalance) {
        refreshTokenBalance();
      }
      refetchUserData();
    };
    
    // Register event listener
    window.addEventListener('receipt-approved', handleReceiptApproval);
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('receipt-approved', handleReceiptApproval);
    };
  }, [refreshTokenBalance, refetchUserData]);

  // Set stats when component mounts or when data changes
  useEffect(() => {
    if (isConnected) {
      const receiptCount = Array.isArray(receipts) ? receipts.length : 0;
      const currentStreak = userData?.currentStreak || 0;
      
      // Calculate daily actions from transactions
      // Count only receipt_verification and store_addition transactions from today
      const today = new Date().toISOString().split('T')[0];
      const todayActions = Array.isArray(transactions) ? transactions.filter(tx => {
        if (tx.type !== 'receipt_verification' && tx.type !== 'store_addition') {
          return false;
        }
        if (!tx.createdAt) return false;
        const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
        return txDate === today;
      }).length : 0;
      

      
      // Only update if values have changed to prevent infinite loop
      if (stats.totalRewards !== tokenBalance || 
          stats.receiptsCount !== receiptCount || 
          stats.streak !== currentStreak ||
          stats.dailyActions !== todayActions) {
        setStats({
          totalRewards: tokenBalance,
          receiptsCount: receiptCount,
          streak: currentStreak,
          dailyActions: todayActions
        });
      }
    }
  }, [isConnected, tokenBalance, receipts, transactions, userData]); // Removed stats from dependencies to prevent infinite loop

  const blue = "#38BDF8"; // Bright cyan/blue for dark theme
  
  return (
    <div className="pb-24"> {/* Increased padding bottom for the navigation bar */}
      <Header gems={tokenBalance} streak={stats.streak} className="mb-2" />
      
      {/* Auto-refresh token balance component - disabled to prevent infinite loops */}
      {/* {isConnected && userId && (
        <TokenBalanceRefresher 
          userId={userId} 
          currentBalance={tokenBalance}
        />
      )} */}
      
      {/* VeChain Kit Smart Account Display */}
      {isConnected ? (
        <div className="p-4 border-b border-gray-700">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              {/* Use VeChain Kit's WalletButton - automatically shows smart account */}
              <WalletButton 
                mobileVariant="iconDomainAndAddress"
                desktopVariant="iconDomainAndAddress"
                buttonStyle={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0',
                  minHeight: 'auto',
                  fontSize: '14px',
                  color: '#f3f4f6'
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-gray-700">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-gray-300 mb-3">Connect your wallet to start earning B3TR tokens</p>
            <Link href="/">
              <Button className="w-full">
                Connect Wallet
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Progress banner */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg">Today's Goal</h2>
          <div className="flex items-center">
            <div className="bg-white/30 rounded-full px-2 py-1 text-xs font-medium">
              <span>{isConnected ? (stats.dailyActions >= 3 ? "3/3" : `${stats.dailyActions}/3`) : "0/3"} actions</span>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="bg-white/30 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-white h-full" 
            style={{ 
              width: isConnected 
                ? `${Math.min(stats.dailyActions / 3 * 100, 100)}%` 
                : '0%' 
            }}
          ></div>
        </div>
      </div>
      
      {/* Activity section */}

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl text-gray-100">Drive Change, Earn B3TR</h2>
          <Link href="/achievements">
            <button className="text-blue-300 text-sm font-medium">
              See All
            </button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {/* Primary Focus - Transportation Receipts */}
          <ActivityCard
            title="Upload Rideshare Receipt"
            description="Earn B3TR tokens for Uber, Lyft, Waymo rides & electric rentals"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                <path d="M13 7l2 0" />
              </svg>
            }
            color="#10B981"
            path="/scan"
            showReward={false}
            onClick={isConnected ? undefined : () => {
              // Scroll to top and focus on connect wallet button
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          


          {/* Public Transit Option */}
          <ActivityCard
            title="Upload Transit Receipt"
            description="Earn tokens for bus, metro, train & electric scooter trips"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M3 10h18" />
                <path d="M3 14h18" />
                <path d="M3 18h18" />
                <circle cx="7" cy="8" r="1" />
                <circle cx="17" cy="8" r="1" />
                <circle cx="7" cy="16" r="1" />
                <circle cx="17" cy="16" r="1" />
              </svg>
            }
            color="#6366F1"
            path="/scan"
            showReward={false}
            onClick={isConnected ? undefined : () => {
              // Scroll to top and focus on connect wallet button
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          
          {/* Electric Vehicle Rentals */}
          <ActivityCard
            title="Electric Vehicle Rental"
            description="Earn bonus tokens for Tesla, EV & hybrid rentals"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            }
            color="#10B981"
            path="/scan"
            showReward={false}
            onClick={isConnected ? undefined : () => {
              // Scroll to top and focus on connect wallet button
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          
          {/* Solo VeWorld Setup */}
          <ActivityCard
            title="🎯 Setup VeWorld for Real B3TR"
            description="Configure VeWorld to see your actual blockchain rewards"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            }
            color="#8B5CF6"
            path="/solo-setup"
            showReward={false}
            onClick={() => {}}
          />

          {/* Invite Friend */}
          <ActivityCard
            title="Invite a Friend"
            description="Earn tokens when friends join and scan their first receipt"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11l-3 3-3-3" />
              </svg>
            }
            color="#F59E0B"
            path="/invite-friend"
            showReward={false}
            onClick={isConnected ? undefined : () => {
              // Scroll to top and focus on connect wallet button
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Direct Token Redemption */}
          {isConnected && tokenBalance > 0 && (
            <ActivityCard
              title="⚡ Redeem Pending Tokens"
              description={`Convert your ${tokenBalance.toFixed(1)} database tokens to real blockchain B3TR`}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              }
              color="#EF4444"
              path=""
              showReward={false}
              onClick={async () => {
                if (!userId || !address) return;
                
                console.log('[HOMEPAGE-REDEEM] Using backend redemption with distributor wallet');
                
                const response = await fetch('/api/redeem-pending-tokens', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, walletAddress: address })
                });
                
                const result = await response.json();
                
                if (result.success) {
                  alert(`✅ Success! ${result.amount} B3TR distributed. TX: ${result.txHash?.slice(0, 10)}...`);
                  refreshTokenBalance();
                } else {
                  alert(`❌ Redemption failed: ${result.error}`);
                }
              }}
            />
          )}
        </div>
      </div>
      
      {/* Stats & Achievements Section */}
      <div className="p-4 bg-gray-800 rounded-lg mx-4 mb-4 border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg text-gray-100">Your Stats</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-600">
            <div className="text-xs text-gray-400 mb-1">Total Rewards</div>
            <div className="flex items-center">
              <span className="text-xl font-bold mr-2 text-gray-100">{Math.floor(stats.totalRewards)}</span>
              <div className="flex items-center">
                <B3trLogo className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-600">
            <div className="text-xs text-gray-400 mb-1">Verified Receipts</div>
            <div className="flex items-center">
              <span className="text-xl font-bold mr-2 text-gray-100">{stats.receiptsCount}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Achievements Section */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg text-gray-100">Recent Achievements</h2>
        </div>
        
        {isConnected ? (
          // Check if there are any achievement transactions
          transactions && transactions.some(tx => tx.type === 'achievement_reward') ? (
            <div className="bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-700 mb-4">
              <div className="flex items-center">
                <div className="bg-amber-900/50 rounded-full p-3 mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                </div>
                <div>
                  {/* Find the most recent achievement transaction */}
                  {(() => {
                    const achievementTxs = transactions.filter(tx => tx.type === 'achievement_reward');
                    if (achievementTxs.length === 0) return null;
                    
                    // Sort by most recent first
                    const sortedAchievements = [...achievementTxs].sort((a, b) => {
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    });
                    
                    const latestAchievement = sortedAchievements[0];
                    const description = latestAchievement.description || '';
                    
                    if (description.includes('first_store')) {
                      return (
                        <>
                          <h3 className="font-bold text-gray-200">First Store Added</h3>
                          <p className="text-sm text-gray-400">You've contributed to our community!</p>
                        </>
                      );
                    } else if (description.includes('first_receipt')) {
                      return (
                        <>
                          <h3 className="font-bold text-gray-200">First Receipt Scanned</h3>
                          <p className="text-sm text-gray-400">You've started your re-use journey!</p>
                        </>
                      );
                    } else if (description.includes('five_receipts')) {
                      return (
                        <>
                          <h3 className="font-bold text-gray-200">Five Receipts Scanned</h3>
                          <p className="text-sm text-gray-400">You're making great progress!</p>
                        </>
                      );
                    } else if (description.includes('ten_receipts')) {
                      return (
                        <>
                          <h3 className="font-bold text-gray-200">Ten Receipts Milestone</h3>
                          <p className="text-sm text-gray-400">You're a re-use and secondhand champion!</p>
                        </>
                      );
                    } else if (description.includes('music_store')) {
                      return (
                        <>
                          <h3 className="font-bold text-gray-200">Used Music Purchase</h3>
                          <p className="text-sm text-gray-400">Supporting secondhand music media!</p>
                        </>
                      );
                    } else if (description.includes('movie_store')) {
                      return (
                        <>
                          <h3 className="font-bold text-gray-200">Used Movie Purchase</h3>
                          <p className="text-sm text-gray-400">Reducing waste through used movies!</p>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <h3 className="font-bold text-gray-200">Achievement Unlocked</h3>
                          <p className="text-sm text-gray-400">{description.replace('Achievement Reward: ', '')}</p>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-700 mb-4">
              <div className="flex items-center">
                <div className="bg-gray-700 rounded-full p-3 mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-200">No Achievements Yet</h3>
                  <p className="text-sm text-gray-400">Submit transportation receipts from rides, transit, or electric vehicles to unlock achievements</p>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-700 text-center">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="mb-3">
                <ReCircleLogoEarth size="lg" variant="gradient" />
              </div>
              <h3 className="font-bold text-gray-100 mb-2">Connect to Start Earning</h3>
              <p className="text-sm text-gray-400 mb-4">
                Connect your wallet to earn B3TR tokens for sustainable transportation
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Support Footer - moved inside padded container */}
      <SupportFooter />
      
      {/* Bottom Navigation */}
      <BottomNavigation isConnected={isConnected} />
    </div>
  );
};

export default Home;
