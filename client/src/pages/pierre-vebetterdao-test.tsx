// Pierre VeBetterDAO Test Page
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PierreDropzone } from '@/components/PierreDropzone';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Wallet, Check, X, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

interface ContractStatus {
  initialized: boolean;
  currentCycle?: string;
  cycleDuration?: string;
  maxSubmissions?: string;
  contractAddress?: string;
  error?: string;
}

export function PierreVeBetterDAOTest() {
  const [contractStatus, setContractStatus] = useState<ContractStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadContractStatus();
  }, []);

  const loadContractStatus = async () => {
    try {
      const response = await fetch('/api/pierre/contract-status');
      const status = await response.json();
      setContractStatus(status);
    } catch (error) {
      console.error('Failed to load contract status:', error);
      setContractStatus({ initialized: false, error: 'Failed to connect to server' });
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if VeWorld is available
      if (typeof window !== 'undefined' && (window as any).vechain) {
        const connex = (window as any).vechain;
        const accounts = await connex.thor.account('0x0000000000000000000000000000000000000000').get();
        const account = await connex.vendor.sign('cert', {}).request();
        
        if (account && account.annex && account.annex.signer) {
          setWalletAddress(account.annex.signer);
          toast({
            title: "Wallet Connected",
            description: `Connected to ${account.annex.signer}`,
          });
        }
      } else {
        // Use mock address for testing
        const mockAddress = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';
        setWalletAddress(mockAddress);
        toast({
          title: "Mock Wallet Connected",
          description: `Using test address: ${mockAddress}`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to VeWorld wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const onReceiptUploadSuccess = (result: any) => {
    console.log('Receipt uploaded successfully:', result);
    loadContractStatus(); // Refresh contract status
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Pierre VeBetterDAO Test</h1>
        <p className="text-muted-foreground">
          Test ReCircle's VeBetterDAO integration using Pierre's proven patterns
        </p>
      </div>

      <div className="grid gap-6">
        {/* Contract Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Contract Status
              {contractStatus?.initialized ? (
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <X className="h-3 w-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contractStatus ? (
              contractStatus.initialized ? (
                <div className="space-y-2">
                  <p><strong>Contract Address:</strong> {contractStatus.contractAddress}</p>
                  <p><strong>Current Cycle:</strong> {contractStatus.currentCycle}</p>
                  <p><strong>Cycle Duration:</strong> {contractStatus.cycleDuration} blocks</p>
                  <p><strong>Max Submissions:</strong> {contractStatus.maxSubmissions} per cycle</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{contractStatus.error || 'Contract not initialized - check configuration'}</span>
                </div>
              )
            ) : (
              <div>Loading contract status...</div>
            )}
            <Button onClick={loadContractStatus} variant="outline" size="sm" className="mt-4">
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        {/* Wallet Connection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {walletAddress ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Connected Address:</p>
                <p className="font-mono text-sm bg-muted p-2 rounded">{walletAddress}</p>
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Connect your VeWorld wallet to test B3TR token distribution
                </p>
                <Button 
                  onClick={connectWallet} 
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? 'Connecting...' : 'Connect VeWorld Wallet'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt Upload Test */}
        <Card>
          <CardHeader>
            <CardTitle>Receipt Upload Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Upload a sustainable transportation receipt to test Pierre's VeBetterDAO integration
              </p>
              
              {!walletAddress && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-orange-800 text-sm">
                    Connect your wallet first to enable receipt uploads
                  </p>
                </div>
              )}
              
              <PierreDropzone 
                userWalletAddress={walletAddress} 
                onUploadSuccess={onReceiptUploadSuccess}
              />
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Upload receipts for public transit, bike share, electric vehicle rentals</p>
                <p>• AI will analyze receipt validity (score 0-1)</p>
                <p>• Scores &gt; 0.5 automatically receive B3TR tokens</p>
                <p>• Max {contractStatus?.maxSubmissions || 10} submissions per cycle</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p><strong>Upload Receipt:</strong> Drag & drop or click to select receipt image</p>
                  <p className="text-muted-foreground">Supports sustainable transportation receipts</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p><strong>AI Analysis:</strong> OpenAI Vision API validates receipt authenticity</p>
                  <p className="text-muted-foreground">Returns validity score from 0-1</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p><strong>Token Distribution:</strong> Valid receipts (&gt;0.5 score) receive B3TR tokens</p>
                  <p className="text-muted-foreground">Distributed directly to your VeWorld wallet</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <p><strong>Immediate Results:</strong> Check your VeWorld balance for new tokens</p>
                  <p className="text-muted-foreground">Following Pierre's proven instant distribution pattern</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}