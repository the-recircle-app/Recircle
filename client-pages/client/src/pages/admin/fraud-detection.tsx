import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface PendingReceipt {
  id: number;
  userId: number;
  amount: number;
  purchaseDate: string;
  category: string;
  needsManualReview: boolean;
  hasImage: boolean;
  fraudFlags: string[];
  imageUrl: string | null;
  createdAt: string;
}

interface ReceiptImage {
  id: number;
  receiptId: number;
  imageData: string;
  fraudFlags: string[];
  fileSize: number;
  uploadedAt: string;
  reviewedAt: string | null;
  reviewedBy: number | null;
}

export default function FraudDetection() {
  const [selectedReceipt, setSelectedReceipt] = useState<PendingReceipt | null>(null);
  const [selectedImage, setSelectedImage] = useState<ReceiptImage | null>(null);

  // Fetch pending receipts for review
  const { data: pendingReceipts, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/receipts/pending-review'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch receipt image when a receipt is selected
  const { data: receiptImageData } = useQuery({
    queryKey: ['/api/receipts', selectedReceipt?.id, 'image'],
    enabled: !!selectedReceipt?.hasImage,
    retry: false
  });

  useEffect(() => {
    if (receiptImageData?.success && receiptImageData.image) {
      setSelectedImage(receiptImageData.image);
    }
  }, [receiptImageData]);

  const getFraudRiskLevel = (fraudFlags: string[]) => {
    if (fraudFlags.includes('duplicate_image') || fraudFlags.includes('editing_software_detected')) {
      return 'high';
    }
    if (fraudFlags.length >= 2) {
      return 'medium';
    }
    if (fraudFlags.length >= 1) {
      return 'low';
    }
    return 'none';
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const viewReceiptImage = (receipt: PendingReceipt) => {
    setSelectedReceipt(receipt);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Fraud Detection & Manual Review</h1>
        <div className="text-center py-8">Loading pending receipts...</div>
      </div>
    );
  }

  const receipts = pendingReceipts?.receipts || [];
  const highRiskReceipts = receipts.filter((r: PendingReceipt) => getFraudRiskLevel(r.fraudFlags) === 'high');
  const mediumRiskReceipts = receipts.filter((r: PendingReceipt) => getFraudRiskLevel(r.fraudFlags) === 'medium');
  const lowRiskReceipts = receipts.filter((r: PendingReceipt) => getFraudRiskLevel(r.fraudFlags) === 'low');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fraud Detection & Manual Review</h1>
        <Button onClick={() => refetch()} variant="outline">
          Refresh
        </Button>
      </div>

      {receipts.length === 0 ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            No receipts pending manual review. All submissions are clear.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Receipt List Panel */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="high" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="high" className="text-xs">
                  High Risk ({highRiskReceipts.length})
                </TabsTrigger>
                <TabsTrigger value="medium" className="text-xs">
                  Medium ({mediumRiskReceipts.length})
                </TabsTrigger>
                <TabsTrigger value="low" className="text-xs">
                  Low ({lowRiskReceipts.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="high" className="space-y-3">
                {highRiskReceipts.map((receipt: PendingReceipt) => (
                  <ReceiptCard 
                    key={receipt.id} 
                    receipt={receipt} 
                    onView={() => viewReceiptImage(receipt)}
                    isSelected={selectedReceipt?.id === receipt.id}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="medium" className="space-y-3">
                {mediumRiskReceipts.map((receipt: PendingReceipt) => (
                  <ReceiptCard 
                    key={receipt.id} 
                    receipt={receipt} 
                    onView={() => viewReceiptImage(receipt)}
                    isSelected={selectedReceipt?.id === receipt.id}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="low" className="space-y-3">
                {lowRiskReceipts.map((receipt: PendingReceipt) => (
                  <ReceiptCard 
                    key={receipt.id} 
                    receipt={receipt} 
                    onView={() => viewReceiptImage(receipt)}
                    isSelected={selectedReceipt?.id === receipt.id}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Image Review Panel */}
          <div className="lg:col-span-2">
            {selectedReceipt ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Receipt #{selectedReceipt.id} Review
                    <Badge variant={getRiskBadgeColor(getFraudRiskLevel(selectedReceipt.fraudFlags))}>
                      {getFraudRiskLevel(selectedReceipt.fraudFlags).toUpperCase()} RISK
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    User ID: {selectedReceipt.userId} | Amount: ${selectedReceipt.amount} | Date: {selectedReceipt.purchaseDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedImage ? (
                    <div className="space-y-4">
                      {/* Receipt Image */}
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Receipt Image</h3>
                        <img 
                          src={selectedImage.imageData} 
                          alt="Receipt" 
                          className="max-w-full h-auto border rounded"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>

                      {/* Fraud Indicators */}
                      {selectedImage.fraudFlags.length > 0 && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Fraud Indicators Detected:</strong>
                            <ul className="list-disc list-inside mt-2">
                              {selectedImage.fraudFlags.map((flag, index) => (
                                <li key={index}>{flag.replace(/_/g, ' ').toUpperCase()}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button variant="default" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Receipt
                        </Button>
                        <Button variant="destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject as Fraud
                        </Button>
                      </div>
                    </div>
                  ) : selectedReceipt.hasImage ? (
                    <div className="text-center py-8">Loading receipt image...</div>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No image available for this receipt. Manual review based on data only.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a receipt to review</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ReceiptCardProps {
  receipt: PendingReceipt;
  onView: () => void;
  isSelected: boolean;
}

function ReceiptCard({ receipt, onView, isSelected }: ReceiptCardProps) {
  const riskLevel = getFraudRiskLevel(receipt.fraudFlags);
  
  return (
    <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`} onClick={onView}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium">Receipt #{receipt.id}</span>
          <Badge variant={getRiskBadgeColor(riskLevel)} className="text-xs">
            {riskLevel.toUpperCase()}
          </Badge>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>User: {receipt.userId}</div>
          <div>Amount: ${receipt.amount}</div>
          <div>Date: {new Date(receipt.purchaseDate).toLocaleDateString()}</div>
          {receipt.fraudFlags.length > 0 && (
            <div className="text-red-600 text-xs">
              {receipt.fraudFlags.length} flag(s)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getFraudRiskLevel(fraudFlags: string[]) {
  if (fraudFlags.includes('duplicate_image') || fraudFlags.includes('editing_software_detected')) {
    return 'high';
  }
  if (fraudFlags.length >= 2) {
    return 'medium';
  }
  if (fraudFlags.length >= 1) {
    return 'low';
  }
  return 'none';
}

function getRiskBadgeColor(level: string) {
  switch (level) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'outline';
  }
}