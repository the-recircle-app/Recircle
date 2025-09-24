import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@/context/WalletContext";
import Header from "../components/Header";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CameraCapture from "../components/CameraCapture";
import B3trLogo from "../components/B3trLogo";
import { imageValidation, ReceiptAnalysisResult, TestReceiptType } from "../lib/imageValidation";
import type { ThriftStore } from "../types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import StreakCelebration from "../components/StreakCelebration";

// enum for tracking the current step of the receipt submission process
enum ScanStep {
  CAMERA = "camera",
  ANALYZING = "analyzing",
  FORM = "form",
  SUCCESS = "success"
}

const receiptFormSchema = z.object({
  storeId: z.string().min(1, "Please select a store"),
  category: z.string().min(1, "Please select a purchase category"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  purchaseDate: z.string().min(1, "Please select a date"),
});

type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

const ScanReceipt = () => {
  const [, setLocation] = useLocation();
  const { userId, isConnected, refreshTokenBalance, tokenBalance } = useWallet();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<ScanStep>(ScanStep.CAMERA);
  const [capturedImage, setCapturedImage] = useState<{file: File, dataUrl: string} | null>(null);
  const [baseReward, setBaseReward] = useState(8); // Base reward before multiplier (updated from 5)
  // For testing purposes - let's simulate a streak multiplier of 1.2x
  const [streakMultiplier, setStreakMultiplier] = useState(1.2); // Track user's streak multiplier
  const [rewardAmount, setRewardAmount] = useState(baseReward * streakMultiplier); // Total reward with multiplier
  const [aiAnalysis, setAiAnalysis] = useState<ReceiptAnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  // Test mode will only be available in development environments
  const [isTestMode, setIsTestMode] = useState(() => {
    // Check if we're in development mode
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname.includes('replit.dev') ||
                          window.location.hostname.includes('.repl.co');
                          
    // Only default to test mode in iframes during development
    const isIframe = window !== window.parent || !!window.frameElement;
    return isDevelopment && isIframe;
  });
  const [testReceiptType, setTestReceiptType] = useState<TestReceiptType>(null);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [dailyScanLimitReached, setDailyScanLimitReached] = useState(false);
  const maxDailyScans = 3;
  const [submittedReceipt, setSubmittedReceipt] = useState<any>(null);
  
  // Debug our states
  useEffect(() => {
    console.log("Test mode:", isTestMode);
    console.log("Selected store ID:", selectedStoreId);
  }, [isTestMode, selectedStoreId]);
  
  // Get list of sustainable transportation partners for the form
  const { data: stores, isLoading: isLoadingStores } = useQuery<ThriftStore[]>({
    queryKey: ['/api/thrift-stores']
  });
  
  // Get user's receipts to check for daily scan limit
  const { data: receipts } = useQuery({
    queryKey: [userId ? `/api/users/${userId}/receipts` : null],
    enabled: !!userId && isConnected,
  });
  
  // Get user's transactions to check for daily scan and store addition limit combined
  const { data: transactions } = useQuery({
    queryKey: [userId ? `/api/users/${userId}/transactions` : null],
    enabled: !!userId && isConnected,
  });
  
  // Log the loaded stores for debugging
  useEffect(() => {
    console.log("Stores loaded from API:", stores);
  }, [stores]);
  
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
        const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
        return txDate === today;
      });
      
      const actionCount = todayActions.length;
      console.log(`Today's actions: ${actionCount}/${maxDailyScans}`);
      
      // Set limit reached flag if we've hit or exceeded the daily limit
      setDailyScanLimitReached(actionCount >= maxDailyScans);
    }
  }, [transactions, maxDailyScans]);

  // Create fallback test stores if in test mode and no stores are loaded
  const availableStores = useMemo(() => {
    if (stores && stores.length > 0) {
      console.log("Using real stores:", stores.length, "stores available");
      return stores;
    } else if (isTestMode) {
      console.log("Using fallback test stores in test mode");
      // Provide fallback test stores
      return [
        { id: 1, name: "Goodwill", address: "123 Main St", city: "San Francisco", state: "CA", verified: true },
        { id: 2, name: "Salvation Army", address: "456 Market St", city: "San Francisco", state: "CA", verified: true },
        { id: 3, name: "St. Vincent de Paul", address: "789 Mission St", city: "San Francisco", state: "CA", verified: true }
      ] as ThriftStore[];
    }
    console.log("No stores available");
    return [];
  }, [stores, isTestMode]);

  // Set up form
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      storeId: "",
      category: "re-use item", // Standardized category for all receipts
      amount: 0,
      purchaseDate: new Date().toISOString().split("T")[0]
    }
  });

  // Update form with AI analysis data when it becomes available
  useEffect(() => {
    if (aiAnalysis) {
      // Don't populate form if the analysis shows manual review is needed or it's invalid
      if (aiAnalysis.needsManualReview || !aiAnalysis.isValid || aiAnalysis.timeoutFallback) {
        console.log("Manual review needed or invalid receipt, leaving fields empty");
        // Clear any existing values to ensure empty state
        form.setValue('amount', 0);
        form.setValue('storeId', "");
        return;
      }
      
      // CRITICAL SAFETY CHECK: Ensure GameStop receipts are only acceptable if they have pre-owned items
      if (aiAnalysis.storeName?.includes("GameStop") && !aiAnalysis.containsPreOwnedItems) {
        console.warn("GameStop receipt without pre-owned items detected - forcing isAcceptable to false");
        aiAnalysis.isAcceptable = false;
        aiAnalysis.reasons = ["This GameStop receipt doesn't contain any pre-owned items",
                            "Only pre-owned items qualify for sustainability rewards"];
      }
      
      // Set amount only if we have valid data
      if (aiAnalysis.totalAmount !== null) {
        form.setValue('amount', aiAnalysis.totalAmount);
      } else {
        form.setValue('amount', 0);
      }
      
      // Set date only if we have valid data
      if (aiAnalysis.purchaseDate !== null) {
        form.setValue('purchaseDate', aiAnalysis.purchaseDate);
      } else {
        form.setValue('purchaseDate', new Date().toISOString().split("T")[0]);
      }
      
      // Special handling for GameStop receipts
      if (aiAnalysis.storeName?.toLowerCase().includes("gamestop")) {
        console.log("GameStop receipt detected - looking for GameStop in store database");
            
        // Try to find GameStop in our database
        const gameStopStore = availableStores.find(store => 
          store.name.toLowerCase().includes("gamestop") ||
          store.name.toLowerCase().includes("game stop")
        );
            
        if (gameStopStore) {
          console.log("Found GameStop in database:", gameStopStore.name);
          form.setValue('storeId', gameStopStore.id.toString());
          setSelectedStoreId(gameStopStore.id);
        } else {
          // For GameStop receipts, don't default to another store
          console.log("GameStop not found in database, leaving store selection empty");
          form.setValue('storeId', "");
        }
        return;
      }
      
      // If we explicitly set a selected store ID, use that
      if (selectedStoreId !== null) {
        console.log("Using pre-selected store ID:", selectedStoreId);
        form.setValue('storeId', selectedStoreId.toString());
        return;
      }
      
      // If there are stores and we detected a store name, try to find a match
      if (availableStores.length > 0 && aiAnalysis.storeName) {
        console.log("Trying to match store:", aiAnalysis.storeName, "with available stores");
        
        const matchedStore = availableStores.find(store => 
          store.name.toLowerCase().includes(aiAnalysis.storeName!.toLowerCase()) ||
          aiAnalysis.storeName!.toLowerCase().includes(store.name.toLowerCase())
        );
        
        if (matchedStore) {
          console.log("Matched store:", matchedStore.name);
          form.setValue('storeId', matchedStore.id.toString());
          setSelectedStoreId(matchedStore.id);
        } else {
          // Leave empty - don't default to first store if we can't match
          // This forces the user to select a store
          console.log("No matching store found, leaving store selection empty");
          form.setValue('storeId', "");
        }
      } else {
        console.log("No store name detected, leaving store selection empty");
        form.setValue('storeId', "");
      }
    }
  }, [aiAnalysis, availableStores, form, selectedStoreId]);

  // Set up mutation for submitting receipt
  const submitReceiptMutation = useMutation({
    mutationFn: async (data: ReceiptFormValues & { imageId?: string }) => {
      if (!userId) {
        throw new Error("User not connected");
      }
      
      // Calculate reward based on AI analysis if available, or use the server-side calculation
      let tokenReward: number | undefined = undefined;
      
      if (aiAnalysis && aiAnalysis.isAcceptable) {
        tokenReward = aiAnalysis.estimatedReward;
      }
      
      // Special handling for GameStop receipts - use file name from captured image
      const capturedFileName = capturedImage?.file?.name.toLowerCase() || "";
      const isGameStop = 
        (aiAnalysis?.storeName?.includes("GameStop") || 
         data.storeId === "gamestop-pre-owned" ||
         capturedFileName.includes("gamestop"));

      // Ensure we use numeric store ID except for GameStop detection
      let storeId: string | number = data.storeId;
      if (storeId !== "gamestop-pre-owned" && !isGameStop) {
        storeId = parseInt(data.storeId);
      }
      
      // Construct a valid analysisResult object with critical fields for thrift store detection
      const analysisResult = aiAnalysis ? {
        storeName: aiAnalysis.storeName || (isGameStop ? "GameStop" : undefined),
        confidence: aiAnalysis.confidence || 0.0,
        isThriftStore: aiAnalysis.isThriftStore || false,
        isSustainableStore: aiAnalysis.isSustainableStore || false,
        sentForManualReview: aiAnalysis.sentForManualReview || false,
        testMode: aiAnalysis.testMode || false,
        timeoutFallback: aiAnalysis.timeoutFallback || false,
        containsPreOwnedItems: aiAnalysis.containsPreOwnedItems || false,
        sustainability: aiAnalysis.sustainabilityReasons || []
      } : null;
      
      const receiptData = {
        storeId: storeId,
        userId: userId,
        amount: data.amount,
        purchaseDate: new Date(data.purchaseDate).toISOString(),
        imageUrl: capturedImage?.file.name || "receipt-image-url", // Use actual file name
        imageId: capturedImage?.file.name, // Add the imageId from captured image
        tokenReward, // If undefined, server will calculate using its own algorithm
        storeName: isGameStop ? "GameStop" : (aiAnalysis?.storeName || undefined),
        containsPreOwnedItems: isGameStop || aiAnalysis?.containsPreOwnedItems,
        preOwned: isGameStop || aiAnalysis?.containsPreOwnedItems,
        
        // Add the analysis result object with needed fields for thrift store bypass
        analysisResult: analysisResult,
        
        // Also add individual fields for backwards compatibility
        confidenceLevel: aiAnalysis?.confidence || 0.0,
        isThriftStore: aiAnalysis?.isThriftStore || false
      };

      return apiRequest("POST", "/api/receipts", receiptData);
    },
    onSuccess: async (data) => {
      const json = await data.json();
      // Store the json response in state for use in the success screen
      setSubmittedReceipt(json);
      
      const finalReward = json.tokenReward || 8;
      setRewardAmount(finalReward);
      
      // Extract and store the base reward and streak multiplier if available
      if (json.rewardDetails) {
        setBaseReward(json.rewardDetails.baseReward || finalReward);
        setStreakMultiplier(json.rewardDetails.streakMultiplier || 1);
      } else {
        // If detailed reward info is not available, make a reasonable estimate
        // Base reward is now 8 tokens (updated from 5)
        setBaseReward(8);
        setStreakMultiplier(finalReward / 8);
      }
      
      // Refresh token balance to ensure UI displays the latest token amount
      if (refreshTokenBalance) {
        console.log("Refreshing token balance after receipt submission");
        await refreshTokenBalance();
      }
      
      // Check if the streak was updated
      if (json.streakInfo && json.streakInfo.streakIncreased) {
        // Show streak celebration for streak milestones (3, 5, 7, 10, 14, 21, 30 days)
        const streakMilestones = [3, 5, 7, 10, 14, 21, 30];
        const currentStreak = json.streakInfo.currentStreak;
        
        if (streakMilestones.includes(currentStreak)) {
          setStreakCount(currentStreak);
          setShowStreakCelebration(true);
          
          // Delay showing the success screen until after the celebration
          setTimeout(() => {
            setCurrentStep(ScanStep.SUCCESS);
          }, 7000); // Celebration animation takes about 7 seconds
        } else {
          setCurrentStep(ScanStep.SUCCESS);
        }
      } else {
        setCurrentStep(ScanStep.SUCCESS);
      }
      
      // Invalidate user data and transaction queries to refresh in all components
      if (userId) {
        // Invalidate user data
        queryClient.invalidateQueries({ 
          queryKey: [`/api/users/${userId}`] 
        });
        
        // Invalidate user receipts
        queryClient.invalidateQueries({ 
          queryKey: [`/api/users/${userId}/receipts`] 
        });
        
        // Invalidate user transactions to ensure they appear in transaction history
        queryClient.invalidateQueries({ 
          queryKey: [`/api/users/${userId}/transactions`] 
        });
        
        console.log("Forcing user data refresh after receipts update");
      }
      
      // Check if the receipt needs manual review
      if (json.needsManualReview) {
        toast({
          title: "Receipt Submitted for Review",
          description: "Your receipt has been sent for manual review. Rewards will be issued after verification.",
          duration: 8000, // Extended duration for manual review notifications
          variant: "secondary"
        });
      } else {
        toast({
          title: "Receipt Submitted",
          description: "Your receipt has been verified successfully",
          duration: 6000,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit receipt",
        variant: "destructive"
      });
    }
  });

  // Setup AI analysis mutation
  const analyzeReceiptMutation = useMutation({
    mutationFn: async (file: File) => {
      // Get the current purchaseDate from the form if it exists
      const manualPurchaseDate = form.getValues().purchaseDate;
      
      // Pass test mode parameters if we're in test mode
      if (isTestMode) {
        return await imageValidation.analyzeReceiptWithAI(file, {
          testMode: true,
          testType: testReceiptType,
          purchaseDate: manualPurchaseDate // Pass the manually entered date for validation
        });
      }
      return await imageValidation.analyzeReceiptWithAI(file, {
        purchaseDate: manualPurchaseDate // Also pass the date in normal mode
      });
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      console.log("AI Analysis result:", data);
      
      // Update form with values from AI analysis
      if (data.totalAmount) {
        form.setValue("amount", data.totalAmount);
      }
      
      if (data.purchaseDate) {
        form.setValue("purchaseDate", data.purchaseDate);
      }
      
      // If we detected a store name, try to match it with one in our database
      if (data.storeName && availableStores.length > 0) {
        // Special handling for GameStop receipts - preserve the GameStop name
        const isGameStop = data.storeName.toLowerCase().includes('gamestop');
        
        if (isGameStop) {
          console.log("GameStop receipt detected - preserving store name");
          // Find a default store to use for ID purposes only
          if (availableStores.length > 0) {
            form.setValue("storeId", availableStores[0].id.toString());
          }
        } else {
          // Standard store matching for non-GameStop receipts
          const matchedStore = availableStores.find(store => 
            store.name.toLowerCase().includes(data.storeName?.toLowerCase() || '') ||
            (data.storeName?.toLowerCase() || '').includes(store.name.toLowerCase())
          );
          
          console.log("Trying to match store:", data.storeName, "with available stores");
          
          if (matchedStore) {
            console.log("Found matching store:", matchedStore.name);
            form.setValue("storeId", matchedStore.id.toString());
          } else if (availableStores.length > 0) {
            // Default to first store if no match
            console.log("No matching store found, defaulting to:", availableStores[0].name);
            form.setValue("storeId", availableStores[0].id.toString());
          }
        }
      } else if (availableStores.length > 0) {
        // Default to first store if no store name detected
        console.log("No store name detected, defaulting to:", availableStores[0].name);
        form.setValue("storeId", availableStores[0].id.toString());
      }
      
      // Proceed to form
      setCurrentStep(ScanStep.FORM);
      
      // Prepare detailed feedback message
      let feedbackTitle = "";
      let feedbackDescription = "";
      let variant: "default" | "destructive" | "secondary" = "default";
      
      // Special case handling for GameStop with pre-owned items (always acceptable)
      const isGameStop = data.storeName?.toLowerCase().includes('gamestop') || false;
      const hasPreOwnedItems = data.containsPreOwnedItems || false;

      // Handle timeouts / fallback mode with clearer messaging
      if (data.timeoutFallback) {
        console.info("Using timeout fallback mode messaging");
        
        // Check if the receipt needs manual review - most timeout cases will
        if (data.needsManualReview) {
          feedbackTitle = "Receipt Sent for Manual Review";
          feedbackDescription = "Our AI couldn't fully process your receipt in time. We've sent it for manual review by our team. If approved, your rewards will be added later.";
          variant = "secondary"; // Use secondary variant for manual review
        }
        // For GameStop receipts with confirmed pre-owned items, we can still approve
        else if (isGameStop && hasPreOwnedItems) {
          feedbackTitle = "GameStop Pre-Owned Receipt Validated";
          feedbackDescription = `✅ Receipt from GameStop with pre-owned items accepted.
            Estimated reward: ${data.estimatedReward.toFixed(1)} B3TR tokens.`;
        }
        // For other sustainable stores in fallback mode with high confidence
        else if ((data.isThriftStore || data.isSustainableStore) && data.confidence > 0.7) {
          feedbackTitle = "Receipt Validated!";
          feedbackDescription = `✅ Receipt from ${data.storeName || 'sustainable store'} accepted.
            Estimated reward: ${data.estimatedReward.toFixed(1)} B3TR tokens.
            Note: Processing time was extended, some details may be estimated.`;
        }
        // All other timeout cases - be cautious and mark for review
        else {
          feedbackTitle = "Receipt Sent for Review";
          feedbackDescription = "We couldn't automatically verify this receipt. It has been sent to our team for review. If approved, your rewards will be added later.";
          variant = "secondary"; // Use secondary variant for manual review
        }
      }
      // Standard flow for successfully processed receipts
      else if (data.isAcceptable) {
        feedbackTitle = "Receipt Validated!";
        
        // Use standardized category message
        const categoryMessage = "re-use item";
        
        feedbackDescription = `✅ ${data.storeName || 'Sustainable store'} receipt verified! 
          ${data.estimatedReward.toFixed(1)} B3TR tokens for your ${categoryMessage} purchase.
          ${data.confidence > 0.8 ? 'High confidence detection.' : ''}`;
      } 
      // Handle GameStop receipts specially for clarity
      else if (isGameStop && hasPreOwnedItems) {
        feedbackTitle = "GameStop Receipt Validated";
        feedbackDescription = `✅ Receipt from GameStop with pre-owned items accepted.
          Estimated reward: ${data.estimatedReward.toFixed(1)} B3TR tokens.`;
      }
      // Handle regular rejection scenarios
      else if (!data.isThriftStore && !data.isSustainableStore) {
        feedbackTitle = "Not a Sustainable Store Receipt";
        feedbackDescription = `❌ This appears to be from ${data.storeName || 'a store'} which is not a sustainable store. 
          ${data.reasons.join(' ')}`;
        variant = "destructive";
      } else if (!data.isValid) {
        feedbackTitle = "Invalid Receipt";
        feedbackDescription = `❌ This doesn't appear to be a valid receipt. 
          ${data.reasons.join(' ')}`;
        variant = "destructive";
      }
      
      // Prepare test mode indicator
      const testModeIndicator = data.testMode 
        ? `\n\nℹ️ ${data.timeoutFallback ? 'Analysis timed out - using simplified verification.' : 'This analysis was processed in test mode.'}`
        : '';
      
      // Manual review notification indicator
      const manualReviewIndicator = data.sentForManualReview
        ? `\n\n📝 Your receipt has been sent for manual review by our team. We'll process it within 24-48 hours.`
        : '';
      
      // Show toast with AI validation result
      toast({
        title: data.sentForManualReview 
          ? "Receipt Submitted for Review" 
          : (data.testMode ? `${feedbackTitle} (Test Mode)` : feedbackTitle),
        description: feedbackDescription + testModeIndicator + manualReviewIndicator,
        variant: data.sentForManualReview ? "default" : variant,
        duration: data.sentForManualReview ? 8000 : 6000, // Show longer for manual review cases
      });
      
      // Log detailed status for debugging
      if (data.testMode) {
        console.info(`Receipt processed in ${data.timeoutFallback ? 'timeout fallback' : 'test'} mode`);
      }
      
      if (data.sentForManualReview) {
        console.info("Receipt sent for manual review");
      }
    },
    onError: async (error) => {
      console.error("Error analyzing receipt:", error);
      setAnalyzeError(error instanceof Error ? error.message : "Failed to analyze receipt");
      setCurrentStep(ScanStep.FORM); // Still proceed to form, but without AI results
      
      // Check if the error response indicates manual review
      let sentForManualReview = false;
      let userMessage = "We couldn't automatically analyze your receipt. Please enter the details manually or try again with a clearer image.";
      
      // Try to extract response data if this was an API error
      try {
        // @ts-ignore - Check if error has a response property (from fetch)
        if (error.response) {
          // @ts-ignore - Try to parse the JSON response
          const responseData = await error.response.json();
          sentForManualReview = responseData.sentForManualReview === true;
          if (responseData.userMessage) {
            userMessage = responseData.userMessage;
          }
        }
      } catch (jsonError) {
        // If we can't parse the JSON, just continue with default message
        console.warn("Couldn't parse error response:", jsonError);
      }
      
      toast({
        title: sentForManualReview ? "Receipt Submitted for Review" : "AI Analysis Error",
        description: userMessage + (sentForManualReview ? 
          "\n\n📝 Your receipt has been sent for manual review by our team. We'll process it within 24-48 hours." : ""),
        variant: sentForManualReview ? "default" : "destructive",
        duration: sentForManualReview ? 8000 : 6000, // Show longer for manual review cases
      });
    }
  });

  // Handle image capture from camera
  const handleCapture = (file: File, dataUrl: string) => {
    // Check if the user has reached daily action limit (only if not in test mode)
    if (dailyScanLimitReached && !isTestMode && isConnected) {
      toast({
        title: "Daily Action Limit Reached",
        description: `You've reached your limit of ${maxDailyScans} actions for today. This includes both receipt scans and store additions. Please come back tomorrow!`,
        variant: "destructive"
      });
      return;
    }
    
    setCapturedImage({ file, dataUrl });
    setCurrentStep(ScanStep.ANALYZING);
    
    // Reset error state and analysis data
    setAnalyzeError(null);
    setAiAnalysis(null);
    
    // Start AI analysis
    analyzeReceiptMutation.mutate(file);
  };

  // Handle form submission
  const onSubmit = (data: ReceiptFormValues) => {
    if (!isConnected && !isTestMode) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit receipts",
        variant: "destructive"
      });
      return;
    }
    
    if (isTestMode) {
      toast({
        title: "Test Mode",
        description: "Submitting receipt to the database",
      });
      
      // If storeId is empty in test mode, set it to default test store
      let storeId = data.storeId;
      if (!storeId && availableStores.length > 0) {
        storeId = availableStores[0].id.toString();
      }
      
      // Get correct store ID - try multiple sources
      const storeIdToUse = selectedStoreId || 
                         (data.storeId ? parseInt(data.storeId) : null) || 
                         (availableStores.length > 0 ? availableStores[0].id : 1);
      
      console.log("Using store ID:", storeIdToUse);
      
      // In test mode, use a fixed test user ID (102) when not connected
      const testReceiptData = {
        storeId: storeIdToUse,
        userId: userId || 102, // Use 102 as the test user ID when not connected
        amount: data.amount,
        purchaseDate: new Date(data.purchaseDate).toISOString(),
        imageUrl: `receipt-image-url-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tokenReward: aiAnalysis?.estimatedReward || 8, // Updated default from 5 to 8
        // Add test mode flag for the server
        isTestMode: true
      };
      
      console.log("Submitting test receipt with data:", testReceiptData);
      
      // Directly call API to ensure receipt is created regardless of connection state
      apiRequest("POST", "/api/receipts", testReceiptData)
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              throw err;
            });
          }
          return response.json();
        })
        .then(data => {
          console.log("Test receipt created:", data);
          setRewardAmount(data.tokenReward || 8); // Updated default from 5 to 8
          
          // Get the test user ID (defaults to 102)
          const testUserId = userId || 102;
          
          // Refresh the receipts data to update counts
          // Invalidate receipts data
          queryClient.invalidateQueries({ 
            queryKey: [`/api/users/${testUserId}/receipts`] 
          });
          
          // Invalidate transaction data to ensure it appears in transaction history
          queryClient.invalidateQueries({ 
            queryKey: [`/api/users/${testUserId}/transactions`] 
          });
          
          // Check for first receipt achievement and trigger it
          const checkFirstReceipt = async () => {
            try {
              // Get all user receipts to check if this is the first one
              const receiptsResponse = await fetch(`/api/users/${testUserId}/receipts`);
              const receipts = await receiptsResponse.json();
              
              console.log("Current user receipts:", receipts);
              
              // Check if this is the first receipt AND if there are no first_receipt achievements already
              // To prevent duplicate achievement notifications
              const recentTransactions = await fetch(`/api/users/${testUserId}/transactions`);
              const transactions = await recentTransactions.json();
              
              // Check if there's already a first_receipt achievement transaction
              const hasFirstReceiptAchievement = transactions.some((t: any) => 
                t.type === 'achievement_reward' && 
                t.description?.includes('first_receipt')
              );
              
              if (receipts.length === 1 && !hasFirstReceiptAchievement) {
                console.log("First receipt detected - achievement should be automatically awarded by server");
                
                // Show achievement notification
                toast({
                  title: "Achievement Unlocked!",
                  description: "You've scanned your first receipt! +10 B3TR tokens rewarded.",
                  variant: "default"
                });
                
                // Refresh token balance in WalletContext to get the updated amount including achievement bonus
                if (refreshTokenBalance) {
                  console.log("Refreshing token balance after achievement completion");
                  await refreshTokenBalance();
                }
              } else {
                console.log("Not the first receipt or achievement already awarded, no need to trigger achievement");
              }
              
              // Try to refresh achievements from the context
              try {
                // This will be a no-op if the context isn't available
                const achievementsContext = document.querySelector('[data-achievements-context="true"]');
                if (achievementsContext) {
                  console.log("Triggering achievements refresh...");
                  achievementsContext.dispatchEvent(new CustomEvent('refreshAchievements'));
                }
              } catch (e) {
                console.log("Could not refresh achievements context:", e);
              }
              
              // Force refresh the achievements page data
              queryClient.invalidateQueries({ 
                queryKey: [`/api/users/${testUserId}/achievements`] 
              });
              
              // Also force refresh any queries that use user data
              queryClient.invalidateQueries({ 
                queryKey: [`/api/users/${testUserId}`] 
              });
            } catch (error) {
              console.error("Error checking for achievements:", error);
            }
          };
          
          // Check for achievements
          checkFirstReceipt();
          
          // Move to success step immediately for test receipts
          // In test mode, we don't want to show streak celebrations 
          // to avoid confusing the user with possibly incorrect values
          setCurrentStep(ScanStep.SUCCESS);
        })
        .catch(error => {
          console.error("Error creating test receipt:", error);
          
          // Display error message
          toast({
            title: "Test Submission Error",
            description: error.errors ? error.errors[0]?.message : 
                        error.message ? error.message : 
                        "There was an error submitting your test receipt.",
            variant: "destructive"
          });
        });
      
      return;
    }
    
    submitReceiptMutation.mutate(data);
  };

  // Handle retake photo button
  const handleRetake = () => {
    setCapturedImage(null);
    setCurrentStep(ScanStep.CAMERA);
  };

  // Handle return to dashboard button
  const handleReturnToDashboard = () => {
    setLocation("/");
  };

  // Handle completion of streak celebration animation
  const handleStreakCelebrationComplete = () => {
    setShowStreakCelebration(false);
  };

  // Get user data including streak info
  const { data: userData } = useQuery<any>({
    queryKey: [isConnected && userId ? `/api/users/${userId}` : null],
    enabled: !!userId && isConnected,
  });

  // Extract current streak from user data
  const currentStreak = userData?.currentStreak || 0;
  
  return (
    <div>
      {/* Header */}
      <Header streak={currentStreak} gems={tokenBalance} className="mb-2" />
      
      {/* Back Button */}
      <div className="mb-4">
        <Button 
          variant="secondary" 
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium shadow-sm" 
          onClick={() => setLocation("/")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </Button>
      </div>
      
      {/* Streak Celebration */}
      {showStreakCelebration && (
        <StreakCelebration 
          isVisible={showStreakCelebration}
          onComplete={handleStreakCelebrationComplete}
          streakCount={streakCount}
        />
      )}
      
      {/* Camera View */}
      {currentStep === ScanStep.CAMERA && (
        <Card className="overflow-hidden mb-6">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <span>Scan Receipt</span>
              {/* Daily action limit indicator */}
              {!isTestMode && (
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 flex items-center">
                  <span className="mr-1">Daily actions:</span>
                  {!isConnected ? (
                    <span>0/3</span>
                  ) : transactions && Array.isArray(transactions) ? (
                    <span className={dailyScanLimitReached ? "text-red-500 font-bold" : ""}>
                      {Math.min(
                        transactions.filter(tx => {
                          // Only count receipt_verification and store_addition actions
                          if (tx.type !== 'receipt_verification' && tx.type !== 'store_addition') {
                            return false;
                          }
                          // Check if transaction was created today
                          const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
                          return txDate === new Date().toISOString().split('T')[0];
                        }).length, 
                        maxDailyScans
                      )}/{maxDailyScans}
                    </span>
                  ) : (
                    <span>0/3</span>
                  )}
                </div>
              )}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 flex items-center gap-1">
              Earn <B3trLogo className="w-4 h-4 inline-block" color="#38BDF8" /> tokens for rideshare, EV rentals & sustainable purchases
            </CardDescription>
          </CardHeader>
          
          {/* Camera Area Content */}
          {(() => {
            // Show scan limit reached warning
            if (dailyScanLimitReached && !isTestMode && isConnected) {
              return (
                <div className="bg-red-50 p-4 border-b border-red-100">
                  <div className="flex items-center mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500 mr-2">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3 className="font-bold text-red-700">Daily Action Limit Reached</h3>
                  </div>
                  <p className="text-sm text-red-600">
                    You've used all {maxDailyScans} of your daily actions (receipt scans and store additions combined). 
                    This limit helps maintain the quality and authenticity of our rewards program. 
                    Please come back tomorrow for more actions!
                  </p>
                </div>
              );
            }
            
            // Show test mode UI or camera (only in development)
            if (import.meta.env.DEV && (!isConnected || isTestMode)) {
              return (
                <div className="flex flex-col bg-gray-900 text-white p-6 rounded-md space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Test Receipt Validation</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      You can try our receipt validation without connecting a wallet
                    </p>
                    
                    {/* Custom upload button */}
                    <Button 
                      variant="default" 
                      className="bg-blue-600 hover:bg-blue-700 mb-4"
                      onClick={() => {
                        // Trigger file input click programmatically
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*';
                        fileInput.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // Create a data URL for the file
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              // Then process the file like we would with the camera capture
                              handleCapture(file, dataUrl);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        fileInput.click();
                      }}
                    >
                      Upload Your Own Receipt Image
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Primary Focus - Rideshare */}
                    <div className="bg-gray-800 p-4 rounded-lg border-2 border-green-500">
                      <div className="mb-2 text-center">
                        <div className="text-green-400 text-2xl mb-1">🚗</div>
                        <h4 className="font-bold">Uber Receipt</h4>
                        <p className="text-xs text-green-400">Rideshare Transportation</p>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-green-600 hover:bg-green-700" 
                        onClick={() => {
                          // Create sample receipt text
                          const receiptText = `UBER TECHNOLOGIES
Trip Receipt
--------------------------------
Date: June 3, 2025
From: 123 Main St, SF
To: 456 Market St, SF
Driver: John D.
--------------------------------
UberX Trip            $18.50
Booking Fee            $2.50
--------------------------------
SUBTOTAL:             $21.00
TAX:                  $1.89
TOTAL:                $22.89

Payment: Visa •••• 1234
Trip ID: ABC123456789`;
                          
                          // Create a file object
                          const blob = new Blob([receiptText], { type: 'text/plain' });
                          const file = new File([blob], `sample-receipt-uber.txt`, { type: 'text/plain' });
                          const dataUrl = "data:text/plain;base64," + btoa(receiptText);
                          
                          // Analyze receipt
                          setIsTestMode(true);
                          setTestReceiptType('ride_share');
                          form.setValue("category", "ride_share");
                          handleCapture(file, dataUrl);
                        }}
                      >
                        Uber Receipt
                      </Button>
                    </div>

                    {/* Lyft Rideshare */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="mb-2 text-center">
                        <div className="text-pink-400 text-2xl mb-1">🚕</div>
                        <h4 className="font-bold">Lyft Receipt</h4>
                        <p className="text-xs text-pink-400">Rideshare Transportation</p>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => {
                          // Create sample receipt text
                          const receiptText = `LYFT INC.
Trip Summary
--------------------------------
Date: June 3, 2025
From: Union Square, SF
To: Mission Bay, SF
Driver: Sarah M.
--------------------------------
Lyft Ride             $16.75
Platform Fee          $2.25
--------------------------------
SUBTOTAL:             $19.00
TAX:                  $1.71
TOTAL:                $20.71

Payment: Apple Pay
Trip ID: LFT987654321`;
                          
                          // Create a file object
                          const blob = new Blob([receiptText], { type: 'text/plain' });
                          const file = new File([blob], `sample-receipt-lyft.txt`, { type: 'text/plain' });
                          const dataUrl = "data:text/plain;base64," + btoa(receiptText);
                          
                          // Analyze receipt
                          setIsTestMode(true);
                          setTestReceiptType('ride_share');
                          form.setValue("category", "ride_share");
                          handleCapture(file, dataUrl);
                        }}
                      >
                        Lyft Receipt
                      </Button>
                    </div>

                    {/* Public Transit */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="mb-2 text-center">
                        <div className="text-blue-400 text-2xl mb-1">🚇</div>
                        <h4 className="font-bold">Metro Transit</h4>
                        <p className="text-xs text-blue-400">Public Transportation</p>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => {
                          // Create sample receipt text
                          const receiptText = `SF MUNI TRANSIT
Metro Transit Authority
--------------------------------
Date: June 3, 2025
Route: 38 Geary
From: Powell St Station
To: Ocean Beach
--------------------------------
Single Ride Fare      $3.00
Transfer Fee          $0.00
--------------------------------
SUBTOTAL:             $3.00
TAX:                  $0.00
TOTAL:                $3.00

Payment: Clipper Card
Trip ID: MTA123456789
Thank you for riding!`;
                          
                          // Create a file object
                          const blob = new Blob([receiptText], { type: 'text/plain' });
                          const file = new File([blob], `sample-receipt-transit.txt`, { type: 'text/plain' });
                          const dataUrl = "data:text/plain;base64," + btoa(receiptText);
                          
                          // Analyze receipt
                          setIsTestMode(true);
                          setTestReceiptType('ride_share');
                          form.setValue("category", "public_transit");
                          handleCapture(file, dataUrl);
                        }}
                      >
                        Transit Receipt
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-center mt-6 p-4 bg-gray-800 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      <strong>Transportation Focus:</strong> Upload receipts from Uber, Lyft, Waymo, public transit, or electric vehicle rentals to earn B3TR tokens for sustainable transportation choices.
                    </p>
                  </div>
                </div>
              );
            }
            
            // Show regular camera UI for connected users
            return (
              <div className="bg-gray-100 aspect-square flex items-center justify-center">
                <p className="text-gray-600">Camera functionality available when wallet is connected</p>
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
};
                            fileInput.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                handleCapture(file, URL.createObjectURL(file));
                              }
                            };
                            fileInput.click();
                          }}
                          variant="outline"
                          className="bg-primary/20 border-primary/50 text-white hover:bg-primary/30 hover:border-primary/70"
                        >
                          Upload from Gallery
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Camera or test mode */}
                <CameraCapture 
                  onCapture={handleCapture} 
                  forceTesting={isTestMode}
                  onTestModeChange={(enabled) => {
                    console.log("Test mode changed from parent:", enabled);
                    setIsTestMode(enabled);
                  }}
                />
              </div>
            );
          })()}
          
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Instructions:</h3>
            <ol className="text-sm text-gray-600 list-decimal pl-4 space-y-1">
              <li>Position the receipt within the outlined area</li>
              <li>Make sure the store name and total amount are clearly visible</li>
              <li>Hold steady and tap the capture button</li>
              <li>Verify the receipt information is correct</li>
            </ol>
            
            {/* Only show test mode UI in development */}
            {import.meta.env.DEV && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="text-sm font-medium flex items-center">
                  <span className="text-primary mr-1">ℹ️</span> 
                  {isConnected ? 'Testing Options' : 'Test Mode Enabled'}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {isConnected 
                    ? 'You can still use sample receipts for testing purposes.' 
                    : 'Your wallet is not connected, but you can still test our AI receipt validation.'}
                </p>
                
                {isConnected && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-2 bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                    onClick={() => setIsTestMode(!isTestMode)}
                  >
                    {isTestMode ? 'Back to Camera Mode' : 'Switch to Test Mode'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Analyzing View */}
      {currentStep === ScanStep.ANALYZING && capturedImage && (
        <Card className="overflow-hidden mb-6">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-lg font-semibold">Analyzing Receipt</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Our AI is checking if this is a valid sustainable purchase receipt
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg p-3 mb-4 aspect-[3/4] max-w-sm mx-auto">
                <img 
                  src={capturedImage.dataUrl} 
                  alt="Captured receipt" 
                  className="h-full w-full rounded object-contain"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing receipt...</span>
                  <span>{analyzeReceiptMutation.isPending ? "Processing" : "Complete"}</span>
                </div>
                <Progress value={analyzeReceiptMutation.isPending ? 75 : 100} className="h-2" />
              </div>
              
              <div className="space-y-4">
                {/* Step 1: Scanning */}
                <motion.div 
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0.5, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <motion.div 
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 8H15M8 1V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                  <div>
                    <p className="font-medium text-sm">Scanning Receipt</p>
                    <p className="text-xs text-muted-foreground">Extracting text from image</p>
                  </div>
                  <motion.div 
                    className="ml-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </motion.div>
                
                {/* Step 2: Identifying Store */}
                <motion.div 
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0.4, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
                >
                  <motion.div 
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.1, 1] }}
                    transition={{ duration: 1, delay: 0.5, times: [0, 0.6, 1], repeat: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 12H14V3H2V12ZM8 6H12M8 9H12M4 6H6M4 9H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                  <div>
                    <p className="font-medium text-sm">Identifying Store</p>
                    <p className="text-xs text-muted-foreground">Checking for sustainable store indicators</p>
                  </div>
                  <motion.div 
                    className="ml-auto"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.8, 1.1, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5,
                      repeat: analyzeReceiptMutation.isPending ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  >
                    {analyzeReceiptMutation.isPending ? (
                      <span className="w-2 h-2 bg-primary rounded-full block" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </motion.div>
                </motion.div>
                
                {/* Step 3: Calculating Rewards */}
                <motion.div 
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0.3, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1, ease: "easeOut" }}
                >
                  <motion.div 
                    className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.1, 1] }}
                    transition={{ duration: 1, delay: 1, times: [0, 0.6, 1], repeat: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 4V12M5 8.5L11 8.5M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                  <div>
                    <p className="font-medium text-sm">Calculating Rewards</p>
                    <p className="text-xs text-muted-foreground">Determining token amount based on purchase</p>
                  </div>
                  <motion.div 
                    className="ml-auto"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.8, 1.1, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 1,
                      repeat: analyzeReceiptMutation.isPending ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  >
                    {analyzeReceiptMutation.isPending ? (
                      <span className="w-2 h-2 bg-primary rounded-full block" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Cancel button */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleRetake}
                  disabled={!analyzeReceiptMutation.isPending && !analyzeError}
                >
                  {analyzeReceiptMutation.isPending ? "Cancel" : "Retake Photo"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Form View */}
      {currentStep === ScanStep.FORM && capturedImage && (
        <Card className="overflow-hidden mb-6">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-lg font-semibold">Receipt Details</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Verify the information and submit to earn tokens
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg p-3 mb-4 aspect-[3/4] max-w-sm mx-auto">
                <img 
                  src={capturedImage.dataUrl} 
                  alt="Captured receipt" 
                  className="h-full w-full rounded object-contain"
                />
              </div>
            </div>
            
            <Form {...form}>
              {aiAnalysis && (
                <Alert className={`mb-4 ${aiAnalysis.isAcceptable ? 'bg-green-50 border-green-200' : 
                  (aiAnalysis.storeName?.includes("GameStop") && aiAnalysis.containsPreOwnedItems ? 
                    'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200')}`}>
                  <AlertTitle className="flex items-center">
                    {aiAnalysis.isAcceptable ? (
                      aiAnalysis.storeName?.includes("GameStop") ? (
                        <>
                          <span className="text-blue-600 mr-2">🎮</span> 
                          Valid GameStop Pre-Owned Receipt
                        </>
                      ) : (
                        <>
                          <span className="text-green-600 mr-2">✓</span> 
                          Valid Sustainable Store Receipt
                        </>
                      )
                    ) : (
                      <>
                        {aiAnalysis.storeName?.includes("GameStop") && aiAnalysis.containsPreOwnedItems ? 
                          <span className="text-blue-600 mr-2">🎮</span> :
                          <span className="text-orange-500 mr-2">⚠️</span>
                        }
                        {!aiAnalysis.isThriftStore ? 
                          (aiAnalysis.storeName?.includes("GameStop") && aiAnalysis.containsPreOwnedItems ? 
                            'Pre-Owned Games Receipt' : 
                            'Receipt Validation') : 
                          'Sustainable Store Receipt'}
                      </>
                    )}
                  </AlertTitle>
                  <AlertDescription>
                    {aiAnalysis.isAcceptable ? (
                      <>
                        {aiAnalysis.storeName?.includes("GameStop") ? (
                          <p className="text-sm">This receipt contains pre-owned items from GameStop which qualify for sustainability rewards.</p>
                        ) : (
                          <p className="text-sm">We've detected this is a valid receipt from {aiAnalysis.storeName || "a sustainable store"}. Please confirm the details below.</p>
                        )}
                        {aiAnalysis.storeName && (
                          <p className="text-sm mt-1">
                            <span className="font-semibold">Detected Store:</span> {aiAnalysis.storeName}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-sm">
                        <p className="mb-1">{
                          aiAnalysis.isThriftStore ? 
                            'This is a sustainable store receipt. Please review the details:' : 
                            (aiAnalysis.storeName?.includes("GameStop") && aiAnalysis.containsPreOwnedItems ?
                              'GameStop pre-owned items qualify for sustainability rewards:' :
                              'Please confirm if this is a sustainable purchase:')
                        }</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {aiAnalysis.reasons.slice(0, 2).map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Sustainable Provider</FormLabel>
                      
                      {/* Special handling for GameStop receipts with timeout fallback or detected through other means */}
                      {aiAnalysis && ((aiAnalysis.timeoutFallback && aiAnalysis.storeName?.includes("GameStop")) || 
                         (aiAnalysis.storeName?.includes("GameStop") && aiAnalysis.containsPreOwnedItems)) ? (
                        <div className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-foreground font-medium text-blue-700">GameStop</span>
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                              Pre-owned Items Store
                            </Badge>
                          </div>
                          {/* Hidden select for form validity - force GameStop value */}
                          <input type="hidden" {...field} value="gamestop-pre-owned" />
                        </div>
                      ) : (
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            setSelectedStoreId(parseInt(val));
                            console.log("Store selected:", val);
                          }}
                          value={field.value}
                          defaultValue={selectedStoreId ? selectedStoreId.toString() : field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a sustainable provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableStores.length > 0 ? (
                              <>
                                {/* Transportation Providers */}
                                <SelectItem value="uber">🚗 Uber</SelectItem>
                                <SelectItem value="lyft">🚗 Lyft</SelectItem>
                                <SelectItem value="waymo">🤖 Waymo</SelectItem>
                                <SelectItem value="hertz">🚙 Hertz (Electric/Hybrid)</SelectItem>
                                <SelectItem value="enterprise">🚙 Enterprise (Electric/Hybrid)</SelectItem>
                                <SelectItem value="tesla-rental">⚡ Tesla Rental</SelectItem>
                                <SelectItem value="public-transit">🚌 Public Transit</SelectItem>
                                
                                {/* Separator */}
                                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-t border-b bg-gray-50">Transportation Services</div>
                                
                                {/* Existing Stores */}
                                {availableStores.map((store) => (
                                  <SelectItem key={store.id} value={store.id.toString()}>
                                    {store.name}
                                  </SelectItem>
                                ))}
                                <SelectItem 
                                  value="add-new-store" 
                                  className="border-t mt-1 pt-1 text-primary font-medium"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setLocation('/add-store');
                                  }}
                                >
                                  + Add a new provider
                                </SelectItem>
                              </>
                            ) : (
                              <SelectItem value="loading" disabled>
                                Loading stores...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Purchase Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a purchase category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="re-use item">Re-Use Item</SelectItem>
                          <SelectItem value="ride_share">🚗 Ride Share</SelectItem>
                          <SelectItem value="electric_vehicle">⚡ Electric Vehicle Rental</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Purchase Amount</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <FormControl>
                          <Input 
                            {...field}
                            type="number" 
                            step="0.01"
                            min="0.01"
                            className="pl-7"
                            placeholder="0.00" 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Purchase Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {aiAnalysis && aiAnalysis.isAcceptable && (
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Your Reward</p>
                        <p className="text-xs text-gray-500">For this sustainable purchase</p>
                      </div>
                      <div className="flex items-center text-lg font-bold text-primary">
                        {aiAnalysis.estimatedReward.toFixed(1)} B3TR <B3trLogo className="w-4 h-4 ml-1" color="#38BDF8" />
                      </div>
                    </div>
                  </div>
                )}
                
                {!isConnected && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 mt-2">
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-2">ℹ️</span>
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Connect Wallet to Earn Tokens</p>
                        <p className="text-xs mt-1">You're in test mode. Connect a wallet to earn real B3TR tokens for your sustainable purchases.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitReceiptMutation.isPending}
                  >
                    {submitReceiptMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Receipt'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleRetake}
                  >
                    Take Another Photo
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* Success View */}
      {currentStep === ScanStep.SUCCESS && (
        <Card className="overflow-hidden mb-6">
          <CardHeader className="px-4 py-3 border-b bg-primary/5">
            <CardTitle className="text-lg font-semibold flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              {submittedReceipt?.needsManualReview ? 'Receipt Submitted for Review' : 'Receipt Verified Successfully!'}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {submittedReceipt?.needsManualReview 
                ? 'Your receipt will be reviewed by our team and rewards will be issued after verification'
                : 'Thank you for supporting sustainability'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h3 className="text-lg font-bold mb-1">You've Earned Tokens!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your {(() => {
                  const category = form.getValues("category");
                  switch(category) {
                    case "thrift_clothing":
                      return "thrift clothing";
                    case "used_video_games":
                      return "used video games";
                    case "used_books":
                      return "used books";
                    case "vintage_furniture":
                      return "vintage furniture";
                    case "eco_friendly_products":
                      return "eco-friendly products";
                    default:
                      return "sustainable";
                  }
                })()} purchase has been verified
              </p>
              
              <div className="flex flex-col items-center gap-2">
                {/* Streak bonus banner for multiplier > 1 */}
                {streakMultiplier > 1 && (
                  <div className="w-full max-w-xs mb-2">
                    <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-white p-2 rounded-md text-center shadow-md relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        {[...Array(12)].map((_, i) => (
                          <motion.div 
                            key={i}
                            className="absolute"
                            style={{
                              top: `${Math.random() * 100}%`,
                              left: `${Math.random() * 100}%`
                            }}
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.7, 1, 0.7],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: Math.random() * 2
                            }}
                          >
                            ⭐
                          </motion.div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="font-bold text-lg mr-1">Streak bonus included!</span>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="text-lg"
                        >
                          ✨
                        </motion.div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Reward breakdown card showing base reward and multiplier */}
                <div className="bg-slate-50 rounded-lg p-3 w-full max-w-xs border border-slate-200">
                  <div className="text-sm font-medium text-slate-700 mb-2">Reward Breakdown:</div>
                  
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">Base reward:</span>
                    <div className="flex items-center">
                      <span className="font-medium">{baseReward.toFixed(1)}</span>
                      <B3trLogo className="w-4 h-4 ml-1" color="#38BDF8" />
                    </div>
                  </div>
                  
                  {streakMultiplier > 1 && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600">Streak multiplier:</span>
                      <span className="font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-transparent bg-clip-text">×{streakMultiplier.toFixed(1)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Total reward:</span>
                    <div className="flex items-center">
                      <span className="font-bold text-primary">{rewardAmount.toFixed(1)}</span>
                      <B3trLogo className="w-4 h-4 ml-1" color="#38BDF8" />
                    </div>
                  </div>
                </div>
                
                {/* Main reward indicator */}
                <div className={`${streakMultiplier > 1 ? 'bg-gradient-to-r from-primary/20 to-amber-100' : 'bg-primary/10'} rounded-full px-4 py-2 inline-flex items-center mt-2`}>
                  <span className="font-bold text-xl text-primary">{rewardAmount.toFixed(1)}</span>
                  <B3trLogo className="w-4 h-4 ml-1" color="#38BDF8" />
                  <span className="ml-1 text-sm text-gray-600">tokens added</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-2 text-center">
                <div className="flex flex-col items-center space-y-1">
                  <Badge variant="outline" className="px-4 py-1">
                    <span role="img" aria-label="Earth" className="mr-1">🌎</span> Environmental Impact
                  </Badge>
                  <p className="text-xs text-gray-600">
                    You've helped reduce environmental impact through sustainable choices
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mt-6">
              <Button
                className="w-full"
                onClick={handleReturnToDashboard}
              >
                Return to Dashboard
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCapturedImage(null);
                  setCurrentStep(ScanStep.CAMERA);
                }}
              >
                Scan Another Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanReceipt;