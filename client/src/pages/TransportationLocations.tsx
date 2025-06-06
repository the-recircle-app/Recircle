import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Car, Zap, Train, TrendingUp, Calendar, Award } from 'lucide-react';

const Dashboard: React.FC = () => {
  const transportationStats = [
    { type: 'Rideshare', trips: 24, tokens: 72, icon: <Car className="h-5 w-5 text-blue-400" /> },
    { type: 'Electric Vehicle', trips: 8, tokens: 64, icon: <Zap className="h-5 w-5 text-green-400" /> },
    { type: 'Public Transit', trips: 45, tokens: 135, icon: <Train className="h-5 w-5 text-purple-400" /> },
  ];

  const recentActivity = [
    { date: '2025-01-05', type: 'Tesla Model 3 Rental', tokens: 8, verified: true },
    { date: '2025-01-04', type: 'Uber Rideshare', tokens: 3, verified: true },
    { date: '2025-01-03', type: 'Metro Transit Card', tokens: 5, verified: true },
    { date: '2025-01-02', type: 'Lyft Pool Ride', tokens: 2, verified: true },
  ];

  const totalTokens = transportationStats.reduce((sum, stat) => sum + stat.tokens, 0);
  const totalTrips = transportationStats.reduce((sum, stat) => sum + stat.trips, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Transportation Dashboard</h1>
          <p className="text-gray-300 text-lg">Track your sustainable transportation rewards and impact</p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Tokens</CardTitle>
              <TrendingUp className="h-4 w-4 ml-auto text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalTokens} B3TR</div>
              <p className="text-xs text-gray-400 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Trips</CardTitle>
              <Calendar className="h-4 w-4 ml-auto text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalTrips}</div>
              <p className="text-xs text-gray-400 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">CO₂ Saved</CardTitle>
              <Award className="h-4 w-4 ml-auto text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">2.4 kg</div>
              <p className="text-xs text-gray-400 mt-1">Carbon footprint reduction</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Streak</CardTitle>
              <Award className="h-4 w-4 ml-auto text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">7 days</div>
              <p className="text-xs text-gray-400 mt-1">Current active streak</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Transportation Breakdown */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Transportation Breakdown</CardTitle>
              <CardDescription className="text-gray-400">
                Your sustainable transportation usage by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transportationStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-white font-medium">{stat.type}</p>
                        <p className="text-gray-400 text-sm">{stat.trips} trips</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">{stat.tokens} B3TR</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">
                Your latest transportation receipts and rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{activity.type}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-gray-400 text-xs">{activity.date}</span>
                        {activity.verified && (
                          <span className="text-green-400 text-xs">✓ Verified</span>
                        )}
                      </div>
                    </div>
                    <div className="text-green-400 font-semibold text-sm">
                      +{activity.tokens} B3TR
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" size="sm">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Environmental Impact */}
        <Card className="bg-gray-800/50 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Environmental Impact</CardTitle>
            <CardDescription className="text-gray-400">
              Your contribution to sustainable transportation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-700/50">
                <div className="text-2xl font-bold text-green-400 mb-2">2.4 kg</div>
                <div className="text-gray-300 text-sm">CO₂ Reduction</div>
                <div className="text-gray-400 text-xs mt-1">vs. private vehicle use</div>
              </div>
              <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-700/50">
                <div className="text-2xl font-bold text-blue-400 mb-2">18.5 km</div>
                <div className="text-gray-300 text-sm">Sustainable Distance</div>
                <div className="text-gray-400 text-xs mt-1">total eco-friendly travel</div>
              </div>
              <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
                <div className="text-2xl font-bold text-purple-400 mb-2">$47</div>
                <div className="text-gray-300 text-sm">Money Saved</div>
                <div className="text-gray-400 text-xs mt-1">compared to car ownership</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;