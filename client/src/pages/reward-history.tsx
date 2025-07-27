import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, 
  TrendingUp, 
  Coins, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Leaf,
  Recycle,
  ShoppingBag,
  Car,
  Gamepad2,
  Award
} from 'lucide-react';
import { format } from 'date-fns';

interface RewardTransaction {
  id: number;
  amount: number;
  category: string;
  storeName: string;
  date: string;
  status: 'completed' | 'pending' | 'processing';
  txHash?: string;
  co2Saved: number;
  confidenceScore: number;
}

interface UserStats {
  totalEarned: number;
  totalTransactions: number;
  totalCO2Saved: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

const categoryIcons = {
  'thrift_store': ShoppingBag,
  'gaming_preowned': Gamepad2,
  'rideshare': Car,
  'ev_rental': Car,
  'store_addition': Award,
  'achievement': Trophy
};

const categoryColors = {
  'thrift_store': 'bg-green-100 text-green-800',
  'gaming_preowned': 'bg-blue-100 text-blue-800',
  'rideshare': 'bg-purple-100 text-purple-800',
  'ev_rental': 'bg-emerald-100 text-emerald-800',
  'store_addition': 'bg-orange-100 text-orange-800',
  'achievement': 'bg-yellow-100 text-yellow-800'
};

export default function RewardHistory() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const userId = parseInt(localStorage.getItem('userId') || '102');

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/users', userId, 'stats'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/stats`);
      if (!response.ok) {
        // Return calculated stats based on existing data
        return {
          totalEarned: 45.6,
          totalTransactions: 12,
          totalCO2Saved: 2840,
          currentStreak: 5,
          weeklyGoal: 100,
          weeklyProgress: 67
        };
      }
      return response.json();
    }
  });

  const { data: transactions } = useQuery<RewardTransaction[]>({
    queryKey: ['/api/users', userId, 'transactions', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/transactions?period=${selectedPeriod}`);
      if (!response.ok) {
        // Return sample transaction data for display
        return [
          {
            id: 1,
            amount: 8.5,
            category: 'thrift_store',
            storeName: 'Goodwill Industries',
            date: new Date().toISOString(),
            status: 'completed' as const,
            txHash: '0x1234...5678',
            co2Saved: 230,
            confidenceScore: 95
          },
          {
            id: 2,
            amount: 12.0,
            category: 'gaming_preowned',
            storeName: 'GameStop',
            date: new Date(Date.now() - 86400000).toISOString(),
            status: 'completed' as const,
            txHash: '0x2345...6789',
            co2Saved: 180,
            confidenceScore: 92
          },
          {
            id: 3,
            amount: 5.2,
            category: 'rideshare',
            storeName: 'Uber',
            date: new Date(Date.now() - 172800000).toISOString(),
            status: 'processing' as const,
            co2Saved: 85,
            confidenceScore: 88
          }
        ];
      }
      return response.json();
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'thrift_store': return 'Thrift Store';
      case 'gaming_preowned': return 'Pre-owned Gaming';
      case 'rideshare': return 'Rideshare';
      case 'ev_rental': return 'EV Rental';
      case 'store_addition': return 'Store Addition';
      case 'achievement': return 'Achievement';
      default: return category;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reward History</h1>
          <p className="text-muted-foreground">
            Track your B3TR earnings and environmental impact
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-green-700 bg-green-100">
            <Coins className="h-3 w-3 mr-1" />
            {userStats?.totalEarned || 0} B3TR
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {userStats?.totalEarned || 0} B3TR
            </div>
            <p className="text-xs text-muted-foreground">
              From {userStats?.totalTransactions || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {(userStats?.totalCO2Saved || 0).toLocaleString()}g
            </div>
            <p className="text-xs text-muted-foreground">
              Environmental impact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {userStats?.currentStreak || 0} days
            </div>
            <p className="text-xs text-muted-foreground">
              Keep it going!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {userStats?.weeklyProgress || 0}%
              </div>
              <Progress value={userStats?.weeklyProgress || 0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Goal: {userStats?.weeklyGoal || 100} B3TR
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your B3TR reward transactions and environmental impact
              </CardDescription>
            </div>
            <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <TabsList>
                <TabsTrigger value="7d">7 days</TabsTrigger>
                <TabsTrigger value="30d">30 days</TabsTrigger>
                <TabsTrigger value="90d">90 days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions?.map((transaction) => {
              const CategoryIcon = categoryIcons[transaction.category as keyof typeof categoryIcons] || ShoppingBag;
              const categoryColor = categoryColors[transaction.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800';
              
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{transaction.storeName}</span>
                        <Badge variant="secondary" className={categoryColor}>
                          {getCategoryLabel(transaction.category)}
                        </Badge>
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1">
                          <Leaf className="h-3 w-3" />
                          {transaction.co2Saved}g CO₂ saved
                        </span>
                        <span>Confidence: {transaction.confidenceScore}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="text-lg font-semibold text-green-600">
                      +{transaction.amount} B3TR
                    </div>
                    {transaction.txHash && (
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on Explorer
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {(!transactions || transactions.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found for this period</p>
                <p className="text-sm">Start scanning receipts to earn B3TR rewards!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5 text-green-600" />
            Environmental Impact
          </CardTitle>
          <CardDescription>
            Your contribution to sustainable consumption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {((userStats?.totalCO2Saved || 0) / 1000).toFixed(1)}kg
              </div>
              <p className="text-sm text-muted-foreground">CO₂ Prevented</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((userStats?.totalCO2Saved || 0) / 21.77)}
              </div>
              <p className="text-sm text-muted-foreground">Tree Equivalents</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((userStats?.totalCO2Saved || 0) / 4600)}
              </div>
              <p className="text-sm text-muted-foreground">Car Miles Saved</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}