import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react";

interface PendingReceipt {
  id: string;
  userId: number;
  userName: string;
  walletAddress: string;
  storeName: string;
  category: string;
  amount: number;
  tokenReward: number;
  submittedAt: string;
  imageUrl?: string;
  aiConfidence: number;
  extractedData: any;
}

export default function AdminReview() {
  const [selectedReceipt, setSelectedReceipt] = useState<PendingReceipt | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewDecision, setReviewDecision] = useState<"approve" | "reject" | "flag">("");

  // Fetch pending receipts
  const { data: pendingReceipts, isLoading } = useQuery({
    queryKey: ["/api/admin/pending-receipts"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Review receipt mutation
  const reviewMutation = useMutation({
    mutationFn: async (reviewData: {
      receiptId: string;
      decision: string;
      notes: string;
    }) => {
      const response = await fetch("/api/admin/review-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-receipts"] });
      setSelectedReceipt(null);
      setReviewNotes("");
      setReviewDecision("");
    },
  });

  const handleReview = () => {
    if (!selectedReceipt || !reviewDecision) return;

    reviewMutation.mutate({
      receiptId: selectedReceipt.id,
      decision: reviewDecision,
      notes: reviewNotes,
    });
  };

  const getTransportationCategory = (category: string) => {
    const categories = {
      'ride_share': 'Ride-share',
      'electric_vehicle': 'Electric Vehicle',
      'public_transit': 'Public Transit',
      'micro_mobility': 'Micro-mobility',
      'other_transport': 'Other Transport'
    };
    return categories[category as keyof typeof categories] || category;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading pending receipts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transportation Receipt Review</h1>
        <p className="text-gray-600 mt-2">
          Review and approve sustainable transportation receipts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Receipts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Reviews ({pendingReceipts?.length || 0})</h2>
          
          {pendingReceipts?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No receipts pending review
              </CardContent>
            </Card>
          ) : (
            pendingReceipts?.map((receipt: PendingReceipt) => (
              <Card 
                key={receipt.id} 
                className={`cursor-pointer transition-colors ${
                  selectedReceipt?.id === receipt.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedReceipt(receipt)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {receipt.storeName || 'Unknown Service'}
                    </CardTitle>
                    <Badge variant="secondary">
                      {getTransportationCategory(receipt.category)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">${receipt.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reward:</span>
                      <span className="font-medium">{receipt.tokenReward} B3TR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Confidence:</span>
                      <Badge 
                        variant={receipt.aiConfidence > 0.8 ? "default" : "destructive"}
                      >
                        {Math.round(receipt.aiConfidence * 100)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>User:</span>
                      <span className="font-medium">{receipt.userName}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(receipt.submittedAt).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Review Panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Review Details</h2>
          
          {selectedReceipt ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {selectedReceipt.storeName} - ${selectedReceipt.amount}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Receipt Image */}
                {selectedReceipt.imageUrl && (
                  <div>
                    <label className="text-sm font-medium">Receipt Image:</label>
                    <img 
                      src={selectedReceipt.imageUrl} 
                      alt="Receipt" 
                      className="mt-2 max-w-full h-auto border rounded"
                    />
                  </div>
                )}

                {/* Transportation Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span>
                    <p>{getTransportationCategory(selectedReceipt.category)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Service:</span>
                    <p>{selectedReceipt.storeName}</p>
                  </div>
                  <div>
                    <span className="font-medium">User:</span>
                    <p>{selectedReceipt.userName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Wallet:</span>
                    <p className="truncate">{selectedReceipt.walletAddress}</p>
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedReceipt.extractedData && (
                  <div>
                    <label className="text-sm font-medium">AI Analysis:</label>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(selectedReceipt.extractedData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Review Decision */}
                <div>
                  <label className="text-sm font-medium">Review Decision:</label>
                  <Select value={reviewDecision} onValueChange={setReviewDecision}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select decision..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">✅ Approve - Valid Transportation</SelectItem>
                      <SelectItem value="reject">❌ Reject - Not Valid</SelectItem>
                      <SelectItem value="flag">⚠️ Flag for Further Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Review Notes */}
                <div>
                  <label className="text-sm font-medium">Review Notes:</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    className="mt-2"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleReview}
                  disabled={!reviewDecision || reviewMutation.isPending}
                  className="w-full"
                >
                  {reviewMutation.isPending ? "Processing..." : "Submit Review"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Select a receipt to review
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}