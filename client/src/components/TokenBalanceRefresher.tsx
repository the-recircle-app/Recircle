import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowUpCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TokenBalanceRefresherProps {
  userId: number;
  currentBalance: number;
}

/**
 * A component that automatically monitors for token balance changes
 * and displays notifications when updates are detected
 */
const TokenBalanceRefresher: React.FC<TokenBalanceRefresherProps> = ({ userId, currentBalance }) => {
  const [serverBalance, setServerBalance] = useState<number | null>(null);
  const [isInitialCheck, setIsInitialCheck] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [updateDetected, setUpdateDetected] = useState(false);
  const { toast } = useToast();

  // Check the server for balance updates periodically
  useEffect(() => {
    // 🔥 CRITICAL FIX: Don't poll if userId is missing or invalid
    if (!userId) {
      console.log('[TOKEN-REFRESHER] Skipping balance check - no userId');
      return;
    }
    
    // Skip initial check immediately on mount to avoid
    // unnecessary notifications when the component first loads
    if (isInitialCheck) {
      setIsInitialCheck(false);
      return;
    }

    // 🔥 Capture userId at effect creation to detect changes
    const capturedUserId = userId;

    // Function to check server balance
    const checkServerBalance = async () => {
      // 🔥 CRITICAL: Bail out if userId changed since this interval was created
      if (capturedUserId !== userId) {
        console.log(`[TOKEN-REFRESHER] UserId changed from ${capturedUserId} to ${userId} - skipping stale check`);
        return;
      }
      
      try {
        // Fetch the latest user data from the server
        const response = await fetch(`/api/users/${capturedUserId}`);
        if (!response.ok) return;
        
        const userData = await response.json();
        const newBalance = userData.tokenBalance || 0;
        setServerBalance(newBalance);
        setLastChecked(new Date());
        
        // If this is not the initial check and the balance changed
        if (newBalance !== currentBalance) {
          // Show auto-update message
          setUpdateDetected(true);
          
          // Show a toast notification for balance change
          if (newBalance > currentBalance) {
            toast({
              title: '🎉 Balance Increased!',
              description: `Your token balance increased from ${currentBalance} to ${newBalance} B3TR`,
              variant: 'default',
            });
            
            // Auto-refresh the page to show new balance
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } else {
          setUpdateDetected(false);
        }
      } catch (error) {
        console.error('Error checking token balance:', error);
      }
    };

    // Initial check
    checkServerBalance();
    
    // Setup periodic checking
    const intervalId = setInterval(checkServerBalance, 5000);
    
    // Cleanup interval on unmount OR when userId changes
    return () => {
      console.log(`[TOKEN-REFRESHER] Cleaning up interval for userId ${capturedUserId}`);
      clearInterval(intervalId);
    };
  }, [userId, currentBalance, toast, isInitialCheck]);

  // Show balance info only when an update is detected
  if (!updateDetected || serverBalance === null || serverBalance <= currentBalance) {
    return null;
  }

  return (
    <Card className="border-green-500 mb-4 overflow-hidden shadow-md">
      <CardContent className="p-0">
        <Alert className="bg-green-50 border-green-200 rounded-none">
          <ArrowUpCircle className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-sm text-green-800">
            <div className="flex items-center">
              <span className="flex-1">
                <span className="font-medium">Balance update detected!</span> The page will refresh to show your updated balance.
              </span>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default TokenBalanceRefresher;