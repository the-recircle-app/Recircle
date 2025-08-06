import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Receipt, Coins, TrendingUp, Calendar, Activity, UserCog } from 'lucide-react';
import { Link } from 'wouter';

interface AnalyticsData {
  totalUsers: number;
  totalReceipts: number;
  totalTokensDistributed: number;
  recentActivity: {
    last7Days: {
      receipts: number;
      activeUsers: number;
      tokensDistributed: number;
    };
  };
  streakStats: {
    usersWithStreaks: number;
    averageStreak: number;
    maxStreak: number;
  };
}

interface DailyActiveUsers {
  date: string;
  activeUsers: number;
  userIds: number[];
}

interface WeeklyActiveUsers {
  weekStart: string;
  weekEnd: string;
  activeUsers: number;
  userIds: number[];
}

interface MonthlyActiveUsers {
  year: number;
  month: number;
  monthStart: string;
  monthEnd: string;
  activeUsers: number;
  userIds: number[];
}

const AdminAnalytics = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Overview stats
  const { data: overview, isLoading: overviewLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/overview'],
  });

  // Daily active users
  const { data: dailyUsers, isLoading: dailyLoading } = useQuery<DailyActiveUsers>({
    queryKey: ['/api/analytics/daily-active-users', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/daily-active-users?date=${selectedDate}`);
      return response.json();
    }
  });

  // Weekly active users
  const { data: weeklyUsers, isLoading: weeklyLoading } = useQuery<WeeklyActiveUsers>({
    queryKey: ['/api/analytics/weekly-active-users', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/weekly-active-users?startDate=${selectedDate}`);
      return response.json();
    }
  });

  // Monthly active users
  const { data: monthlyUsers, isLoading: monthlyLoading } = useQuery<MonthlyActiveUsers>({
    queryKey: ['/api/analytics/monthly-active-users', selectedYear, selectedMonth],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/monthly-active-users?year=${selectedYear}&month=${selectedMonth}`);
      return response.json();
    }
  });

  if (overviewLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ReCircle Analytics Dashboard</h1>
            <p className="text-gray-600">Track your platform's user activity and growth</p>
          </div>
          <Link href="/admin/employees">
            <Button variant="outline" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Employee Tracking
            </Button>
          </Link>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered platform users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalReceipts || 0}</div>
              <p className="text-xs text-muted-foreground">
                Verified transportation receipts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">B3TR Distributed</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalTokensDistributed || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total tokens rewarded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.streakStats.usersWithStreaks || 0}</div>
              <p className="text-xs text-muted-foreground">
                Users with active streaks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Last 7 Days Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{overview?.recentActivity.last7Days.activeUsers || 0}</div>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{overview?.recentActivity.last7Days.receipts || 0}</div>
                <p className="text-sm text-gray-600">Receipts Submitted</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{overview?.recentActivity.last7Days.tokensDistributed || 0}</div>
                <p className="text-sm text-gray-600">B3TR Distributed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily/Weekly/Monthly Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-sm font-medium mb-1 block">Select Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Month</label>
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Year</label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 5}, (_, i) => (
                      <SelectItem key={2022 + i} value={(2022 + i).toString()}>
                        {2022 + i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Daily Active Users</CardTitle>
                  <CardDescription>{selectedDate}</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : (
                    <div className="text-3xl font-bold text-blue-600">
                      {dailyUsers?.activeUsers || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Weekly Active Users</CardTitle>
                  <CardDescription>
                    {weeklyUsers?.weekStart} to {weeklyUsers?.weekEnd}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {weeklyLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : (
                    <div className="text-3xl font-bold text-green-600">
                      {weeklyUsers?.activeUsers || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Monthly Active Users</CardTitle>
                  <CardDescription>
                    {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : (
                    <div className="text-3xl font-bold text-purple-600">
                      {monthlyUsers?.activeUsers || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Streak Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{overview?.streakStats.averageStreak || 0}</div>
                <p className="text-sm text-gray-600">Average Streak Days</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{overview?.streakStats.maxStreak || 0}</div>
                <p className="text-sm text-gray-600">Longest Streak</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {overview?.streakStats.usersWithStreaks && overview?.totalUsers 
                    ? Math.round((overview.streakStats.usersWithStreaks / overview.totalUsers) * 100) 
                    : 0}%
                </div>
                <p className="text-sm text-gray-600">Users With Streaks</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminAnalytics;