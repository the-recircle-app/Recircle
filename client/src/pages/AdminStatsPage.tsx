import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet } from "../context/WalletContext";
import { 
  Receipt, 
  Users, 
  Coins, 
  Leaf, 
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Image as ImageIcon
} from "lucide-react";

interface AnalyticsStats {
  totalReceipts: number;
  totalUsers: number;
  totalB3trDistributed: number;
  totalCO2SavedGrams: number;
  totalCO2SavedKg: number;
}

interface ReceiptData {
  id: number;
  userId: number;
  storeName: string;
  category: string;
  amount: number;
  tokenReward: number;
  co2SavingsGrams: number;
  status: string;
  createdAt: string;
  hasImage: boolean;
  fraudFlags: string[];
  imageUrl: string | null;
  viewToken: string | null;
}

export default function AdminStatsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { userId } = useWallet();
  const limit = 20;

  // Build query URL with parameters
  const queryUrl = userId 
    ? `/api/admin/analytics-stats?limit=${limit}&offset=${page * limit}${search ? `&search=${search}` : ''}${statusFilter !== "all" ? `&status=${statusFilter}` : ''}&userId=${userId}`
    : null;

  const { data, isLoading, error } = useQuery<{
    success: boolean;
    stats: AnalyticsStats;
    receipts: ReceiptData[];
    pagination: {
      total: number;
      hasMore: boolean;
    };
  }>({
    queryKey: [queryUrl],
    enabled: !!userId && !!queryUrl, // Only query when we have a userId
    refetchInterval: 30000,
    retry: false, // Don't retry auth errors
  });

  const stats = data?.stats;
  const receipts = data?.receipts || [];
  const pagination = data?.pagination;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(0);
  };

  const getFraudFlagColor = (flag: string) => {
    const highRisk = ['duplicate_image', 'editing_software_detected'];
    if (highRisk.includes(flag)) return 'destructive';
    return 'secondary';
  };

  const getFraudFlagLabel = (flag: string) => {
    const labels: Record<string, string> = {
      'duplicate_image': 'Duplicate',
      'file_too_small': 'Small File',
      'file_too_large': 'Large File',
      'editing_software_detected': 'Edited',
      'unusual_compression': 'Compression',
      'unsupported_format': 'Format'
    };
    return labels[flag] || flag;
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto max-w-2xl">
          <Card className="mt-20">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Admin Authentication Required</h2>
              <p className="text-gray-600 mb-6">
                This dashboard requires admin privileges. Please log in with an admin account to view analytics.
              </p>
              <p className="text-sm text-gray-500">
                You need to authenticate with VeWorld wallet and have admin permissions set in the database.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">ReCircle Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Platform statistics and receipt management
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalReceipts.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">B3TR Distributed</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalB3trDistributed.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCO2SavedKg.toLocaleString()} kg</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.totalCO2SavedGrams.toLocaleString()} grams
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by store name, user ID, or amount..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Receipts</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending_manual_review">Pending Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Receipts</h2>
            <p className="text-sm text-gray-600">
              Showing {receipts.length} of {pagination?.total.toLocaleString()} receipts
            </p>
          </div>

          {receipts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                No receipts found
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {receipts.map((receipt) => (
                <Card key={receipt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image Thumbnail */}
                      <div className="flex-shrink-0">
                        {receipt.hasImage && receipt.imageUrl ? (
                          <div 
                            className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group"
                            onClick={() => setSelectedImage(receipt.imageUrl)}
                          >
                            <img 
                              src={receipt.imageUrl} 
                              alt="Receipt"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full md:w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Receipt Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{receipt.storeName}</h3>
                            <p className="text-sm text-gray-600">
                              Receipt #{receipt.id} • User #{receipt.userId}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {receipt.status === 'verified' && (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {receipt.status === 'pending_manual_review' && (
                              <Badge variant="secondary">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Pending Review
                              </Badge>
                            )}
                            {receipt.status === 'rejected' && (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-semibold">${receipt.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Reward</p>
                            <p className="font-semibold">{receipt.tokenReward.toFixed(2)} B3TR</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">CO₂ Saved</p>
                            <p className="font-semibold">{receipt.co2SavingsGrams}g</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-semibold text-sm">
                              {new Date(receipt.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Fraud Flags */}
                        {receipt.fraudFlags && receipt.fraudFlags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {receipt.fraudFlags.map((flag, idx) => (
                              <Badge 
                                key={idx} 
                                variant={getFraudFlagColor(flag)}
                                className="text-xs"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {getFraudFlagLabel(flag)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total > limit && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <div className="flex items-center px-4">
                Page {page + 1} of {Math.ceil(pagination.total / limit)}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasMore}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </Button>
            <img 
              src={selectedImage} 
              alt="Receipt Full Size"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
