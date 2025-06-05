import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Facebook, 
  Instagram, 
  Copy, 
  Check, 
  Share2, 
  Award, 
  Leaf, 
  TreePine, 
  Recycle 
} from 'lucide-react';
import B3trLogo from './B3trLogo';
import { toast } from '@/hooks/use-toast';

// Custom X (formerly Twitter) icon
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="h-5 w-5 text-white">
    <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1851 10.5689L12.8818 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
  </svg>
);

// Define achievement types
export type AchievementType = 
  | 'first_receipt' 
  | 'five_receipts' 
  | 'ten_receipts' 
  | 'first_store' 
  | 'monthly_record'
  | 'token_milestone';

interface Achievement {
  type: AchievementType;
  title: string;
  description: string;
  icon: React.ReactNode;
  stats?: {
    label: string;
    value: string;
  }[];
  impactMessage: string;
}

interface ShareAchievementProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: Achievement | null;
  userName?: string;
}

const ShareAchievement: React.FC<ShareAchievementProps> = ({
  isOpen,
  onClose,
  achievement,
  userName = "Eco Champion"
}) => {
  const [copied, setCopied] = useState(false);
  
  if (!achievement) return null;
  
  const shareText = `I just earned the "${achievement.title}" achievement on B3TR! ${achievement.impactMessage} #B3TR #Sustainability #ThriftShopping`;
  
  // Generate a sharing URL
  const shareUrl = encodeURIComponent(`https://b3tr.app/share?ach=${achievement.type}`);
  
  // Social media sharing links
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodeURIComponent(shareText)}`;
  
  // Copy to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "You can now paste the text to share your achievement.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Open a sharing link in a new window
  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  // Custom style for social buttons
  const socialButtonClass = "flex items-center justify-center bg-gray-800 hover:bg-gray-700 p-3 rounded-full h-12 w-12";
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={true}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Award className="mr-2 h-5 w-5 text-yellow-500" />
            <span>Achievement Details</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Your sustainable shopping makes a real difference!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600/20 mb-3">
            {achievement.icon}
          </div>
          
          <h3 className="text-xl font-bold text-center">{achievement.title}</h3>
          <p className="text-gray-300 text-sm text-center mt-1 mb-3">{achievement.description}</p>
          
          {achievement.stats && achievement.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4 w-full my-3">
              {achievement.stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="text-lg font-bold text-blue-400">{stat.value}</span>
                  <span className="text-xs text-gray-400">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-0.5 rounded-lg w-full mt-2">
            <div className="bg-gray-900 rounded-[5px] p-3">
              <div className="flex items-start">
                <B3trLogo className="w-6 h-6 mr-2 shrink-0 mt-1" color="#38BDF8" />
                <p className="text-sm">{shareText}</p>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="bg-gray-800" />
        
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-400 text-center">Share your achievement with one tap</p>
          
          <div className="flex justify-center space-x-4">
            <button 
              className={socialButtonClass}
              onClick={() => openShareWindow(twitterShareUrl)}
              aria-label="Share on X (Twitter)"
            >
              <XIcon />
            </button>
            
            <button 
              className={socialButtonClass}
              onClick={() => openShareWindow(facebookShareUrl)}
              aria-label="Share on Facebook"
            >
              <Facebook className="h-5 w-5 text-[#4267B2]" />
            </button>
            
            <button 
              className={socialButtonClass}
              onClick={() => {
                // Instagram doesn't support direct sharing via URL, so show a copy message
                toast({
                  title: "Instagram Sharing",
                  description: "Copy the text and share it on Instagram manually",
                });
                copyToClipboard();
              }}
              aria-label="Share on Instagram"
            >
              <Instagram className="h-5 w-5 text-[#C13584]" />
            </button>
            
            <button 
              className={socialButtonClass}
              onClick={copyToClipboard}
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <p className="text-xs text-gray-500 hidden sm:block">
            Spread the word about sustainable shopping
          </p>
          <Button 
            variant="default"
            onClick={onClose}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Factory function to create pre-defined achievements
export const createAchievement = (
  type: AchievementType,
  stats?: { label: string; value: string }[]
): Achievement => {
  switch (type) {
    case 'first_receipt':
      return {
        type,
        title: "First Sustainable Trip",
        description: "You submitted your first transportation receipt!",
        icon: <Leaf className="h-8 w-8 text-green-500" />,
        stats,
        impactMessage: "By choosing sustainable transportation, I've helped reduce carbon emissions and air pollution."
      };
    
    case 'five_receipts':
      return {
        type,
        title: "Transportation Pioneer",
        description: "You've submitted 5 sustainable transportation receipts!",
        icon: <Recycle className="h-8 w-8 text-green-500" />,
        stats,
        impactMessage: "I've prevented approximately 25kg of CO2 emissions through sustainable transportation choices."
      };
    
    case 'ten_receipts':
      return {
        type,
        title: "Mobility Champion",
        description: "You've submitted 10 sustainable transportation receipts!",
        icon: <TreePine className="h-8 w-8 text-green-500" />,
        stats,
        impactMessage: "My sustainable transportation choices have prevented 50kg of CO2 emissions - equivalent to planting 2 trees."
      };
    
    case 'first_store':
      return {
        type,
        title: "Transit Hub Explorer",
        description: "You've added your first transportation hub to the map!",
        icon: <Share2 className="h-8 w-8 text-blue-500" />,
        stats,
        impactMessage: "I'm helping build a network of sustainable transportation options in my community."
      };
    
    case 'monthly_record':
      return {
        type,
        title: "Monthly Mobility Leader",
        description: "You've set a new personal record for sustainable trips this month!",
        icon: <Award className="h-8 w-8 text-yellow-500" />,
        stats,
        impactMessage: "This month, my sustainable transportation choices prevented approximately 60kg of CO2 emissions."
      };
    
    case 'token_milestone':
      return {
        type,
        title: "Green Transport Rewards",
        description: "You've earned 100 B3TR tokens through sustainable transportation!",
        icon: <B3trLogo className="w-8 h-8" color="#38BDF8" />,
        stats,
        impactMessage: "My sustainable transportation choices have earned me rewards while reducing carbon emissions."
      };
  }
};

export default ShareAchievement;