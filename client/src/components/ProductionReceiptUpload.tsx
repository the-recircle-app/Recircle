import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ValidationResult {
  isValid: boolean;
  storeName: string;
  isSustainableStore: boolean;
  confidence: number;
  estimatedReward: number;
  actualReward: number;
  reasons: string[];
  category: string;
  sentForManualReview: boolean;
  tokenDistributed: boolean;
  txHash?: string;
  validationToken?: string; // Token for server-side amount verification
  aiValidation: {
    validityScore: number;
    reasoning: string;
    confidence: number;
  };
}

interface ProductionReceiptUploadProps {
  userId: string;
  walletAddress: string;
  onValidationComplete: (result: ValidationResult) => void;
  onUploadStart?: () => void;
  onError?: (error: string) => void;
}

export function ProductionReceiptUpload({ 
  userId, 
  walletAddress, 
  onValidationComplete, 
  onUploadStart,
  onError 
}: ProductionReceiptUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      // Extract MIME type from file
      const mimeType = file.type || 'image/jpeg';
      console.log('[UPLOAD] File MIME type:', mimeType);
      
      // Convert file to base64 with data URL
      const fullBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          if (!result) {
            reject(new Error('Failed to read file'));
            return;
          }
          console.log('[UPLOAD] File converted to base64 with data URL, size:', result.length, 'chars');
          resolve(result); // Keep full data URL for submission
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      
      // Extract just the base64 part for validation API (it expects raw base64)
      const base64Only = fullBase64.split(',')[1];

      setUploadProgress(30);

      console.log('[UPLOAD] 📤 Sending validation request...');
      console.log('[UPLOAD] Request data:', {
        userId,
        walletAddress,
        imageSize: base64Only.length,
        mimeType,
        hasBase64: !!base64Only
      });

      // First validate the receipt (uses raw base64 without data URL prefix)
      const validationResponse = await fetch('/api/receipts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          walletAddress,
          image: base64Only,
          storeHint: 'transportation',
          purchaseDate: new Date().toISOString().split('T')[0],
          amount: 0
        }),
      });

      setUploadProgress(50);
      console.log('[UPLOAD] 📨 Validation response status:', validationResponse.status);

      if (!validationResponse.ok) {
        // Clone the response so we can try reading it in multiple formats
        const errorResponseClone = validationResponse.clone();
        
        try {
          const errorData = await validationResponse.json();
          console.error('[UPLOAD] ❌ Validation error response:', errorData);
          
          // Handle specific error codes with user-friendly messages
          if (errorData.code === 'DAILY_LIMIT_REACHED') {
            throw new Error(errorData.message || 'You have reached your daily limit of 3 receipts. Please try again tomorrow.');
          } else if (errorData.code === 'DUPLICATE_IMAGE') {
            throw new Error(errorData.message || 'This receipt image has already been submitted. Please upload a different receipt.');
          } else if (errorData.code === 'DATE_TOO_OLD') {
            throw new Error(errorData.message || 'Receipt is too old to be accepted.');
          } else {
            throw new Error(errorData.message || `Validation failed (${validationResponse.status})`);
          }
        } catch (parseError) {
          // If this is an intentional error we threw above, rethrow it unchanged
          if (parseError instanceof Error && parseError.message && 
              !parseError.message.includes('JSON') && 
              !parseError.message.includes('parse')) {
            throw parseError;
          }
          
          // Otherwise, fallback to text parsing for genuine JSON parse failures
          try {
            const errorText = await errorResponseClone.text();
            console.error('[UPLOAD] ❌ Could not parse error response as JSON:', parseError);
            throw new Error(errorText || `Validation failed with status ${validationResponse.status}`);
          } catch (textError) {
            // If we can't read the response at all, show a generic error
            throw new Error(`Validation failed with status ${validationResponse.status}`);
          }
        }
      }

      const validationResult: ValidationResult = await validationResponse.json();
      console.log('[UPLOAD] ✅ Validation result:', validationResult);
      console.log('[UPLOAD] 🔑 Validation token received:', validationResult.validationToken || 'NONE');
      
      // If validation passes and receipt is acceptable, submit it for blockchain distribution
      if (validationResult.isValid && validationResult.estimatedReward > 0) {
        console.log('[UPLOAD] 🚀 Receipt validated successfully - submitting for blockchain distribution...');
        
        // Include the receipt image in submission for storage and manual review
        // Use full data URL (with MIME type) so server knows the actual format
        const submissionResponse = await fetch('/api/receipts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            walletAddress,
            storeId: null, // Let backend determine correct store ID based on store name
            storeName: validationResult.storeName || 'Transportation Service',
            amount: validationResult.estimatedReward || 0,
            purchaseDate: new Date().toISOString().split('T')[0],
            category: validationResult.category || 'ride_share',
            image: fullBase64, // Include full data URL with correct MIME type
            validationToken: validationResult.validationToken, // Include validation token for server-side verification
            isTestMode: true // Enable for blockchain testing
          }),
        });

        setUploadProgress(90);
        console.log('[UPLOAD] 📨 Submission response status:', submissionResponse.status);

        if (!submissionResponse.ok) {
          const errorText = await submissionResponse.text();
          console.error('[UPLOAD] ❌ Submission error response:', errorText);
          // Don't throw error here - validation was successful, submission might have minor issues
          console.warn('[UPLOAD] ⚠️ Proceeding with validation result despite submission issues');
        } else {
          const submissionResult = await submissionResponse.json();
          console.log('[UPLOAD] ✅ Submission result:', submissionResult);
          
          // Update validation result with submission data
          validationResult.tokenDistributed = true;
          validationResult.actualReward = submissionResult.tokenReward || validationResult.estimatedReward;
          if (submissionResult.txHash) {
            validationResult.txHash = submissionResult.txHash;
          }
        }
      } else {
        console.log('[UPLOAD] ⚠️ Receipt validation failed or no reward - skipping blockchain submission');
      }

      setUploadProgress(100);
      setValidationResult(validationResult);
      onValidationComplete(validationResult);

      // Show success/failure toast
      if (validationResult.tokenDistributed) {
        toast({
          title: "Success!",
          description: `Earned ${validationResult.actualReward} B3TR tokens for sustainable transportation!`,
        });
      } else {
        const validityScore = validationResult.aiValidation?.validityScore ?? validationResult.confidence ?? 0;
        const reasoning = validationResult.aiValidation?.reasoning ?? validationResult.reasons?.[0] ?? 'Analysis complete';
        
        toast({
          title: "Receipt Processed",
          description: `Validity score: ${validityScore.toFixed(2)}. ${reasoning}`,
          variant: validationResult.isValid ? "default" : "destructive",
        });
      }

    } catch (error) {
      console.error('[UPLOAD] ❌ Upload failed:', error);
      console.error('[UPLOAD] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error'
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Please try again with a clear receipt image';
      
      // Call the onError callback if provided
      if (onError) {
        onError(errorMessage);
      } else {
        // Fallback to toast if no onError callback
        toast({
          title: "Upload Failed",
          description: `Error: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [userId, walletAddress, onValidationComplete, onUploadStart, onError, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="space-y-4">
      <Card className={`border-2 border-dashed transition-all duration-200 ${
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-300 hover:border-primary/50'
      }`}>
        <CardContent className="p-8">
          <div 
            {...getRootProps()} 
            className="text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              {isUploading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <Upload className="mx-auto h-12 w-12 text-primary animate-pulse" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Analyzing receipt...</p>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Using AI to validate sustainable transportation
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <Upload className="mx-auto h-12 w-12 text-primary" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      Upload Transportation Receipt
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload Uber, Lyft, public transit, or EV rental receipts
                    </p>
                  </div>
                  <Button variant="outline" className="mt-4">
                    <Camera className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {validationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`border-l-4 ${
              validationResult.tokenDistributed 
                ? 'border-l-green-500 bg-green-50' 
                : validationResult.isValid 
                ? 'border-l-yellow-500 bg-yellow-50'
                : 'border-l-red-500 bg-red-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {validationResult.tokenDistributed ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  ) : validationResult.isValid ? (
                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        {validationResult.tokenDistributed 
                          ? 'Tokens Earned!' 
                          : validationResult.isValid
                          ? 'Receipt Valid but Low Score'
                          : 'Receipt Invalid'
                        }
                      </h3>
                      <Badge variant={validationResult.tokenDistributed ? 'default' : 'secondary'}>
                        Score: {validationResult.aiValidation.validityScore}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700">
                      {validationResult.aiValidation.reasoning}
                    </p>
                    
                    {validationResult.tokenDistributed && (
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-medium text-green-700">
                          +{validationResult.actualReward} B3TR tokens
                        </span>
                        {validationResult.txHash && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {validationResult.txHash.slice(0, 10)}...
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}