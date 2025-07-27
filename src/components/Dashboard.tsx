import React from 'react';
import { Coins, Receipt, TrendingUp, Award } from 'lucide-react';

interface DashboardProps {
  tokenBalance: number;
  receiptsSubmitted: number;
  currentStreak: number;
  totalImpact: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tokenBalance,
  receiptsSubmitted,
  currentStreak,
  totalImpact
}) => {
  const stats = [
    {
      title: 'B3TR Tokens',
      value: tokenBalance.toFixed(1),
      icon: Coins,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Total earned tokens'
    },
    {
      title: 'Receipts',
      value: receiptsSubmitted.toString(),
      icon: Receipt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Successfully submitted'
    },
    {
      title: 'Current Streak',
      value: currentStreak.toString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Days in a row'
    },
    {
      title: 'Impact Score',
      value: totalImpact.toString(),
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Sustainability points'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your ReCircle Dashboard</h2>
        <p className="text-gray-600">Track your sustainable shopping impact</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Award className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Keep up the great work!
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              You're making a positive impact on the environment through sustainable shopping choices.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Receipt className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Receipt uploaded</span>
            </div>
            <span className="text-sm font-medium text-green-600">+2.5 B3TR</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">Streak milestone</span>
            </div>
            <span className="text-sm font-medium text-purple-600">Day {currentStreak}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Coins className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Tokens earned</span>
            </div>
            <span className="text-sm font-medium text-green-600">{tokenBalance.toFixed(1)} B3TR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;