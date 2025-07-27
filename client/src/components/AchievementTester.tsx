import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AchievementNotification from './AchievementNotification';
import { AchievementType } from './ShareAchievement';

/**
 * AchievementTester - A helper component for testing achievement notifications
 * 
 * This component provides buttons to directly trigger achievement notifications
 * for testing and development purposes.
 */
const AchievementTester: React.FC = () => {
  const [activeAchievement, setActiveAchievement] = useState<AchievementType | null>(null);
  
  // Achievement types we can test
  const achievements: AchievementType[] = [
    'first_receipt',
    'five_receipts',
    'ten_receipts',
    'first_store',
    'monthly_record',
    'token_milestone'
  ];
  
  const handleTriggerAchievement = (type: AchievementType) => {
    setActiveAchievement(type);
  };
  
  const handleCloseNotification = () => {
    setActiveAchievement(null);
  };
  
  const handleShare = () => {
    console.log(`Sharing achievement: ${activeAchievement}`);
    setActiveAchievement(null);
  };
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
      <h3 className="text-white text-sm font-medium mb-2">Achievement Tester</h3>
      <div className="flex flex-col space-y-2">
        {achievements.map(achievement => (
          <Button 
            key={achievement}
            size="sm"
            variant="outline"
            onClick={() => handleTriggerAchievement(achievement)}
          >
            Test {achievement.replace('_', ' ')}
          </Button>
        ))}
      </div>
      
      {/* Render the achievement notification if one is active */}
      {activeAchievement && (
        <AchievementNotification
          type={activeAchievement}
          onClose={handleCloseNotification}
          onShare={handleShare}
          autoDismiss={false}
        />
      )}
    </div>
  );
};

export default AchievementTester;