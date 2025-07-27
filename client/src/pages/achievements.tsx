import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Leaf, Award, Trophy, Share2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useWallet } from '@/context/WalletContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import BottomNavigation from '@/components/BottomNavigation';
import Header from '@/components/Header';
import AchievementCard from '@/components/AchievementCard';
import ShareAchievement, { createAchievement } from '@/components/ShareAchievement';
import { Receipt, Transaction } from '@/types';

// Mock function to get achievement progress until we have backend support
const getAchievementProgress = (
  type: string, 
  receipts: Receipt[], 
  transactions: Transaction[]
): { unlocked: boolean; progress: number } => {
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
      const storeAdditions = transactions.filter(t => t.type === 'store_addition').length;
      return { 
        unlocked: storeAdditions >= 1, 
        progress: Math.min(storeAdditions / 1 * 100, 100) 
      };
    
    case 'rideshare_rider':
      // Find any receipts from rideshare services
      const rideshareReceipts = receipts.filter((r: any) => 
        r.category === 'ride_share' || 
        (r.storeName && r.storeName.toLowerCase().includes('uber')) ||
        (r.storeName && r.storeName.toLowerCase().includes('lyft')) ||
        (r.storeName && r.storeName.toLowerCase().includes('waymo'))
      );
      return { 
        unlocked: rideshareReceipts.length >= 1, 
        progress: Math.min(rideshareReceipts.length / 1 * 100, 100) 
      };
    
    case 'ev_champion':
      // Find any receipts from electric vehicle rentals
      const evReceipts = receipts.filter((r: any) => 
        r.category === 'electric_vehicle_rental' ||
        (r.storeName && (r.storeName.toLowerCase().includes('tesla') ||
                        r.storeName.toLowerCase().includes('hertz') ||
                        r.storeName.toLowerCase().includes('enterprise')))
      );
      return { 
        unlocked: evReceipts.length >= 1, 
        progress: Math.min(evReceipts.length / 1 * 100, 100) 
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

// Helper function to generate stats based on achievement type
const generateStats = (
  type: string, 
  receipts: Receipt[], 
  transactions: Transaction[]
) => {
  switch(type) {
    case 'first_receipt':
      const co2Saved = 3.2; // Estimated CO2 savings for one transportation choice
      return [
        { label: 'CO2 Saved', value: `${co2Saved} kg` },
        { label: 'Miles Shared', value: '12.3' }
      ];
    
    case 'five_receipts':
      const totalAmount = (receipts as any[]).slice(0, 5).reduce((sum, r) => sum + r.amount, 0);
      return [
        { label: 'Total Spent', value: `$${totalAmount.toFixed(2)}` },
        { label: 'Trips Shared', value: '5' }
      ];
    
    case 'ten_receipts':
      const totalCO2Saved = (receipts as any[]).length * 3.2; // 3.2kg per trip is an estimate
      return [
        { label: 'CO2 Saved', value: `${Math.round(totalCO2Saved)} kg` },
        { label: 'Emissions Cut', value: `${(receipts as any[]).length * 15}%` }
      ];
    
    case 'first_store':
      return [
        { label: 'Community Impact', value: 'High' },
        { label: 'Visibility Added', value: '+25%' }
      ];
      
    case 'rideshare_rider':
      return [
        { label: 'CO2 Saved', value: '6.4 kg' },
        { label: 'Cars Off Road', value: '2' }
      ];
      
    case 'ev_champion':
      return [
        { label: 'Zero Emissions', value: '100%' },
        { label: 'Clean Miles', value: '45' }
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

const AchievementsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  
  const { userId, isConnected } = useWallet();
  
  // Fetch user receipts
  const { data: receipts = [] } = useQuery({
    queryKey: [`/api/users/${userId}/receipts`],
    enabled: !!userId,
  });
  
  // Fetch user transactions
  const { data: transactions = [] } = useQuery({
    queryKey: [`/api/users/${userId}/transactions`],
    enabled: !!userId,
  });
  
  // Fetch user data to get streak count and other details
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });
  
  // Define achievement categories
  const categories = [
    { id: 'all', label: 'All', icon: <Trophy className="h-4 w-4" /> },
    { id: 'transportation', label: 'Transport', icon: <Leaf className="h-4 w-4" /> },
    { id: 'community', label: 'Community', icon: <Share2 className="h-4 w-4" /> },
    { id: 'milestones', label: 'Milestones', icon: <Award className="h-4 w-4" /> },
  ];
  
  // Define all available achievements
  const allAchievements = [
    { type: 'first_receipt', category: 'transportation' },
    { type: 'five_receipts', category: 'transportation' },
    { type: 'ten_receipts', category: 'transportation' },
    { type: 'rideshare_rider', category: 'transportation' },
    { type: 'ev_champion', category: 'transportation' },
    { type: 'first_store', category: 'community' },
    { type: 'monthly_record', category: 'milestones' },
    { type: 'token_milestone', category: 'milestones' },
  ];
  
  // Handle sharing a specific achievement
  const handleShareAchievement = (achievementType: string) => {
    setSelectedAchievement(achievementType);
    setShareDialogOpen(true);
  };
  
  // Filter achievements by category
  const filteredAchievements = allAchievements.filter(achievement => 
    activeTab === 'all' || achievement.category === activeTab
  );
  
  // Count unlocked achievements
  const unlockedCount = allAchievements.filter(achievement => {
    const { unlocked } = getAchievementProgress(
      achievement.type, 
      receipts, 
      transactions
    );
    return unlocked;
  }).length;
  
  return (
    <div className="min-h-screen bg-gray-950 text-white pb-16">
      <Header 
        className="border-b border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950"
        streak={userData?.currentStreak}
        gems={userData?.tokenBalance}
      />
      
      <main className="container max-w-md mx-auto px-4 py-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Achievements</h1>
          <div className="text-sm text-gray-400">
            <span className="text-blue-400 font-semibold">{unlockedCount}</span>
            <span className="mx-1">/</span>
            <span className="text-gray-400">{allAchievements.length}</span>
          </div>
        </div>
        
        {/* Summary card */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="mr-4 bg-blue-600/20 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Transport Impact</h2>
                <p className="text-sm text-gray-400">
                  Your sustainable transportation choices are reducing emissions!
                </p>
              </div>
            </div>
            
            <Separator className="my-4 bg-gray-800" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-400">
                  {Math.round(receipts.length * 5)}kg
                </div>
                <div className="text-xs text-gray-400">CO2 Emissions Prevented</div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-400">
                  {receipts.length * 2}
                </div>
                <div className="text-xs text-gray-400">Trees Equivalent Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievement categories tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid grid-cols-4 bg-gray-900 border border-gray-800">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center justify-center text-xs py-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600"
              >
                {category.icon}
                <span className="ml-1">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Achievement grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => {
            const { unlocked, progress } = getAchievementProgress(
              achievement.type, 
              receipts, 
              transactions
            );
            
            const stats = generateStats(achievement.type, receipts, transactions);
            
            return (
              <AchievementCard
                key={achievement.type}
                type={achievement.type as any}
                unlocked={unlocked}
                progress={progress}
                stats={stats}
              />
            );
          })}
        </div>
        
        {/* If there are no achievements in the selected category */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center bg-gray-800/30 rounded-full p-3 mb-4">
              <Award className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300">No achievements yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Keep shopping sustainably to unlock achievements in this category
            </p>
          </div>
        )}
      </main>
      
      {/* Share dialog */}
      {selectedAchievement && (
        <ShareAchievement
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          achievement={createAchievement(
            selectedAchievement as any,
            generateStats(selectedAchievement, receipts, transactions)
          )}
        />
      )}
      
      <BottomNavigation isConnected={isConnected} />
    </div>
  );
};

export default AchievementsPage;