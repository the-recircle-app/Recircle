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
}

export function ProductionReceiptUpload({ 
  userId, 
  walletAddress, 
  onValidationComplete, 
  onUploadStart 
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
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      setUploadProgress(30);

      // Submit to ReCircle production API with Pierre's validation
      const response = await fetch('/api/receipts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          walletAddress,
          image: base64,
          storeHint: 'transportation',
          purchaseDate: new Date().toISOString().split('T')[0],
          amount: 0
        }),
      });

      setUploadProgress(70);

      if (!response.ok) {
        throw new Error('Receipt validation failed');
      }

      const result: ValidationResult = await response.json();
      setUploadProgress(100);

      setValidationResult(result);
      onValidationComplete(result);

      // Show success/failure toast
      if (result.tokenDistributed) {
        toast({
          title: "Success!",
          description: `Earned ${result.actualReward} B3TR tokens for sustainable transportation!`,
        });
      } else {
        toast({
          title: "Receipt Processed",
          description: `Validity score: ${result.aiValidation.validityScore}. ${result.aiValidation.reasoning}`,
          variant: result.isValid ? "default" : "destructive",
        });
      }

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Please try again with a clear receipt image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [userId, walletAddress, onValidationComplete, onUploadStart, toast]);

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