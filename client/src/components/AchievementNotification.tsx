import React, { useState, useEffect } from 'react';
import { Trophy, X, Share2, Sparkles, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AchievementType, createAchievement } from './ShareAchievement';
import { cn } from '@/lib/utils';
import B3trLogo from './B3trLogo';

interface AchievementNotificationProps {
  type: AchievementType;
  onClose: () => void;
  onShare: () => void;
  className?: string;
  autoDismiss?: boolean;
  dismissTime?: number;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  type,
  onClose,
  onShare,
  className,
  autoDismiss = true,
  dismissTime = 6000, // 6 seconds
}) => {
  // Get achievement details
  const achievement = createAchievement(type);
  
  // State to track if close has been requested
  const [isClosing, setIsClosing] = useState(false);
  
  // Handle close action
  const handleClose = () => {
    // Flag that we're in the process of closing
    setIsClosing(true);
    // Notify parent
    onClose();
  };
  
  // Auto-dismiss after specified time
  useEffect(() => {
    if (autoDismiss && !isClosing) {
      const timer = setTimeout(() => {
        handleClose();
      }, dismissTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissTime, isClosing]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999] px-4 py-6">
      <div className={cn("w-full max-w-sm mx-auto", className)}>
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
          {/* Progress bar for auto-dismiss */}
          {autoDismiss && (
            <div className="h-1 bg-gray-800 w-full relative">
              <div 
                className="h-full bg-blue-600" 
                style={{ 
                  width: "100%",
                  animation: `shrink ${dismissTime}ms linear forwards`
                }}
              />
            </div>
          )}
          
          <div className="p-5">
            <div className="flex items-start">
              {/* Achievement icon */}
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              
              {/* Achievement content */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1">
                      Achievement Unlocked
                    </div>
                    <h3 className="text-lg font-semibold text-white">{achievement.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                  </div>
                  
                  {/* Close button */}
                  <button
                    className="ml-2 text-gray-500 hover:text-gray-300 focus:outline-none"
                    onClick={handleClose}
                    aria-label="Close notification"
                    disabled={isClosing}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Reward display section */}
                <div className="mt-3 bg-gray-800 rounded-lg p-3">
                  {/* Token reward breakdown */}
                  <div className="flex items-center mb-1">
                    <Coins className="w-4 h-4 text-blue-400 mr-1" />
                    <span className="text-xs text-gray-300 font-medium">Token Reward Breakdown</span>
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    {/* Base reward - always shown */}
                    <div className="flex justify-between items-center text-sm reward-item">
                      <span className="text-gray-400">Base reward:</span>
                      <div className="flex items-center">
                        <span className="font-medium text-white mr-1">8</span>
                        <B3trLogo className="w-4 h-4" color="#38BDF8" />
                      </div>
                    </div>
                    
                    {/* No streak bonus for first receipt (streak multiplier doesn't apply to first receipt) */}
                    
                    {/* Achievement bonus - only for first_receipt */}
                    {type === 'first_receipt' && (
                      <div className="flex justify-between items-center text-sm reward-item">
                        <span className="text-gray-400">Achievement bonus:</span>
                        <div className="flex items-center">
                          <span className="font-medium text-yellow-400 mr-1">+10</span>
                          <B3trLogo className="w-4 h-4" color="#38BDF8" />
                        </div>
                      </div>
                    )}
                    
                    {/* Achievement bonus - only for first_store */}
                    {type === 'first_store' && (
                      <div className="flex justify-between items-center text-sm reward-item">
                        <span className="text-gray-400">Achievement bonus:</span>
                        <div className="flex items-center">
                          <span className="font-medium text-yellow-400 mr-1">+3</span>
                          <B3trLogo className="w-4 h-4" color="#38BDF8" />
                        </div>
                      </div>
                    )}
                    
                    {/* Divider */}
                    <div className="border-t border-gray-700 my-1"></div>
                    
                    {/* Total */}
                    <div className="flex justify-between items-center text-sm reward-item">
                      <span className="text-gray-300 font-medium">Total:</span>
                      <div className="flex items-center">
                        <span className="font-bold text-white mr-1 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                          {type === 'first_receipt' ? '18' : type === 'first_store' ? '8' : '8'}
                        </span>
                        <B3trLogo className="w-4 h-4" color="#38BDF8" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Sustainability rewards section */}
                  <div className="mt-3 pt-2 border-t border-gray-700">
                    <div className="flex items-center mb-1">
                      <Sparkles className="w-4 h-4 text-green-400 mr-1" />
                      <span className="text-xs sustainability-gradient font-medium">Sustainability Impact</span>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-2">
                      For each token you earn, ReCircle distributes additional sustainability rewards:
                    </div>
                    
                    <div className="space-y-1">
                      {/* App sustainability fund - Updated to 30% model */}
                      <div className="flex justify-between items-center text-xs reward-item">
                        <span className="text-gray-400">App Sustainability Fund (30%):</span>
                        <div className="flex items-center">
                          <span className="font-medium sustainability-gradient mr-1">
                            {type === 'first_receipt' ? '5.4' : type === 'first_store' ? '2.4' : '2.4'}
                          </span>
                          <B3trLogo className="w-4 h-4" color="#38BDF8" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs space-y-1">
                      <div className="flex items-center">
                        <Sparkles className="w-3 h-3 text-green-400 mr-1 sparkle-icon" />
                        <span className="sustainability-gradient">Your sustainable choices fund real-world impact via VeBetterDAO!</span>
                      </div>
                      <div className="text-gray-400 pl-4">
                        <p>• 30% to App Fund for sustainable transportation platform development</p>
                        <p>• 30% total sustainability impact via blockchain rewards</p>
                        <p>• Funding clean mobility initiatives and reward infrastructure</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sparkles effect for achievement reward */}
                  {(type === 'first_receipt' || type === 'first_store') && (
                    <div className="flex items-center mt-2 text-xs reward-item">
                      <Sparkles className="w-3 h-3 text-yellow-400 mr-1 sparkle-icon" />
                      <span className="text-yellow-400">Achievement rewards are added automatically!</span>
                    </div>
                  )}
                </div>
                
                {/* Share button */}
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                    onClick={() => {
                      setIsClosing(true);
                      onShare();
                    }}
                    disabled={isClosing}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;