import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "../context/WalletContext";
import { useQuery } from "@tanstack/react-query";

// Maximum number of rewarded actions per day (consistent with server value)
const MAX_DAILY_ACTIONS = 3;

// Google Forms URL for store submissions
// This is the official Google Form that collects new sustainable store submissions
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf2OM8EvafWxNg4yCojZEEi6HtTiJchuq51oLhF-Ve6OTc-Iw/viewform?usp=header";

const AddStoreForm = () => {
  const [, setLocation] = useLocation();
  const { userId, isConnected, refreshTokenBalance } = useWallet();
  const { toast } = useToast();
  const [dailyActionLimitReached, setDailyActionLimitReached] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Get user's transactions to check for daily action limit
  const { data: transactions } = useQuery({
    queryKey: [userId ? `/api/users/${userId}/transactions` : null],
    enabled: !!userId && isConnected,
  });
  
  // Check daily action limit (receipts + store additions)
  useEffect(() => {
    if (transactions && Array.isArray(transactions)) {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Count actions created today that count against daily limit
      // Include both receipt_verification and store_addition types
      const todayActions = transactions.filter(tx => {
        // Only count these types toward the daily limit
        if (tx.type !== 'receipt_verification' && tx.type !== 'store_addition') {
          return false;
        }
        
        // Check if transaction was created today
        if (!tx.createdAt) return false;
        const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
        return txDate === today;
      });
      
      const actionCount = todayActions.length;
      console.log(`Today's actions (store page): ${actionCount}/${MAX_DAILY_ACTIONS}`);
      
      // Set limit reached flag if we've hit or exceeded the daily limit
      setDailyActionLimitReached(actionCount >= MAX_DAILY_ACTIONS);
    }
  }, [transactions]);

  // Handle Google Form redirection and submission tracking
  const handleOpenGoogleForm = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to add stores",
        variant: "destructive"
      });
      return;
    }
    
    // Check if the user has reached daily action limit
    if (dailyActionLimitReached && isConnected) {
      toast({
        title: "Daily Action Limit Reached",
        description: `You've reached your limit of ${MAX_DAILY_ACTIONS} actions for today. This includes both receipt scans and store additions. Please come back tomorrow!`,
        variant: "destructive"
      });
      return;
    }

    setIsRedirecting(true);
    
    // Show pre-redirect notification
    toast({
      title: "Opening Store Submission Form",
      description: "You'll be redirected to our secure form to add a new sustainable store.",
    });
    
    try {
      // Record the form submission in our database
      const response = await fetch('/api/google-form-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          formType: 'store_submission'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record form submission');
      }
      
      const result = await response.json();
      
      console.log("Opening Google Form URL:", GOOGLE_FORM_URL);
      
      // First try directly opening the form in a new tab
      try {
        window.open(GOOGLE_FORM_URL, "_blank", "noopener,noreferrer");
      } catch (e) {
        console.error("Failed to open form via window.open:", e);
      }
      
      // Always show this dialog with the form link regardless of whether window.open worked
      // We'll use a fixed position dialog instead of a toast to ensure it stays visible
      const dialogDiv = document.createElement('div');
      dialogDiv.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
      dialogDiv.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold mb-2">Complete Your Submission</h3>
          <p class="mb-4">Click the button below to open our store submission form:</p>
          <a 
            href="${GOOGLE_FORM_URL}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-3 rounded text-center mb-4"
          >
            Open Google Form
          </a>
          <p class="text-sm text-gray-600 mb-4">
            Once you've completed the form, you'll receive tokens after we verify your submission.
          </p>
          <button 
            class="w-full border border-gray-300 rounded py-2 px-4 hover:bg-gray-100"
            id="closeFormDialog"
          >
            I've Completed The Form
          </button>
        </div>
      `;
      
      document.body.appendChild(dialogDiv);
      
      // Only show success toast when user confirms they've completed the form
      document.getElementById('closeFormDialog')?.addEventListener('click', () => {
        dialogDiv.remove();
        
        // Show success toast AFTER the user indicates they've completed the form
        toast({
          title: "Thank You For Your Submission",
          description: `Your submission is pending verification. You could earn up to ${result.potentialReward} B3TR tokens once approved.`,
          variant: "default"
        });
      });
      
      // No need to refresh token balance as rewards are pending verification
      // User will receive tokens after admin approval
      
    } catch (error: any) {
      console.error('Error recording form submission:', error);
      
      // If daily limit is reached, show that error
      if (error?.message?.includes('Daily action limit reached')) {
        toast({
          title: "Daily Action Limit Reached",
          description: `You've reached your limit of ${MAX_DAILY_ACTIONS} actions for today. Please come back tomorrow!`,
          variant: "destructive"
        });
      } else {
        // For other errors, just show the form dialog without an initial toast
        // We'll show the toast when they close the dialog instead
        
        // Try directly opening the form in a new tab
        try {
          window.open(GOOGLE_FORM_URL, "_blank", "noopener,noreferrer");
        } catch (e) {
          console.error("Failed to open form via window.open:", e);
        }
        
        // Show error dialog with form link
        const dialogDiv = document.createElement('div');
        dialogDiv.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
        dialogDiv.innerHTML = `
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold mb-2">Form Submission Issue</h3>
            <p class="mb-4">We couldn't record your submission for rewards, but you can still submit the form:</p>
            <a 
              href="${GOOGLE_FORM_URL}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-3 rounded text-center mb-4"
            >
              Open Google Form Anyway
            </a>
            <p class="text-sm text-gray-600 mb-4">
              Please contact support if this issue persists.
            </p>
            <button 
              class="w-full border border-gray-300 rounded py-2 px-4 hover:bg-gray-100"
              id="closeErrorDialog"
            >
              Close This Dialog
            </button>
          </div>
        `;
        
        document.body.appendChild(dialogDiv);
        
        // Add event listener to close button
        document.getElementById('closeErrorDialog')?.addEventListener('click', () => {
          dialogDiv.remove();
          
          // Show error toast AFTER the user closes the dialog
          toast({
            title: "Please Contact Support",
            description: "We couldn't track your submission for rewards but appreciate your contribution.",
            variant: "default"
          });
        });
      }
    } finally {
      setIsRedirecting(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    setLocation("/");
  };

  return (
    <div>
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span>Add New Sustainable Store</span>
            {/* Daily action limit indicator */}
            {isConnected && (
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 flex items-center">
                <span className="mr-1">Daily actions:</span>
                {transactions && Array.isArray(transactions) ? (
                  <span className={dailyActionLimitReached ? "text-red-500 font-bold" : ""}>
                    {Math.min(
                      transactions.filter(tx => {
                        // Only count receipt_verification and store_addition actions
                        if (tx.type !== 'receipt_verification' && tx.type !== 'store_addition') {
                          return false;
                        }
                        // Check if transaction was created today
                        if (!tx.createdAt) return false;
                        const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
                        return txDate === new Date().toISOString().split('T')[0];
                      }).length, 
                      MAX_DAILY_ACTIONS
                    )}/{MAX_DAILY_ACTIONS}
                  </span>
                ) : (
                  <span>0/{MAX_DAILY_ACTIONS}</span>
                )}
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Earn ReCircle tokens by adding verified sustainable store locations
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-4">
          {/* Daily action limit warning */}
          {dailyActionLimitReached && isConnected && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Daily Action Limit Reached</h3>
                  <div className="mt-2 text-sm">
                    <p>You've used all {MAX_DAILY_ACTIONS} of your daily actions (receipt scans and store additions combined). 
                    This limit helps maintain the quality and authenticity of our rewards program. 
                    Please come back tomorrow for more actions!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">About Store Submissions</h3>
                  <div className="mt-2 text-sm">
                    <p className="mb-2">
                      Adding a new sustainable store helps the ReCircle community grow while earning you rewards. Here's how the process works:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Submit store details through our secure form</li>
                      <li>Our team reviews submissions weekly for accuracy</li>
                      <li>Approved stores are added to the app and visible to all users</li>
                      <li>You'll receive tokens (typically 10 B3TR) after your submission is verified</li>
                      <li><span className="text-green-700 font-medium">NEW:</span> Streak bonuses can increase your reward by up to 50%!</li>
                    </ul>
                    <p className="mt-2 text-sm text-blue-700 font-medium">
                      Important: Please provide exact store name and address as shown on Google Maps to ensure quick verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center pt-4">
              <Button
                onClick={handleOpenGoogleForm}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm w-full text-center"
                disabled={dailyActionLimitReached || isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Opening Form...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Submit a New Sustainable Store
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex justify-center mt-2">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStoreForm;