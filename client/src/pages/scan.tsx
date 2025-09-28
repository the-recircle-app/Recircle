import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useSmartNavigation } from "../utils/navigation";
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
  SUCCESS = "success",
  ERROR = "error"
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
  const { goHome } = useSmartNavigation();
  const { userId, isConnected, refreshTokenBalance, tokenBalance } = useWallet();
  const { toast } = useToast();

  // State management
  const [currentStep, setCurrentStep] = useState<ScanStep>(ScanStep.CAMERA);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [useProductionUpload, setUseProductionUpload] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<ReceiptAnalysisResult | null>(null);
  const [submittedReceipt, setSubmittedReceipt] = useState<any>(null);
  const [rewardAmount, setRewardAmount] = useState<number>(8);
  const [baseReward, setBaseReward] = useState<number>(8);
  const [streakMultiplier, setStreakMultiplier] = useState<number>(1);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form for editing receipt details
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      storeId: "",
      category: "",
      amount: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
    },
  });

  // Handle return to dashboard
  const handleReturnToDashboard = () => {
    goHome();
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
                onClick={goHome}
                className="mr-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Scan Transportation Receipt</h1>
            </div>
            <p className="text-gray-600">
              Upload rideshare, EV rentals & sustainable purchases to earn B3TR tokens
            </p>
          </div>

          {/* Upload Step */}
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
                    setErrorMessage(""); // Clear any previous errors
                  }}
                  onError={(error) => {
                    console.log("[SCAN] Upload error:", error);
                    setErrorMessage(error);
                    setCurrentStep(ScanStep.ERROR);
                  }}
                />
              ) : (
                <Card className="overflow-hidden mb-6">
                  <CardHeader className="px-4 py-3 border-b">
                    <CardTitle className="text-lg font-semibold">Connect Wallet Required</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Connect your wallet to earn B3TR tokens for sustainable transportation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <div className="text-gray-500 text-lg">
                        Connect your wallet to start earning B3TR rewards
                      </div>
                      <Button
                        onClick={goHome}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Analyzing Step */}
          {currentStep === ScanStep.ANALYZING && (
            <Card className="overflow-hidden mb-6">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-lg font-semibold">Analyzing Receipt</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  AI is validating your receipt for sustainable transportation rewards...
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing receipt with OpenAI Vision API...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Checking validity score and calculating B3TR rewards
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Step */}
          {currentStep === ScanStep.ERROR && (
            <Card className="overflow-hidden mb-6">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-lg font-semibold text-red-700">Receipt Processing Failed</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Please check the error below and try again
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <div className="text-red-600 text-6xl mb-4">✗</div>
                  <h3 className="text-xl font-bold text-red-700 mb-2">
                    Upload Failed
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {errorMessage}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setCurrentStep(ScanStep.CAMERA);
                        setErrorMessage("");
                      }}
                      className="flex-1"
                    >
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReturnToDashboard}
                      className="flex-1"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Step */}
          {currentStep === ScanStep.SUCCESS && (
            <Card className="overflow-hidden mb-6">
              <CardHeader className="px-4 py-3 border-b">
                <CardTitle className="text-lg font-semibold text-green-700">Receipt Processed Successfully!</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Your sustainable transportation choice has been rewarded
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <div className="text-green-600 text-6xl mb-4">✓</div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">
                    Earned {rewardAmount} B3TR Tokens!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for choosing sustainable transportation
                  </p>
                  
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Streak Celebration */}
          {showStreakCelebration && (
            <StreakCelebration
              streakCount={streakCount}
              isVisible={showStreakCelebration}
              onComplete={() => {
                setShowStreakCelebration(false);
                setCurrentStep(ScanStep.SUCCESS);
              }}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default ScanReceipt;