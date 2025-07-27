import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Info } from 'lucide-react';
import ShareAchievement, { AchievementType, createAchievement } from './ShareAchievement';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  type: AchievementType;
  unlocked: boolean;
  progress?: number;
  stats?: {
    label: string;
    value: string;
  }[];
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  type, 
  unlocked, 
  progress = 0,
  stats,
  className
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Create the achievement object using our factory function
  const achievement = createAchievement(type, stats);
  
  // Handle share button click
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from triggering
    if (unlocked) {
      setShareDialogOpen(true);
    }
  };
  
  // Handle card click to show details
  const handleCardClick = () => {
    setDetailsDialogOpen(true);
  };
  
  return (
    <>
      <Card 
        className={cn(
          "relative overflow-hidden border border-gray-800 transition-all cursor-pointer",
          unlocked ? "bg-gray-900 hover:border-blue-500" : "bg-gray-950 opacity-70 hover:opacity-90",
          className
        )}
        onClick={handleCardClick}
      >
        {/* Progress indicator */}
        {!unlocked && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            <div 
              className="h-full bg-blue-600" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
        
        {/* Achievement locked overlay */}
        {!unlocked && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-gray-600 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4 text-gray-500"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </div>
        )}
        
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center mb-3",
              unlocked ? "bg-blue-600/20" : "bg-gray-800"
            )}>
              {React.cloneElement(achievement.icon as React.ReactElement, {
                className: cn(
                  "h-8 w-8",
                  unlocked ? (achievement.icon as React.ReactElement).props.className : "text-gray-500"
                )
              })}
            </div>
            
            <h3 className={cn(
              "text-lg font-semibold mb-1",
              unlocked ? "text-white" : "text-gray-400"
            )}>
              {achievement.title}
            </h3>
            
            <p className={cn(
              "text-sm mb-3",
              unlocked ? "text-gray-300" : "text-gray-400"
            )}>
              {achievement.description}
            </p>
            
            {unlocked && (
              <Button 
                variant="outline"
                size="sm"
                className="mt-2 bg-blue-800 border-blue-700 hover:bg-blue-700 text-white"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}
            
            {!unlocked && progress > 0 && (
              <p className="text-xs text-gray-400 mt-2">{progress}% Complete</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Share dialog */}
      <ShareAchievement 
        isOpen={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        achievement={unlocked ? achievement : null}
      />
      
      {/* Details dialog */}
      <ShareAchievement 
        isOpen={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        achievement={achievement}
      />
    </>
  );
};

export default AchievementCard;