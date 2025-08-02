// Dropzone component following Pierre's exact pattern from x-app-template
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DropzoneProps {
  onUploadSuccess?: (result: any) => void;
  userWalletAddress?: string;
}

export function PierreDropzone({ onUploadSuccess, userWalletAddress }: DropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();

  const processImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Resize image to max 800x600 (following Pierre's pattern)
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 (JPEG format for smaller size)
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        resolve(base64);
      };

      img.onerror = () => reject(new Error('Failed to process image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!userWalletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your VeWorld wallet first",
        variant: "destructive",
      });
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setUploadResult(null);

    try {
      console.log('📸 Processing receipt image...');
      
      // Process image (resize and convert to base64)
      const base64Image = await processImage(file);
      
      // Create submission following Pierre's exact format
      const submission = {
        address: userWalletAddress,
        deviceID: `browser_${Date.now()}`, // Simple device ID for browser
        image: base64Image,
      };

      console.log('📤 Submitting receipt for validation...');

      // Submit to Pierre's endpoint pattern
      const response = await fetch('/api/pierre/submit-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      console.log('✅ Receipt processed:', result);
      setUploadResult(result);

      // Show success/failure toast
      if (result.tokenDistributed) {
        toast({
          title: "🎉 Receipt Approved!",
          description: `${result.rewardAmount} B3TR tokens distributed to your wallet`,
          variant: "default",
        });
      } else {
        toast({
          title: "Receipt Processed",
          description: result.message || "Receipt analyzed but didn't meet criteria for rewards",
          variant: "destructive",
        });
      }

      onUploadSuccess?.(result);

    } catch (error) {
      console.error('❌ Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process receipt",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [userWalletAddress, toast, onUploadSuccess, processImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    disabled: isUploading || !userWalletAddress
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              ${!userWalletAddress ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processing receipt...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop receipt here' : 'Upload receipt'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag & drop or click to select
                  </p>
                </div>
              </div>
            )}
          </div>

          {!userWalletAddress && (
            <p className="text-xs text-orange-600 mt-2 text-center">
              Connect wallet to upload receipts
            </p>
          )}

          {uploadResult && (
            <div className="mt-4 p-3 rounded-lg bg-muted">
              <div className="flex items-center space-x-2">
                {uploadResult.tokenDistributed ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-red-600" />
                )}
                <div className="text-sm">
                  <p className="font-medium">
                    Validity Score: {(uploadResult.validation?.validityFactor * 100)?.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {uploadResult.validation?.reasoning}
                  </p>
                  {uploadResult.tokenDistributed && (
                    <p className="text-green-600 text-xs font-medium">
                      {uploadResult.rewardAmount} B3TR tokens earned!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}