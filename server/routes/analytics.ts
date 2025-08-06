import { Router } from 'express';
import { IStorage } from '../storage';

export function createAnalyticsRoutes(storage: IStorage) {
  const router = Router();

  // Daily Active Users (DAU)
  router.get('/daily-active-users', async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : new Date();
      
      // Get users active today
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const receipts = await storage.getAllReceipts();
      const activeUsers = new Set(
        receipts
          .filter(r => {
            const receiptDate = new Date(r.purchaseDate);
            return receiptDate >= dayStart && receiptDate <= dayEnd;
          })
          .map(r => r.userId)
      );
      
      res.json({
        date: targetDate.toISOString().split('T')[0],
        activeUsers: activeUsers.size,
        userIds: Array.from(activeUsers)
      });
    } catch (error) {
      console.error('Error getting daily active users:', error);
      res.status(500).json({ error: 'Failed to get daily active users' });
    }
  });

  // Weekly Active Users (WAU)
  router.get('/weekly-active-users', async (req, res) => {
    try {
      const { startDate } = req.query;
      const weekStart = startDate ? new Date(startDate as string) : new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const receipts = await storage.getAllReceipts();
      const activeUsers = new Set(
        receipts
          .filter(r => {
            const receiptDate = new Date(r.purchaseDate);
            return receiptDate >= weekStart && receiptDate <= weekEnd;
          })
          .map(r => r.userId)
      );
      
      res.json({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        activeUsers: activeUsers.size,
        userIds: Array.from(activeUsers)
      });
    } catch (error) {
      console.error('Error getting weekly active users:', error);
      res.status(500).json({ error: 'Failed to get weekly active users' });
    }
  });

  // Monthly Active Users (MAU)
  router.get('/monthly-active-users', async (req, res) => {
    try {
      const { year, month } = req.query;
      const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
      const targetMonth = month ? parseInt(month as string) - 1 : new Date().getMonth();
      
      const monthStart = new Date(targetYear, targetMonth, 1);
      const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
      
      const receipts = await storage.getAllReceipts();
      const activeUsers = new Set(
        receipts
          .filter(r => {
            const receiptDate = new Date(r.purchaseDate);
            return receiptDate >= monthStart && receiptDate <= monthEnd;
          })
          .map(r => r.userId)
      );
      
      res.json({
        year: targetYear,
        month: targetMonth + 1,
        monthStart: monthStart.toISOString().split('T')[0],
        monthEnd: monthEnd.toISOString().split('T')[0],
        activeUsers: activeUsers.size,
        userIds: Array.from(activeUsers)
      });
    } catch (error) {
      console.error('Error getting monthly active users:', error);
      res.status(500).json({ error: 'Failed to get monthly active users' });
    }
  });

  // User Activity Timeline
  router.get('/user-activity/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { days = 30 } = req.query;
      
      const receipts = await storage.getAllReceipts();
      const userReceipts = receipts.filter(r => r.userId === userId);
      
      const daysBack = parseInt(days as string);
      const timeline = [];
      
      for (let i = 0; i < daysBack; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayReceipts = userReceipts.filter(r => {
          const receiptDate = new Date(r.purchaseDate);
          return receiptDate >= dayStart && receiptDate <= dayEnd;
        });
        
        timeline.push({
          date: date.toISOString().split('T')[0],
          receipts: dayReceipts.length,
          tokensEarned: dayReceipts.reduce((sum, r) => sum + r.tokenReward, 0),
          active: dayReceipts.length > 0
        });
      }
      
      res.json({
        userId,
        timeline: timeline.reverse()
      });
    } catch (error) {
      console.error('Error getting user activity:', error);
      res.status(500).json({ error: 'Failed to get user activity' });
    }
  });

  // Platform Overview Stats
  router.get('/overview', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const receipts = await storage.getAllReceipts();
      
      // Total stats
      const totalUsers = users.length;
      const totalReceipts = receipts.length;
      const totalTokensDistributed = receipts.reduce((sum, r) => sum + r.tokenReward, 0);
      
      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentReceipts = receipts.filter(r => new Date(r.purchaseDate) >= sevenDaysAgo);
      const recentActiveUsers = new Set(recentReceipts.map(r => r.userId));
      
      // Streak analytics
      const usersWithStreaks = users.filter(u => u.currentStreak > 0);
      const avgStreak = usersWithStreaks.length > 0 
        ? usersWithStreaks.reduce((sum, u) => sum + u.currentStreak, 0) / usersWithStreaks.length 
        : 0;
      
      res.json({
        totalUsers,
        totalReceipts,
        totalTokensDistributed: Math.round(totalTokensDistributed * 100) / 100,
        recentActivity: {
          last7Days: {
            receipts: recentReceipts.length,
            activeUsers: recentActiveUsers.size,
            tokensDistributed: Math.round(recentReceipts.reduce((sum, r) => sum + r.tokenReward, 0) * 100) / 100
          }
        },
        streakStats: {
          usersWithStreaks: usersWithStreaks.length,
          averageStreak: Math.round(avgStreak * 10) / 10,
          maxStreak: Math.max(...users.map(u => u.currentStreak), 0)
        }
      });
    } catch (error) {
      console.error('Error getting overview stats:', error);
      res.status(500).json({ error: 'Failed to get overview stats' });
    }
  });

  return router;
}