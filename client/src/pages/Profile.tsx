import React from 'react';
import { useWallet } from '../context/WalletContext';
import { useAchievements } from '../context/AchievementContext';
import { User, Wallet, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Profile: React.FC = () => {
  const { wallet } = useWallet();
  const { currentStreak, totalRewards } = useAchievements();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Profile Dashboard</h1>
          <p className="text-gray-300 text-lg">Track your sustainable transportation journey</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Wallet Address</CardTitle>
              <Wallet className="h-4 w-4 ml-auto text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Not connected'}
              </div>
              <p className="text-xs text-gray-400 mt-1">VeChain Network</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">B3TR Balance</CardTitle>
              <TrendingUp className="h-4 w-4 ml-auto text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{wallet.balance.toFixed(2)}</div>
              <p className="text-xs text-gray-400 mt-1">Available tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Current Streak</CardTitle>
              <Award className="h-4 w-4 ml-auto text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentStreak}</div>
              <p className="text-xs text-gray-400 mt-1">Consecutive days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">Your latest transportation receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Electric vehicle rental</p>
                    <p className="text-gray-400 text-xs">+8 B3TR • Tesla Model 3</p>
                  </div>
                  <span className="text-gray-400 text-xs">2h ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Rideshare trip</p>
                    <p className="text-gray-400 text-xs">+3 B3TR • Uber ride</p>
                  </div>
                  <span className="text-gray-400 text-xs">1d ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Public transit</p>
                    <p className="text-gray-400 text-xs">+5 B3TR • Metro card</p>
                  </div>
                  <span className="text-gray-400 text-xs">2d ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Environmental Impact</CardTitle>
              <CardDescription className="text-gray-400">Your contribution to sustainability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-300">CO2 Saved</p>
                  <p className="text-2xl font-bold text-green-400">12.4 kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Miles via Sustainable Transport</p>
                  <p className="text-2xl font-bold text-blue-400">245</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Personal Vehicle Trips Avoided</p>
                  <p className="text-2xl font-bold text-purple-400">18</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;