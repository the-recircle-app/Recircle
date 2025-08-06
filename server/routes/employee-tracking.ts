import { Router } from 'express';
import type { IStorage } from '../storage';
import { insertReviewEmployeeSchema, insertWorkSessionSchema, insertReviewActionSchema } from '@shared/schema';

export function createEmployeeTrackingRoutes(storage: IStorage) {
  const router = Router();

  // Employee management routes
  router.get('/employees', async (_req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: 'Failed to fetch employees' });
    }
  });

  router.get('/employees/active', async (_req, res) => {
    try {
      const employees = await storage.getActiveEmployees();
      res.json(employees);
    } catch (error) {
      console.error('Error fetching active employees:', error);
      res.status(500).json({ error: 'Failed to fetch active employees' });
    }
  });

  router.post('/employees', async (req, res) => {
    try {
      const employeeData = insertReviewEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.json(employee);
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Failed to create employee' });
    }
  });

  router.patch('/employees/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Update last active time if employee is being marked as active
      if (updates.isActive === true) {
        updates.lastActiveAt = new Date();
      }
      
      const employee = await storage.updateEmployee(id, updates);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: 'Failed to update employee' });
    }
  });

  router.get('/employees/:id/work-sessions', async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const sessions = await storage.getEmployeeWorkSessions(employeeId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching employee work sessions:', error);
      res.status(500).json({ error: 'Failed to fetch work sessions' });
    }
  });

  router.get('/employees/:id/daily-stats', async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      
      const actions = await storage.getEmployeeReviewActions(employeeId, date);
      const sessions = await storage.getEmployeeWorkSessions(employeeId);
      
      // Filter sessions for the specific date
      const todaySessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.toDateString() === date.toDateString();
      });
      
      // Calculate total time worked
      let totalTimeMs = 0;
      todaySessions.forEach(session => {
        const start = new Date(session.startTime);
        const end = session.endTime ? new Date(session.endTime) : new Date();
        totalTimeMs += end.getTime() - start.getTime();
      });
      
      const totalHours = totalTimeMs / (1000 * 60 * 60);
      const totalReviews = actions.length;
      
      res.json({
        date: date.toISOString().split('T')[0],
        totalHours: parseFloat(totalHours.toFixed(2)),
        totalReviews,
        sessions: todaySessions,
        actions
      });
    } catch (error) {
      console.error('Error fetching employee daily stats:', error);
      res.status(500).json({ error: 'Failed to fetch daily stats' });
    }
  });

  // Work session routes
  router.get('/work-sessions/active', async (_req, res) => {
    try {
      const sessions = await storage.getActiveWorkSessions();
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching active work sessions:', error);
      res.status(500).json({ error: 'Failed to fetch active work sessions' });
    }
  });

  router.post('/employees/:id/start-session', async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const { notes } = req.body;
      
      // Check if employee already has an active session
      const activeSessions = await storage.getActiveWorkSessions();
      const existingSession = activeSessions.find(session => session.employeeId === employeeId);
      
      if (existingSession) {
        return res.status(400).json({ error: 'Employee already has an active work session' });
      }
      
      const sessionData = insertWorkSessionSchema.parse({
        employeeId,
        startTime: new Date(),
        notes: notes || null
      });
      
      const session = await storage.createWorkSession(sessionData);
      
      // Update employee's last active time
      await storage.updateEmployee(employeeId, { lastActiveAt: new Date() });
      
      res.json(session);
    } catch (error) {
      console.error('Error starting work session:', error);
      res.status(500).json({ error: 'Failed to start work session' });
    }
  });

  router.post('/work-sessions/:id/end', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { reviewsCompleted, notes } = req.body;
      
      const session = await storage.endWorkSession(sessionId, reviewsCompleted, notes);
      if (!session) {
        return res.status(404).json({ error: 'Work session not found' });
      }
      
      // Update employee's last active time
      await storage.updateEmployee(session.employeeId, { lastActiveAt: new Date() });
      
      res.json(session);
    } catch (error) {
      console.error('Error ending work session:', error);
      res.status(500).json({ error: 'Failed to end work session' });
    }
  });

  router.patch('/work-sessions/:id/reviews', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { reviewsCompleted } = req.body;
      
      const session = await storage.updateWorkSessionReviewCount(sessionId, reviewsCompleted);
      if (!session) {
        return res.status(404).json({ error: 'Work session not found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error updating work session review count:', error);
      res.status(500).json({ error: 'Failed to update review count' });
    }
  });

  // Review action routes
  router.post('/review-actions', async (req, res) => {
    try {
      const actionData = insertReviewActionSchema.parse(req.body);
      const action = await storage.createReviewAction(actionData);
      
      // Update the work session review count
      const session = await storage.getWorkSession(action.workSessionId);
      if (session) {
        await storage.updateWorkSessionReviewCount(action.workSessionId, session.reviewsCompleted + 1);
      }
      
      res.json(action);
    } catch (error) {
      console.error('Error creating review action:', error);
      res.status(500).json({ error: 'Failed to create review action' });
    }
  });

  router.get('/work-sessions/:id/actions', async (req, res) => {
    try {
      const workSessionId = parseInt(req.params.id);
      const actions = await storage.getWorkSessionReviewActions(workSessionId);
      res.json(actions);
    } catch (error) {
      console.error('Error fetching work session review actions:', error);
      res.status(500).json({ error: 'Failed to fetch review actions' });
    }
  });

  return router;
}