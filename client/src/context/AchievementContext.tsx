import React, { createContext, useContext, useState, useEffect } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
  rewardAmount: number;
}

interface AchievementContextType {
  achievements: Achievement[];
  currentStreak: number;
  totalRewards: number;
  checkAchievements: (action: string, data?: any) => void;
  refreshAchievements: () => Promise<void>;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};

const defaultAchievements: Achievement[] = [
  {
    id: 'first_ride',
    title: 'First Sustainable Ride',
    description: 'Complete your first sustainable transportation receipt scan',
    icon: '🚗',
    completed: false,
    progress: 0,
    maxProgress: 1,
    rewardAmount: 5,
  },
  {
    id: 'week_streak',
    title: 'Weekly Warrior',
    description: 'Scan receipts for 7 consecutive days',
    icon: '🔥',
    completed: false,
    progress: 0,
    maxProgress: 7,
    rewardAmount: 15,
  },
  {
    id: 'electric_enthusiast',
    title: 'Electric Enthusiast',
    description: 'Use electric vehicles 10 times',
    icon: '⚡',
    completed: false,
    progress: 0,
    maxProgress: 10,
    rewardAmount: 25,
  },
  {
    id: 'transit_champion',
    title: 'Transit Champion',
    description: 'Use public transit 20 times',
    icon: '🚇',
    completed: false,
    progress: 0,
    maxProgress: 20,
    rewardAmount: 30,
  },
];

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);

  const checkAchievements = (action: string, data?: any) => {
    setAchievements(prev => {
      const updated = [...prev];
      
      switch (action) {
        case 'receipt_scanned':
          // Update first ride achievement
          const firstRide = updated.find(a => a.id === 'first_ride');
          if (firstRide && !firstRide.completed) {
            firstRide.progress = 1;
            firstRide.completed = true;
          }
          
          // Update specific transport type achievements
          if (data?.transportationType === 'ev_rental') {
            const electric = updated.find(a => a.id === 'electric_enthusiast');
            if (electric && !electric.completed) {
              electric.progress = Math.min(electric.progress + 1, electric.maxProgress);
              if (electric.progress >= electric.maxProgress) {
                electric.completed = true;
              }
            }
          }
          
          if (data?.transportationType === 'public_transit') {
            const transit = updated.find(a => a.id === 'transit_champion');
            if (transit && !transit.completed) {
              transit.progress = Math.min(transit.progress + 1, transit.maxProgress);
              if (transit.progress >= transit.maxProgress) {
                transit.completed = true;
              }
            }
          }
          break;
          
        case 'streak_updated':
          setCurrentStreak(data?.streak || 0);
          const weekStreak = updated.find(a => a.id === 'week_streak');
          if (weekStreak && !weekStreak.completed) {
            weekStreak.progress = Math.min(data?.streak || 0, weekStreak.maxProgress);
            if (weekStreak.progress >= weekStreak.maxProgress) {
              weekStreak.completed = true;
            }
          }
          break;
      }
      
      return updated;
    });
  };

  const refreshAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      
      if (data.success) {
        setAchievements(data.achievements || defaultAchievements);
        setCurrentStreak(data.currentStreak || 0);
        setTotalRewards(data.totalRewards || 0);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  useEffect(() => {
    refreshAchievements();
  }, []);

  const value = {
    achievements,
    currentStreak,
    totalRewards,
    checkAchievements,
    refreshAchievements,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};