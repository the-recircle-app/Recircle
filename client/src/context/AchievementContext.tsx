import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@/context/WalletContext';
import { apiRequest } from '@/lib/queryClient';
import { Receipt, Transaction } from '@/types';
import { AchievementType } from '@/components/ShareAchievement';
import AchievementNotification from '@/components/AchievementNotification';
import ShareAchievement, { createAchievement } from '@/components/ShareAchievement';
import { useLocation } from 'wouter';

interface AchievementContextType {
  checkForNewAchievements: () => void;
  getAchievementProgress: (type: AchievementType) => { unlocked: boolean; progress: number };
  hasUnlockedAchievement: (type: AchievementType) => boolean;
  shareAchievement: (type: AchievementType) => void;
}

const AchievementContext = createContext<AchievementContextType>({
  checkForNewAchievements: () => {},
  getAchievementProgress: () => ({ unlocked: false, progress: 0 }),
  hasUnlockedAchievement: () => false,
  shareAchievement: () => {},
});

function AchievementProvider({ children }: { children: ReactNode }) {
  const [activeNotification, setActiveNotification] = useState<AchievementType | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareAchievementType, setShareAchievementType] = useState<AchievementType | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<AchievementType>>(new Set());
  const [displayedAchievements, setDisplayedAchievements] = useState<Set<string>>(new Set());
  
  // Track new achievements that haven't been shown to the user yet
  const [newAchievements, setNewAchievements] = useState<AchievementType[]>([]);
  
  const { userId } = useWallet();
  const queryClient = useQueryClient();
  const [location] = useLocation(); // Get current location for auto-dismiss
  
  // Automatically dismiss notifications when the route changes
  useEffect(() => {
    if (activeNotification) {
      setActiveNotification(null);
    }
  }, [location]);
  
  // Get receipts data for current user or test user 102
  const { data: receipts = [] } = useQuery<Receipt[]>({
    queryKey: [`/api/users/${userId || 102}/receipts`],
    enabled: !!userId || true, // Always enable for test user
  });

  // Get transactions data for current user or test user 102
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: [`/api/users/${userId || 102}/transactions`],
    enabled: !!userId || true, // Always enable for test user
  });
  
  // Function to calculate achievement progress
  const getAchievementProgress = (type: AchievementType): { unlocked: boolean; progress: number } => {
    // Allow calculating progress for test user 102 as well as logged in users
    
    switch(type) {
      case 'first_receipt':
        return { 
          unlocked: receipts.length >= 1, 
          progress: Math.min(receipts.length / 1 * 100, 100) 
        };
      
      case 'five_receipts':
        return { 
          unlocked: receipts.length >= 5, 
          progress: Math.min(receipts.length / 5 * 100, 100) 
        };
      
      case 'ten_receipts':
        return { 
          unlocked: receipts.length >= 10, 
          progress: Math.min(receipts.length / 10 * 100, 100) 
        };
      
      case 'first_store':
        // For test user 102, we need to filter out the pre-existing sample data
        // Only count store transactions that are from today
        const today = new Date().toISOString().split('T')[0];
        const storeAdditions = transactions.filter(t => {
          // If testing, only count today's store additions to prevent premature triggering from sample data
          if (t.type === 'store_addition') {
            // If transaction has no date or userId is not 102, count it normally
            if (!t.createdAt || userId !== 102) return true;
            
            // For userId 102 (test user), only count transactions from today
            const txDate = new Date(t.createdAt).toISOString().split('T')[0];
            return txDate === today;
          }
          return false;
        }).length;
        
        return { 
          unlocked: storeAdditions >= 1, 
          progress: Math.min(storeAdditions / 1 * 100, 100) 
        };
      
      case 'monthly_record':
        // This would normally check if the current month has more activity than previous months
        // For now, we'll just check if they have at least 3 receipts this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const receiptsThisMonth = receipts.filter(r => {
          const date = new Date(r.purchaseDate);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;
        
        return { 
          unlocked: receiptsThisMonth >= 3, 
          progress: Math.min(receiptsThisMonth / 3 * 100, 100) 
        };
      
      case 'token_milestone':
        // Check if user has earned at least 100 tokens
        const tokenRewards = transactions.reduce((sum, t) => {
          if (t.type === 'receipt_verification' || t.type === 'store_addition') {
            return sum + t.amount;
          }
          return sum;
        }, 0);
        
        return { 
          unlocked: tokenRewards >= 100, 
          progress: Math.min(tokenRewards / 100 * 100, 100) 
        };
        
      default:
        return { unlocked: false, progress: 0 };
    }
  };
  
  // Convenience method to check if an achievement is unlocked
  const hasUnlockedAchievement = (type: AchievementType): boolean => {
    return getAchievementProgress(type).unlocked;
  };
  
  // Process achievement rewards 
  const claimAchievementReward = async (achievementType: AchievementType) => {
    // Allow test user (102) to claim achievements
    const currentUserId = userId || 102;
    
    try {
      // Call the API to process the achievement reward
      const endpoint = `/api/achievements/${currentUserId}/${achievementType}`;
      await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Invalidate user and transaction data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUserId}/transactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/wallet/${currentUserId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUserId}/receipts`] });
      
      console.log(`Claimed reward for achievement: ${achievementType}`);
    } catch (error) {
      console.error("Failed to claim achievement reward:", error);
    }
  };
  
  // Simple production-ready achievement checking
  const checkForNewAchievements = () => {
    if (!userId || !receipts.length) return;
    
    // Check for first receipt achievement
    if (receipts.length >= 1 && !displayedAchievements.has('first_receipt')) {
      setDisplayedAchievements(prev => new Set(prev).add('first_receipt'));
      setActiveNotification('first_receipt');
    }
    
    // Check for 5 receipts achievement
    if (receipts.length >= 5 && !displayedAchievements.has('five_receipts')) {
      setDisplayedAchievements(prev => new Set(prev).add('five_receipts'));
      setActiveNotification('five_receipts');
    }
    
    // Check for 10 receipts achievement
    if (receipts.length >= 10 && !displayedAchievements.has('ten_receipts')) {
      setDisplayedAchievements(prev => new Set(prev).add('ten_receipts'));
      setActiveNotification('ten_receipts');
    }
  };
  
  // Function to check and show achievement notification
  function showAchievement(achievementType: string) {
    // Check if achievement has already been shown this session
    if (displayedAchievements.has(achievementType)) return;

    // Mark as shown
    setDisplayedAchievements(prev => new Set(prev).add(achievementType));

    // Trigger the notification
    setActiveNotification(achievementType as AchievementType);
  }
  
  // Open share dialog for a specific achievement
  const shareAchievement = (type: AchievementType) => {
    setShareAchievementType(type);
    setShareDialogOpen(true);
  };
  
  // Safe event listener for achievement notifications
  useEffect(() => {
    const handleAchievementTrigger = (event: any) => {
      const { type } = event.detail;
      if (type && !displayedAchievements.has(type)) {
        setDisplayedAchievements(prev => new Set(prev).add(type));
        setActiveNotification(type);
      }
    };
    
    window.addEventListener('triggerAchievement', handleAchievementTrigger);
    
    return () => {
      window.removeEventListener('triggerAchievement', handleAchievementTrigger);
    };
  }, [displayedAchievements]);
  
  // We no longer need shownAchievementIds as we use displayedAchievements instead
  // Keep this line commented as documentation of the change
  // const [shownAchievementIds, setShownAchievementIds] = useState<number[]>([]);
  
  // Removed duplicate achievement notification logic to prevent double popups
  // Achievement notifications are now handled only through the main queue system
  
  // Track if we've already done the initial achievement check
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Track previous receipt count to detect actual changes
  const [previousReceiptCount, setPreviousReceiptCount] = useState(0);
  
  // Auto-check achievements when receipts count actually increases
  useEffect(() => {
    if (userId && receipts.length > previousReceiptCount) {
      // Achievement milestones
      const milestones = [1, 5, 10];
      
      // Check if we just hit a milestone
      if (milestones.includes(receipts.length)) {
        checkForNewAchievements();
      }
      
      // Update the previous count
      setPreviousReceiptCount(receipts.length);
    }
  }, [receipts.length, userId, previousReceiptCount]);
  
  // Achievement checking disabled to prevent infinite loops
  // All achievements are handled server-side automatically
  
  // Handle notification close
  const handleNotificationClose = () => {
    setActiveNotification(null);
  };
  
  // Handle share from notification
  const handleNotificationShare = () => {
    if (activeNotification) {
      shareAchievement(activeNotification);
      setActiveNotification(null);
    }
  };
  
  // Value to pass to context consumers
  const contextValue: AchievementContextType = {
    checkForNewAchievements,
    getAchievementProgress,
    hasUnlockedAchievement,
    shareAchievement,
  };
  
  // Generate stats for the current achievement being shared
  const generateStats = (type: AchievementType) => {
    switch(type) {
      case 'first_receipt':
        const co2Saved = 5; // Estimated CO2 savings for one sustainable transportation trip
        return [
          { label: 'CO2 Saved', value: `${co2Saved} kg` },
          { label: 'Water Saved', value: '700 L' }
        ];
      
      case 'five_receipts':
        const totalAmount = receipts.slice(0, 5).reduce((sum, r) => sum + r.amount, 0);
        return [
          { label: 'Total Spent', value: `$${totalAmount.toFixed(2)}` },
          { label: 'Items Recycled', value: 'Est. 15' }
        ];
      
      case 'ten_receipts':
        const totalWaterSaved = receipts.length * 700; // 700L per purchase is an estimate
        return [
          { label: 'Water Saved', value: `${Math.round(totalWaterSaved/1000)} kL` },
          { label: 'CO2 Prevented', value: `${receipts.length * 5} kg` }
        ];
      
      case 'first_store':
        return [
          { label: 'Community Impact', value: 'High' },
          { label: 'Visibility Added', value: '+25%' }
        ];
      
      case 'monthly_record':
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const receiptsThisMonth = receipts.filter(r => {
          const date = new Date(r.purchaseDate);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;
        
        return [
          { label: 'Monthly Visits', value: `${receiptsThisMonth}` },
          { label: 'Previous Best', value: `${Math.max(0, receiptsThisMonth - 1)}` }
        ];
      
      case 'token_milestone':
        const tokenRewards = transactions.reduce((sum, t) => {
          if (t.type === 'receipt_verification' || t.type === 'store_addition') {
            return sum + t.amount;
          }
          return sum;
        }, 0);
        
        return [
          { label: 'Tokens Earned', value: `${tokenRewards}` },
          { label: 'Total Visits', value: `${receipts.length}` }
        ];
        
      default:
        return [];
    }
  };
  
  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
      
      {/* Achievement notification */}
      {activeNotification && (
        <AchievementNotification
          type={activeNotification}
          onClose={handleNotificationClose}
          onShare={handleNotificationShare}
        />
      )}
      
      {/* Share dialog */}
      {shareAchievementType && (
        <ShareAchievement
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          achievement={shareAchievementType ? 
            createAchievement(
              shareAchievementType,
              generateStats(shareAchievementType)
            ) : null
          }
        />
      )}
    </AchievementContext.Provider>
  );
}

// Create the hook for consumers
function useAchievements() {
  return useContext(AchievementContext);
}

export { AchievementProvider, useAchievements };