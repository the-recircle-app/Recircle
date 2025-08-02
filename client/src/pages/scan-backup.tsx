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
import { ProductionReceiptUpload } from "../components/ProductionReceiptUpload";
import type { ThriftStore } from "../types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import StreakCelebration from "../components/StreakCelebration";
import { featureFlags } from "../lib/environment";

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

  // State management
  const [currentStep, setCurrentStep] = useState<ScanStep>(ScanStep.CAMERA);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [useProductionUpload, setUseProductionUpload] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<ReceiptAnalysisResult | null>(null);
  const [submittedReceipt, setSubmittedReceipt] = useState<any>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [isTestMode, setIsTestMode] = useState(false);
  const [testReceiptType, setTestReceiptType] = useState<TestReceiptType | null>(null);
  const [rewardAmount, setRewardAmount] = useState(8);
  const [baseReward, setBaseReward] = useState(8);
  const [streakMultiplier, setStreakMultiplier] = useState(1);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  // Form setup
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      storeId: "",
      category: "",
      amount: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch available transportation services
  const { data: availableStores = [] } = useQuery({
    queryKey: ['/api/transportation-services'],
  });

  // Fetch user data for streak calculation
  const { data: userData } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId,
  });

  const currentStreak = (userData as any)?.streak || 0;

  // Receipt analysis mutation
  const analyzeReceiptMutation = useMutation({
    mutationFn: async (file: File) => {
      // Convert file to base64 for the API
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const requestData = {
        image: base64Image,
        imageName: file.name,
        userId: userId,
        testMode: !!testReceiptType,
        ...(testReceiptType && { testType: testReceiptType })
      };
      
      const response = await fetch('/api/receipts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error(`Receipt analysis failed: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      setCurrentStep(ScanStep.FORM);
      
      // Auto-populate form with AI analysis results
      if (data.storeName) {
        const matchingStore = (availableStores as any[])?.find((store: any) => 
          store.name.toLowerCase().includes(data.storeName.toLowerCase())
        );
        if (matchingStore) {
          form.setValue("storeId", matchingStore.id.toString());
          setSelectedStoreId(matchingStore.id.toString());
        }
      }
      
      if (data.totalAmount) {
        form.setValue("amount", parseFloat(data.totalAmount));
      }
      
      if (data.purchaseDate) {
        form.setValue("purchaseDate", data.purchaseDate);
      }
      
      // Auto-detect transportation category
      if (data.category) {
        form.setValue("category", data.category);
      }
    },
    onError: (error) => {
      console.error('Receipt analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze receipt. Please try again.",
        variant: "destructive",
      });
      setCurrentStep(ScanStep.CAMERA);
    },
  });

  // Receipt submission mutation
  const submitReceiptMutation = useMutation({
    mutationFn: async (data: ReceiptFormValues & { image: string; aiAnalysis?: ReceiptAnalysisResult; userId?: number }) => {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Receipt submission failed: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: async (data) => {
      setSubmittedReceipt(data);
      
      const finalReward = data.tokenReward || 8;
      setRewardAmount(finalReward);
      
      // Extract and store the base reward and streak multiplier if available
      if (data.rewardDetails) {
        setBaseReward(data.rewardDetails.baseReward || finalReward);
        setStreakMultiplier(data.rewardDetails.streakMultiplier || 1);
      } else {
        setBaseReward(8);
        setStreakMultiplier(finalReward / 8);
      }
      
      // Refresh token balance to ensure UI displays the latest token amount
      if (refreshTokenBalance) {
        console.log("Refreshing token balance after receipt submission");
        await refreshTokenBalance();
      }
      
      // Check if the streak was updated
      if (data.streakInfo && data.streakInfo.streakIncreased) {
        // Show streak celebration for streak milestones (3, 5, 7, 10, 14, 21, 30 days)
        const streakMilestones = [3, 5, 7, 10, 14, 21, 30];
        const currentStreak = data.streakInfo.currentStreak;
        
        if (streakMilestones.includes(currentStreak)) {
          setStreakCount(currentStreak);
          setShowStreakCelebration(true);
          // Delay showing the success screen until after the celebration
          setTimeout(() => {
            setCurrentStep(ScanStep.SUCCESS);
          }, 7000);
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
      
      // Check for first receipt achievement and trigger notifications
      if (userId) {
        try {
          // Check current receipts count after submission
          const receiptsResponse = await fetch(`/api/users/${userId}/receipts`);
          const receipts = await receiptsResponse.json();
          
          console.log("Current user receipts:", receipts);
          
          // Check if this is the first receipt AND if there are no first_receipt achievements already
          const recentTransactions = await fetch(`/api/users/${userId}/transactions`);
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
            
            // Refresh token balance again to include achievement bonus
            if (refreshTokenBalance) {
              console.log("Refreshing token balance after achievement completion");
              await refreshTokenBalance();
            }
          }
          
          // Force refresh achievements data
          queryClient.invalidateQueries({ 
            queryKey: [`/api/users/${userId}/achievements`] 
          });
          
          // Safely trigger achievement notification for first receipt
          if (receipts.length === 1) {
            // Use a timeout to ensure all state updates are complete
            setTimeout(() => {
              // Dispatch a custom event to trigger achievement notification
              const achievementEvent = new CustomEvent('triggerAchievement', {
                detail: { type: 'first_receipt' }
              });
              window.dispatchEvent(achievementEvent);
            }, 1000);
          }
        } catch (error) {
          console.error("Error checking for achievements:", error);
        }
      }
      
      // Check if the receipt needs manual review
      if (data.needsManualReview) {
        toast({
          title: "Receipt Submitted for Review",
          description: "Your receipt has been sent for manual review. Rewards will be issued after verification.",
          duration: 8000,
          variant: "secondary"
        });
      } else {
        toast({
          title: "Receipt Submitted!",
          description: "Congratulations! You've earned B3TR tokens for sustainable transportation.",
        });
      }
    },
    onError: (error) => {
      console.error('Receipt submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "Could not submit receipt. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle image capture
  const handleCapture = (file: File, dataUrl: string) => {
    setCapturedImage(dataUrl);
    setCurrentStep(ScanStep.ANALYZING);
    analyzeReceiptMutation.mutate(file);
  };

  // Handle form submission
  const onSubmit = (data: ReceiptFormValues) => {
    if (!capturedImage) {
      toast({
        title: "Error",
        description: "No image captured",
        variant: "destructive",
      });
      return;
    }

    submitReceiptMutation.mutate({
      ...data,
      userId: userId || 102, // Add userId which is required by backend
      image: capturedImage,
      aiAnalysis: aiAnalysis || undefined,
    } as any);
  };

  // Handle retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setAiAnalysis(null);
    setCurrentStep(ScanStep.CAMERA);
    form.reset();
  };

  // Handle return to dashboard
  const handleReturnToDashboard = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          
          {/* Page Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Button
                variant="default"
                onClick={() => setLocation('/')}
                className="mr-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Scan Transportation Receipt</h1>
            </div>
            <p className="text-gray-600">
              Upload rideshare, electric rentals & sustainable purchases to earn B3TR tokens
            </p>
          </div>

          {/* Camera Step */}
          {currentStep === ScanStep.CAMERA && (
            <div>
              {/* Toggle between Production and Legacy Upload */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-1 rounded-lg border">
                  <Button
                    variant={useProductionUpload ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setUseProductionUpload(true)}
                  >
                    Smart Upload
                  </Button>
                  <Button
                    variant={!useProductionUpload ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setUseProductionUpload(false)}
                  >
                    Legacy Mode
                  </Button>
                </div>
              </div>

              {useProductionUpload && isConnected ? (
                <ProductionReceiptUpload
                  userId={userId?.toString() || "102"}
                  walletAddress={userId?.toString() || "0x7567d83b7b8d80addcb281a71d54fc7b3364ffed"}
                  onValidationComplete={(result) => {
                    console.log("[SCAN] Production validation complete:", result);
                    if (result.tokenDistributed) {
                      setCurrentStep(ScanStep.SUCCESS);
                      setRewardAmount(result.actualReward);
                    }
                    // Refresh token balance
                    if (refreshTokenBalance) {
                      refreshTokenBalance();
                    }
                  }}
                  onUploadStart={() => {
                    setCurrentStep(ScanStep.ANALYZING);
                  }}
                />
              ) : (
                <Card className="overflow-hidden mb-6">
                  <CardHeader className="px-4 py-3 border-b">
                    <CardTitle className="text-lg font-semibold">Capture Your Receipt</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Take a photo or upload from gallery - rideshare, transit, and electric vehicle receipts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {!isConnected ? (
                      <div className="bg-gray-900 text-white p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                      <p className="text-gray-300 text-sm mb-6">
                        Connect your wallet to scan receipts and earn B3TR rewards for sustainable transportation
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Uber Example */}
                        <div className="bg-gray-800 p-4 rounded-lg border-2 border-green-600">
                          <div className="mb-2 text-center">
                            <div className="text-green-400 text-2xl mb-1">🚗</div>
                            <h4 className="font-bold text-green-400">Uber Ride</h4>
                            <p className="text-xs text-gray-400">Sustainable Transportation</p>
                          </div>
                          <Button 
                            className="w-full mt-4 text-white bg-green-600 hover:bg-green-500" 
                            onClick={() => {
                              const timestamp = new Date().toISOString();
                              const randomSuffix = Math.floor(Math.random() * 1000);
                              
                              const receiptText = `UBER RECEIPT
Trip completed
--------------------------------
From: Downtown Office
To: Airport Terminal 1
Distance: 12.3 miles
Duration: 28 minutes
--------------------------------
Base Fare:              $3.50
Distance (12.3mi):      $18.45
Time (28min):            $5.60
Service Fee:             $2.75
--------------------------------
SUBTOTAL:               $30.30
Tax:                     $2.42
TOTAL:                  $32.72

SUSTAINABLE TRANSPORTATION
${timestamp}
Trip #${randomSuffix}
REDUCING EMISSIONS TOGETHER!`;
                              
                              const blob = new Blob([receiptText], { type: 'text/plain' });
                              const file = new File([blob], `uber-receipt-${randomSuffix}.txt`, { type: 'text/plain' });
                              const dataUrl = "data:text/plain;base64," + btoa(receiptText);
                              
                              setIsTestMode(true);
                              setTestReceiptType('ride_share');
                              form.setValue("category", "ride_share");
                              handleCapture(file, dataUrl);
                            }}
                          >
                            Uber Receipt
                          </Button>
                        </div>
                        
                        {/* Electric Vehicle Rental */}
                        <div className="bg-gray-800 p-4 rounded-lg border-2 border-blue-600">
                          <div className="mb-2 text-center">
                            <div className="text-blue-400 text-2xl mb-1">⚡</div>
                            <h4 className="font-bold text-blue-400">Tesla Rental</h4>
                            <p className="text-xs text-gray-400">Electric Vehicle Rental</p>
                          </div>
                          <Button 
                            className="w-full mt-4 text-white bg-blue-600 hover:bg-blue-500" 
                            onClick={() => {
                              const timestamp = new Date().toISOString();
                              const randomSuffix = Math.floor(Math.random() * 1000);
                              
                              const receiptText = `TESLA RENTAL RECEIPT
EV Car Share
--------------------------------
Vehicle: Tesla Model 3
Duration: 4 hours 15 minutes
Miles Driven: 87.2 miles
--------------------------------
Hourly Rate (4.25h):    $42.50
Mileage (87.2mi):       $26.16
Insurance:               $8.00
Service Fee:             $3.25
--------------------------------
SUBTOTAL:               $79.91
Tax:                     $6.39
TOTAL:                  $86.30

100% ELECTRIC - ZERO EMISSIONS
${timestamp}
Rental #${randomSuffix}
DRIVING THE FUTURE!`;
                              
                              const blob = new Blob([receiptText], { type: 'text/plain' });
                              const file = new File([blob], `tesla-rental-${randomSuffix}.txt`, { type: 'text/plain' });
                              const dataUrl = "data:text/plain;base64," + btoa(receiptText);
                              
                              setIsTestMode(true);
                              setTestReceiptType('electric_vehicle');
                              form.setValue("category", "electric_vehicle");
                              handleCapture(file, dataUrl);
                            }}
                          >
                            Tesla Rental
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-center mt-6 p-4 bg-gray-800 rounded-lg">
                        <p className="text-gray-300 text-sm">
                          <strong>Transportation Focus:</strong> Upload receipts from Uber, Lyft, Waymo, public transit, or electric vehicle rentals to earn B3TR tokens for sustainable transportation choices.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Development Test Mode Toggle - Only visible in dev environment */}
                    {import.meta.env.DEV && (
                      <div className="absolute top-4 right-4 z-10">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-400"
                          onClick={() => setIsTestMode(!isTestMode)}
                        >
                          {isTestMode ? "Hide Test" : "Test Mode"}
                        </Button>
                      </div>
                    )}
                    
                    {/* Test Mode Sample Receipts - Development Only */}
                    {import.meta.env.DEV && isTestMode ? (
                      <div className="bg-gray-900 text-white p-8 text-center">
                        <div className="max-w-md mx-auto">
                          <h3 className="text-xl font-bold mb-2 text-yellow-400">DEV TEST MODE</h3>
                          <p className="text-gray-300 text-sm mb-6">
                            Sample transportation receipts for testing
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            {/* Uber Test Receipt */}
                            <div className="bg-gray-800 p-4 rounded-lg border-2 border-green-600">
                              <div className="mb-2 text-center">
                                <div className="text-green-400 text-2xl mb-1">🚗</div>
                                <h4 className="font-bold text-green-400">Test Uber</h4>
                                <p className="text-xs text-gray-400">Sample Receipt</p>
                              </div>
                              <Button 
                                className="w-full mt-4 text-white bg-green-600 hover:bg-green-500" 
                                onClick={() => {
                                  const timestamp = new Date().toISOString();
                                  const randomSuffix = Math.floor(Math.random() * 10000);
                                  const uniqueAmount = (32.72 + (randomSuffix / 1000)).toFixed(2);
                                  
                                  const receiptText = `UBER RECEIPT
Trip completed
--------------------------------
From: Downtown Office
To: Airport Terminal 1
Distance: 12.3 miles
Duration: 28 minutes
--------------------------------
Base Fare:              $3.50
Distance (12.3mi):      $18.45
Time (28min):            $5.60
Service Fee:             $2.75
--------------------------------
SUBTOTAL:               $30.30
Tax:                     $2.42
TOTAL:                  $${uniqueAmount}

SUSTAINABLE TRANSPORTATION
${timestamp}
Trip #${randomSuffix}
REDUCING EMISSIONS TOGETHER!`;
                                  
                                  const blob = new Blob([receiptText], { type: 'text/plain' });
                                  const file = new File([blob], `uber-receipt-${randomSuffix}.txt`, { type: 'text/plain' });
                                  const dataUrl = "data:text/plain;base64," + btoa(receiptText);
                                  
                                  setTestReceiptType('ride_share');
                                  form.setValue("category", "ride_share");
                                  handleCapture(file, dataUrl);
                                }}
                              >
                                Test Uber Receipt
                              </Button>
                            </div>
                            
                            {/* Tesla Test Receipt */}
                            <div className="bg-gray-800 p-4 rounded-lg border-2 border-blue-600">
                              <div className="mb-2 text-center">
                                <div className="text-blue-400 text-2xl mb-1">⚡</div>
                                <h4 className="font-bold text-blue-400">Test Tesla</h4>
                                <p className="text-xs text-gray-400">Sample Receipt</p>
                              </div>
                              <Button 
                                className="w-full mt-4 text-white bg-blue-600 hover:bg-blue-500" 
                                onClick={() => {
                                  const timestamp = new Date().toISOString();
                                  const randomSuffix = Math.floor(Math.random() * 10000);
                                  const uniqueAmount = (86.30 + (randomSuffix / 1000)).toFixed(2);
                                  
                                  const receiptText = `TESLA RENTAL RECEIPT
EV Car Share
--------------------------------
Vehicle: Tesla Model 3
Duration: 4 hours 15 minutes
Miles Driven: 87.2 miles
--------------------------------
Hourly Rate (4.25h):    $42.50
Mileage (87.2mi):       $26.16
Insurance:               $8.00
Service Fee:             $3.25
--------------------------------
SUBTOTAL:               $79.91
Tax:                     $6.39
TOTAL:                  $${uniqueAmount}

100% ELECTRIC - ZERO EMISSIONS
${timestamp}
Rental #${randomSuffix}
DRIVING THE FUTURE!`;
                                  
                                  const blob = new Blob([receiptText], { type: 'text/plain' });
                                  const file = new File([blob], `tesla-rental-${randomSuffix}.txt`, { type: 'text/plain' });
                                  const dataUrl = "data:text/plain;base64," + btoa(receiptText);
                                  
                                  setTestReceiptType('electric_vehicle');
                                  form.setValue("category", "electric_vehicle");
                                  handleCapture(file, dataUrl);
                                }}
                              >
                                Test Tesla Receipt
                              </Button>
                            </div>
                            
                            {/* Public Transit Test Receipt */}
                            <div className="bg-gray-800 p-4 rounded-lg border-2 border-purple-600">
                              <div className="mb-2 text-center">
                                <div className="text-purple-400 text-2xl mb-1">🚌</div>
                                <h4 className="font-bold text-purple-400">Test Transit</h4>
                                <p className="text-xs text-gray-400">Manual Review</p>
                              </div>
                              <Button 
                                className="w-full mt-4 text-white bg-purple-600 hover:bg-purple-500" 
                                onClick={() => {
                                  const timestamp = new Date().toISOString();
                                  const randomSuffix = Math.floor(Math.random() * 1000);
                                  
                                  const receiptText = `METRO TRANSIT RECEIPT
Public Transportation
--------------------------------
From: Union Station
To: Downtown Central
Route: Red Line Metro
--------------------------------
Adult Fare:                 $3.25
Transfer Fee:               $0.50
--------------------------------
TOTAL:                      $3.75

Payment: Contactless Card
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Transaction ID: ${randomSuffix}

Sustainable Transportation Choice!`;
                                  
                                  const blob = new Blob([receiptText], { type: 'text/plain' });
                                  const file = new File([blob], `transit-${randomSuffix}.txt`, { type: 'text/plain' });
                                  const dataUrl = "data:text/plain;base64," + btoa(receiptText);
                                  
                                  setTestReceiptType('public_transit');
                                  form.setValue("category", "public_transit");
                                  handleCapture(file, dataUrl);
                                }}
                              >
                                Test Transit Receipt
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-center mt-6 p-4 bg-gray-800 rounded-lg">
                            <p className="text-gray-300 text-sm">
                              <strong>DEV ONLY:</strong> These test receipts are only visible in development mode.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 relative">
                        {/* Upload Instructions */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">
                                <strong>Digital Receipt Upload:</strong> For rideshare receipts (Uber, Lyft), tap "Upload Receipt" below to select your receipt image.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="aspect-square flex items-center justify-center relative bg-gray-100">
                          {/* Always show upload buttons for transportation receipts */}
                          <div className="w-full h-full flex flex-col items-center justify-center p-6">
                            <div className="text-center mb-6">
                              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                Upload Your Transportation Receipt
                              </h3>
                              <p className="text-sm text-gray-500">
                                Upload rideshare, transit, or electric vehicle receipts
                              </p>
                            </div>
                            
                            <div className="flex flex-col space-y-3 w-full max-w-xs">
                              <Button
                                onClick={() => {
                                  if (!isConnected) {
                                    // Redirect to home page to connect wallet
                                    setLocation("/");
                                    return;
                                  }
                                  const fileInput = document.createElement('input');
                                  fileInput.type = 'file';
                                  fileInput.accept = 'image/*';
                                  fileInput.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      handleCapture(file, URL.createObjectURL(file));
                                    }
                                  };
                                  fileInput.click();
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                📱 Upload Receipt
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Camera Interface Step */}
          {currentStep === ScanStep.CAMERA && isConnected && !useProductionUpload && (
            <Card className="overflow-hidden mb-6">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-lg font-semibold">Camera Capture</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Take a photo of your transportation receipt
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CameraCapture 
                  onCapture={handleCapture}
                  forceTesting={false}
                  onTestModeChange={(isTest) => setIsTestMode(isTest)}
                />
              </CardContent>
            </Card>
          )}

          {/* Analyzing Step */}
          {currentStep === ScanStep.ANALYZING && capturedImage && (
            <Card className="overflow-hidden mb-6">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-lg font-semibold">Analyzing Receipt</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Our AI is reading your receipt...
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing receipt image...</p>
                  
                  {/* Show image preview */}
                  {capturedImage && (
                    <div className="mt-4">
                      <img 
                        src={capturedImage} 
                        alt="Captured receipt" 
                        className="max-w-full h-40 object-contain mx-auto rounded border"
                      />
                    </div>
                  )}
                  
                  {/* Error handling */}
                  {analyzeReceiptMutation.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 text-sm">
                        Error analyzing receipt: {(analyzeReceiptMutation.error as Error).message}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={handleRetake}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Step */}
          {currentStep === ScanStep.FORM && capturedImage && (
            <Card className="overflow-hidden mb-6">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-lg font-semibold">Receipt Details</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Review and confirm the details from your receipt
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {/* Receipt Preview */}
                <div className="mb-4">
                  <img 
                    src={capturedImage} 
                    alt="Receipt preview" 
                    className="w-full max-w-xs mx-auto h-40 object-contain rounded border"
                  />
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* AI Analysis Results */}
                    {aiAnalysis && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-medium text-blue-900 mb-2">AI Analysis Results:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {aiAnalysis.storeName && <li>Store: {aiAnalysis.storeName}</li>}
                          {aiAnalysis.totalAmount && <li>Amount: ${aiAnalysis.totalAmount}</li>}
                          {aiAnalysis.purchaseDate && <li>Date: {aiAnalysis.purchaseDate}</li>}
                          {aiAnalysis.confidence && <li>Confidence: {Math.round(aiAnalysis.confidence * 100)}%</li>}
                        </ul>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="storeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transportation Service</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedStoreId(value);
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={selectedStoreId ? 
                                  (availableStores as any[])?.find((s: any) => s.id.toString() === selectedStoreId)?.name : 
                                  "Select a transportation service"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(availableStores as any[])?.map((store: any) => (
                                <SelectItem key={store.id} value={store.id.toString()}>
                                  {store.name}
                                </SelectItem>
                              ))}
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
                          <FormLabel>Amount Spent ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transportation Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ride_share">Rideshare (Uber, Lyft)</SelectItem>
                              <SelectItem value="electric_vehicle">Electric Vehicle Rental</SelectItem>
                              <SelectItem value="public_transit">Public Transit</SelectItem>
                              <SelectItem value="scooter_bike">Electric Scooter/Bike</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRetake}
                        className="flex-1"
                      >
                        Retake Photo
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isConnected || submitReceiptMutation.isPending}
                        className="flex-1"
                      >
                        {submitReceiptMutation.isPending ? "Submitting..." : "Submit Receipt"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Success Step */}
          {currentStep === ScanStep.SUCCESS && (
            <Card className="overflow-hidden mb-6">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Receipt Submitted!</h3>
                  {submittedReceipt && (
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <p className="text-green-800 text-sm mb-2">
                        <strong>Receipt ID:</strong> {submittedReceipt.id}
                      </p>
                      {submittedReceipt.needsManualReview ? (
                        <p className="text-green-700 text-sm">
                          Your receipt has been submitted for manual review. You'll receive rewards once approved.
                        </p>
                      ) : (
                        <div className="text-green-700 text-sm">
                          <p className="mb-2">Your receipt has been verified and processed!</p>
                          
                          {/* Dynamic reward calculation display */}
                          {(() => {
                            const category = form.getValues().category;
                            const amount = form.getValues().amount || 0;
                            
                            // Calculate base reward based on category
                            let baseReward = 0;
                            if (category === 'ride_share') {
                              baseReward = Math.min(Math.max(Math.floor(amount * 0.3), 3), 8);
                            } else if (category === 'electric_vehicle') {
                              baseReward = Math.min(Math.max(Math.floor(amount * 0.25), 4), 8);
                            } else if (category === 'public_transit') {
                              baseReward = Math.min(Math.max(Math.floor(amount * 0.4), 2), 5);
                            } else {
                              baseReward = Math.min(Math.max(Math.floor(amount * 0.2), 1), 5);
                            }
                            
                            // Apply streak multiplier
                            const streakMultiplier = currentStreak >= 7 ? 1.5 : 
                                                   currentStreak >= 3 ? 1.2 : 1.0;
                            
                            // Transportation bonus (20% extra for sustainable transport)
                            const isTransportation = ['ride_share', 'electric_vehicle', 'public_transit', 'scooter_bike'].includes(category);
                            const transportBonus = isTransportation ? 1.2 : 1.0;
                            
                            const rewardAmount = Math.floor(baseReward * streakMultiplier * transportBonus);
                            
                            return (
                              <div className="space-y-1">
                                <p><strong>Base Reward:</strong> {baseReward} B3TR</p>
                                {streakMultiplier > 1.0 && (
                                  <p><strong>Streak Bonus:</strong> {Math.round((streakMultiplier - 1) * 100)}% ({currentStreak} day streak)</p>
                                )}
                                {isTransportation && (
                                  <p><strong>Transportation Bonus:</strong> 20% (sustainable transport)</p>
                                )}
                                <p className="font-bold"><strong>Total Earned:</strong> {rewardAmount} B3TR</p>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCapturedImage(null);
                      setCurrentStep(ScanStep.CAMERA);
                    }}
                    className="flex-1"
                  >
                    Scan Another
                  </Button>
                  <Button
                    onClick={handleReturnToDashboard}
                    className="flex-1"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default ScanReceipt;