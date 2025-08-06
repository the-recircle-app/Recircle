import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Clock, CheckCircle, PlayCircle, StopCircle, Plus, Timer, BarChart3 } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ReviewEmployee {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  hourlyRate?: number;
  createdAt: string;
  lastActiveAt?: string;
}

interface WorkSession {
  id: number;
  employeeId: number;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  reviewsCompleted: number;
  notes?: string;
  createdAt: string;
}

interface ReviewAction {
  id: number;
  employeeId: number;
  workSessionId: number;
  receiptId: number;
  action: string;
  timeSpent?: number;
  notes?: string;
  completedAt: string;
}

const addEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  hourlyRate: z.number().min(0).optional(),
});

const startSessionSchema = z.object({
  notes: z.string().optional(),
});

const endSessionSchema = z.object({
  reviewsCompleted: z.number().min(0, "Reviews completed must be 0 or more"),
  notes: z.string().optional(),
});

const EndSessionForm = ({ session, onSubmit, isPending }: {
  session: WorkSession;
  onSubmit: (data: z.infer<typeof endSessionSchema>) => void;
  isPending: boolean;
}) => {
  const form = useForm<z.infer<typeof endSessionSchema>>({
    resolver: zodResolver(endSessionSchema),
    defaultValues: { 
      reviewsCompleted: session.reviewsCompleted, 
      notes: session.notes || "" 
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reviewsCompleted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reviews Completed</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any notes about this work session..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Ending Session..." : "End Session"}
        </Button>
      </form>
    </Form>
  );
};

const AdminEmployeeTracking = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  // Fetch employees
  const { data: employees, isLoading: employeesLoading } = useQuery<ReviewEmployee[]>({
    queryKey: ['/api/employees'],
  });

  // Fetch active work sessions
  const { data: activeSessions, isLoading: activeSessionsLoading } = useQuery<WorkSession[]>({
    queryKey: ['/api/work-sessions/active'],
  });

  // Fetch employee work sessions for selected employee
  const { data: employeeSessions } = useQuery<WorkSession[]>({
    queryKey: ['/api/employees', selectedEmployee, 'work-sessions'],
    enabled: !!selectedEmployee,
  });

  // Fetch employee daily stats
  const { data: employeeStats } = useQuery({
    queryKey: ['/api/employees', selectedEmployee, 'daily-stats', selectedDate],
    enabled: !!selectedEmployee,
  });

  // Mutations
  const addEmployeeMutation = useMutation({
    mutationFn: (data: z.infer<typeof addEmployeeSchema>) => 
      apiRequest('/api/employees', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: "Employee added successfully" });
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: ({ employeeId, notes }: { employeeId: number; notes?: string }) => 
      apiRequest(`/api/employees/${employeeId}/start-session`, { 
        method: 'POST', 
        body: { notes } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-sessions/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: "Work session started" });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: ({ sessionId, reviewsCompleted, notes }: { 
      sessionId: number; 
      reviewsCompleted: number; 
      notes?: string;
    }) => 
      apiRequest(`/api/work-sessions/${sessionId}/end`, { 
        method: 'POST', 
        body: { reviewsCompleted, notes } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-sessions/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: "Work session ended" });
    },
  });

  // Forms
  const addEmployeeForm = useForm<z.infer<typeof addEmployeeSchema>>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: { name: "", email: "", hourlyRate: undefined },
  });

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateTotalHours = (sessions: WorkSession[]) => {
    let totalMs = 0;
    sessions.forEach(session => {
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : new Date();
      totalMs += end.getTime() - start.getTime();
    });
    return (totalMs / (1000 * 60 * 60)).toFixed(1);
  };

  if (employeesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employee data...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Employee Tracking</h1>
            <p className="text-gray-600">Monitor manual review team productivity</p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/admin/analytics">
              <Button variant="default" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            
            {/* Add Employee Dialog */}
            <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Add a new team member to track their manual review work.
                </DialogDescription>
              </DialogHeader>
              <Form {...addEmployeeForm}>
                <form onSubmit={addEmployeeForm.handleSubmit((data) => addEmployeeMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={addEmployeeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter employee name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addEmployeeForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addEmployeeForm.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter hourly rate" 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={addEmployeeMutation.isPending}>
                    {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Active Work Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active Work Sessions
            </CardTitle>
            <CardDescription>
              Currently working employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeSessionsLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : activeSessions && activeSessions.length > 0 ? (
              <div className="space-y-3">
                {activeSessions.map((session) => {
                  const employee = employees?.find(emp => emp.id === session.employeeId);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                      <div>
                        <div className="font-medium">{employee?.name}</div>
                        <div className="text-sm text-gray-600">
                          Started: {new Date(session.startTime).toLocaleTimeString()} • 
                          Duration: {formatDuration(session.startTime)} • 
                          Reviews: {session.reviewsCompleted}
                        </div>
                        {session.notes && (
                          <div className="text-sm text-gray-500 mt-1">{session.notes}</div>
                        )}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <StopCircle className="h-4 w-4 mr-1" />
                            End Session
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>End Work Session</DialogTitle>
                            <DialogDescription>
                              Record the completion details for {employee?.name}'s work session.
                            </DialogDescription>
                          </DialogHeader>
                          <EndSessionForm 
                            session={session} 
                            onSubmit={(data) => endSessionMutation.mutate({ 
                              sessionId: session.id, 
                              reviewsCompleted: data.reviewsCompleted,
                              notes: data.notes 
                            })}
                            isPending={endSessionMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No active work sessions
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees?.map((employee) => {
                const isWorking = activeSessions?.some(session => session.employeeId === employee.id);
                const todaySessions = employeeSessions?.filter(session => {
                  const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
                  return sessionDate === selectedDate;
                }) || [];
                
                return (
                  <Card key={employee.id} className={`cursor-pointer transition-colors ${
                    selectedEmployee === employee.id ? 'border-primary' : 'hover:border-gray-300'
                  }`} onClick={() => setSelectedEmployee(employee.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{employee.name}</h3>
                        <div className="flex gap-2">
                          {isWorking && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Timer className="h-3 w-3 mr-1" />
                              Working
                            </Badge>
                          )}
                          <Badge variant={employee.isActive ? "default" : "outline"}>
                            {employee.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{employee.email}</p>
                      
                      {employee.hourlyRate && (
                        <p className="text-sm text-gray-500 mb-2">${employee.hourlyRate}/hour</p>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        Today: {calculateTotalHours(todaySessions)}h worked
                      </div>
                      
                      {!isWorking && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full mt-3">
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Start Session
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Start Work Session</DialogTitle>
                              <DialogDescription>
                                Begin tracking work time for {employee.name}.
                              </DialogDescription>
                            </DialogHeader>
                            <StartSessionForm 
                              onSubmit={(data) => startSessionMutation.mutate({ 
                                employeeId: employee.id, 
                                notes: data.notes 
                              })}
                              isPending={startSessionMutation.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Employee Details */}
        {selectedEmployee && (
          <Card>
            <CardHeader>
              <CardTitle>
                {employees?.find(emp => emp.id === selectedEmployee)?.name} - Work History
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Date:</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employeeSessions && employeeSessions.length > 0 ? (
                <div className="space-y-3">
                  {employeeSessions
                    .filter(session => {
                      const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
                      return sessionDate === selectedDate;
                    })
                    .map((session) => (
                      <div key={session.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {new Date(session.startTime).toLocaleTimeString()} - {' '}
                              {session.endTime ? new Date(session.endTime).toLocaleTimeString() : 'In Progress'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Duration: {formatDuration(session.startTime, session.endTime)} • 
                              Reviews: {session.reviewsCompleted}
                            </div>
                            {session.notes && (
                              <div className="text-sm text-gray-500 mt-1">{session.notes}</div>
                            )}
                          </div>
                          <Badge variant={session.isActive ? "default" : "secondary"}>
                            {session.isActive ? "Active" : "Completed"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No work sessions found for {selectedDate}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

const StartSessionForm = ({ onSubmit, isPending }: {
  onSubmit: (data: z.infer<typeof startSessionSchema>) => void;
  isPending: boolean;
}) => {
  const form = useForm<z.infer<typeof startSessionSchema>>({
    resolver: zodResolver(startSessionSchema),
    defaultValues: { notes: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any notes about this work session..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Starting..." : "Start Session"}
        </Button>
      </form>
    </Form>
  );
};

export default AdminEmployeeTracking;