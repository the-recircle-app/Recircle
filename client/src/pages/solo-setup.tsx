import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, CheckCircle, AlertCircle, ExternalLink, Copy, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VeWorldTokenManager } from '@/components/VeWorldTokenManager';

export default function SoloSetupPage() {
  const [copiedRPC, setCopiedRPC] = useState(false);
  const [copiedChainId, setCopiedChainId] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: 'rpc' | 'chainId') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'rpc') setCopiedRPC(true);
      if (type === 'chainId') setCopiedChainId(true);
      
      setTimeout(() => {
        setCopiedRPC(false);
        setCopiedChainId(false);
      }, 2000);
      
      toast({
        title: "Copied!",
        description: `${type === 'rpc' ? 'RPC URL' : 'Chain ID'} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Solo Network Setup</h1>
          <p className="text-gray-600">Configure VeWorld to connect to your local Solo node for real B3TR rewards</p>
        </div>

        {/* Status Card */}
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Solo Node Active:</strong> Your local VeChain Thor Solo node is running on localhost:8669 with real B3TR tokens
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Manual Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Manual VeWorld Setup
              </CardTitle>
              <CardDescription>
                Add Solo network manually in VeWorld settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Network Name</label>
                  <div className="bg-gray-100 p-2 rounded border text-sm font-mono">
                    VeChain Solo
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">RPC URL</label>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 p-2 rounded border text-sm font-mono flex-1">
                      http://localhost:8669
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('http://localhost:8669', 'rpc')}
                    >
                      {copiedRPC ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">Chain Tag (Hex)</label>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 p-2 rounded border text-sm font-mono flex-1">
                      0x27
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('0x27', 'chainId')}
                    >
                      {copiedChainId ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="text-xs text-gray-600">
                    Open VeWorld → Settings → Networks → Add Custom Network
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automatic Setup */}
          <VeWorldTokenManager />
        </div>

        {/* B3TR Token Information */}
        <Card>
          <CardHeader>
            <CardTitle>B3TR Token Configuration</CardTitle>
            <CardDescription>
              Add this token to VeWorld to see your ReCircle rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Contract Address</label>
                <div className="bg-gray-100 p-2 rounded border text-xs font-mono break-all">
                  0x5ef79995fe8a89e0812330e4378eb2660cede699
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Symbol</label>
                <div className="bg-gray-100 p-2 rounded border text-sm font-mono">
                  B3TR
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Decimals</label>
                <div className="bg-gray-100 p-2 rounded border text-sm font-mono">
                  18
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Setup Guide</CardTitle>
            <CardDescription>
              Follow these steps to see real B3TR rewards in VeWorld
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium">Add Solo Network</h4>
                  <p className="text-sm text-gray-600">Use the automatic setup or add manually in VeWorld settings</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium">Switch to Solo Network</h4>
                  <p className="text-sm text-gray-600">Change network in VeWorld to "VeChain Solo" or your custom name</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium">Add B3TR Token</h4>
                  <p className="text-sm text-gray-600">Use the automatic setup or add token manually in "My Tokens" section</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h4 className="font-medium">Test ReCircle</h4>
                  <p className="text-sm text-gray-600">Submit a transportation receipt and watch your B3TR balance increase!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Button asChild>
            <a href="/home">
              Return to ReCircle
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}