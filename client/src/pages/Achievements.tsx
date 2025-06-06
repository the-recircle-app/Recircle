import React from 'react';
import { useAchievements } from '../context/AchievementContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Trophy, Star, Zap } from 'lucide-react';

const Achievements: React.FC = () => {
  const { achievements, currentStreak } = useAchievements();

  const completedCount = achievements.filter(a => a.completed).length;
  const totalPoints = achievements
    .filter(a => a.completed)
    .reduce((sum, a) => sum + a.rewardAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Achievements</h1>
          <p className="text-gray-300 text-lg">Track your sustainable transportation milestones</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
              <Trophy className="h-4 w-4 ml-auto text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{completedCount}</div>
              <p className="text-xs text-gray-400 mt-1">of {achievements.length} achievements</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Points Earned</CardTitle>
              <Star className="h-4 w-4 ml-auto text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalPoints}</div>
              <p className="text-xs text-gray-400 mt-1">B3TR from achievements</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Current Streak</CardTitle>
              <Zap className="h-4 w-4 ml-auto text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentStreak}</div>
              <p className="text-xs text-gray-400 mt-1">consecutive days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`bg-gray-800/50 border-gray-700 ${achievement.completed ? 'ring-2 ring-green-500/30' : ''}`}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <CardTitle className={`${achievement.completed ? 'text-green-400' : 'text-white'}`}>
                      {achievement.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {achievement.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${achievement.completed ? 'text-green-400' : 'text-gray-400'}`}>
                      {achievement.rewardAmount} B3TR
                    </div>
                    {achievement.completed && (
                      <div className="text-xs text-green-400">Completed!</div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">
                      {achievement.progress} / {achievement.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        achievement.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;