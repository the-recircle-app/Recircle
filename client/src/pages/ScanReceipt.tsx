import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Camera, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface SubmissionResult {
  success: boolean;
  receiptId?: number;
  reward?: number;
  message: string;
  confidence?: number;
}

const ScanReceipt: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      const response = await fetch('/api/receipts/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          receiptId: data.receiptId,
          reward: data.reward,
          message: data.message,
          confidence: data.confidence
        });
        toast({
          title: "Receipt verified!",
          description: `You earned ${data.reward} B3TR tokens`,
        });
      } else {
        setResult({
          success: false,
          message: data.message || 'Receipt verification failed'
        });
        toast({
          title: "Verification failed",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Upload failed. Please try again.'
      });
      toast({
        title: "Upload error",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Scan Receipt</h1>
          <p className="text-gray-300 text-lg">Upload receipts from sustainable transportation to earn B3TR tokens</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Upload Receipt</CardTitle>
              <CardDescription className="text-gray-300">
                Accepted: Rideshare, Electric Vehicle Rental, Public Transit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-green-500/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">
                  {selectedFile ? selectedFile.name : 'Click to select receipt image'}
                </p>
                <p className="text-gray-500 text-sm">
                  Supports JPG, PNG, PDF (max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Verify Receipt
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Receipt Guidelines</CardTitle>
              <CardDescription className="text-gray-300">
                Tips for successful verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Clear & Complete</p>
                    <p className="text-gray-300 text-sm">Ensure all text is readable and receipt is complete</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Valid Transportation</p>
                    <p className="text-gray-300 text-sm">Uber, Lyft, Tesla rental, Metro cards, bus/train tickets</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Recent Receipts</p>
                    <p className="text-gray-300 text-sm">Receipts from the last 30 days are preferred</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Camera className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">Photo Tips</span>
                </div>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Good lighting, avoid shadows</li>
                  <li>• Straight angle, not tilted</li>
                  <li>• Full receipt visible in frame</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {result && (
          <Card className={`mt-8 border ${result.success ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/20'}`}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                {result.success ? (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-400" />
                )}
                <CardTitle className={result.success ? 'text-green-400' : 'text-red-400'}>
                  {result.success ? 'Receipt Verified!' : 'Verification Failed'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{result.message}</p>
              {result.success && result.reward && (
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                  <span className="text-white">B3TR Tokens Earned:</span>
                  <span className="text-green-400 font-bold text-xl">{result.reward} B3TR</span>
                </div>
              )}
              {result.confidence && (
                <div className="mt-4">
                  <p className="text-gray-400 text-sm">Confidence Score: {Math.round(result.confidence * 100)}%</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScanReceipt;