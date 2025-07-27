import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Admin page for reviewing and approving pending store submissions
export default function PendingSubmissionsAdmin() {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Fetch all pending store submissions
  const { data: pendingSubmissions, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/transactions?type=form_submission_pending'],
    // Automatically add the type=form_submission_pending query parameter
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${queryKey[0]}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pending submissions');
      }
      return response.json();
    }
  });

  // Mutation for approving a submission
  const approveMutation = useMutation({
    mutationFn: async (submissionId: number) => {
      setProcessingId(submissionId);
      const response = await fetch(`/api/admin/approve-submission/${submissionId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve submission');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Submission Approved",
        description: `Rewards distributed: ${data.reward} B3TR tokens`,
        variant: "default"
      });
      
      // Refresh the pending submissions list
      queryClient.invalidateQueries({ queryKey: ['/api/transactions?type=form_submission_pending'] });
      setProcessingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive"
      });
      setProcessingId(null);
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-primary-foreground">Loading pending submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-destructive">Error loading submissions</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 md:p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Admin: Pending Store Submissions</CardTitle>
          <CardDescription>
            Review and approve user-submitted stores. Approving a submission will reward the user with tokens.
          </CardDescription>
        </CardHeader>
      </Card>

      {pendingSubmissions && pendingSubmissions.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {pendingSubmissions.map((submission: any) => (
            <Card key={submission.id} className="overflow-hidden border border-border/40 bg-background/60 backdrop-blur-sm">
              <CardHeader className="bg-secondary/30">
                <CardTitle className="text-lg">Submission #{submission.id}</CardTitle>
                <CardDescription>
                  <span className="block mb-1">User ID: {submission.userId}</span>
                  <span className="block mb-1">Date: {new Date(submission.createdAt).toLocaleString()}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="text-sm text-foreground/70">
                    <p><strong>Description:</strong> {submission.description}</p>
                  </div>
                  
                  <Button 
                    onClick={() => approveMutation.mutate(submission.id)}
                    disabled={processingId === submission.id || approveMutation.isPending}
                    className="w-full"
                  >
                    {processingId === submission.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve & Reward
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-green-50 border border-green-200 rounded-lg text-center max-w-3xl mx-auto">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
          <h3 className="text-xl font-semibold mb-2 text-green-800">All Submissions Processed</h3>
          <p className="text-green-700 mb-6">
            All sustainable store submissions have been reviewed. Check back later for new submissions.
          </p>
          
          <div className="bg-white p-6 rounded-lg mt-2 text-left w-full">
            <h4 className="font-medium text-gray-800 mb-3 text-lg border-b pb-2">Store Verification Process</h4>
            <ol className="list-decimal pl-5 space-y-3 text-gray-700">
              <li>Users submit store details via the Google Form (<a href="https://forms.gle/dZw8ybXABpZDFk7f8" target="_blank" className="text-blue-600 hover:underline">view form</a>)</li>
              <li>Submissions appear here as "pending" for admin review and verification</li>
              <li>Admins check for duplicates and verify the store meets sustainability criteria</li>
              <li>Clicking "Approve" verifies a submission and distributes tokens to the user</li>
              <li>Users receive tokens <strong>only after admin approval</strong> - this prevents reward abuse</li>
              <li>The system automatically tracks all reward distributions including streak multipliers</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-blue-700 text-sm">
              <strong>Note:</strong> The pending submission list is refreshed automatically. New submissions will appear here as soon as users complete the Google Form store submission process.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}