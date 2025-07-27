import ProductionVeWorldConnect from "@/components/ProductionVeWorldConnect";
import { useWallet } from "@/context/WalletContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function WalletConnectProductionPage() {
  const [, setLocation] = useLocation();
  const { isConnected, address, tokenBalance, userId } = useWallet();

  const goToApp = () => {
    setLocation('/');
  };

  const goToSubmitReceipt = () => {
    setLocation('/submit-receipt');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">ReCircle Wallet Connection</h1>
          <p className="text-gray-400">Production-ready VeWorld integration for B3TR rewards</p>
        </div>

        {!isConnected ? (
          <ProductionVeWorldConnect />
        ) : (
          <div className="max-w-md mx-auto space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400">Wallet Connected Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Wallet Address:</p>
                  <p className="font-mono text-sm break-all text-blue-400">{address}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">User ID:</p>
                  <p className="text-sm">{userId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">B3TR Token Balance:</p>
                  <p className="text-lg font-bold text-green-400">{tokenBalance} B3TR</p>
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button onClick={goToSubmitReceipt} className="w-full">
                    Submit Receipt for Rewards
                  </Button>
                  <Button onClick={goToApp} variant="outline" className="w-full">
                    Go to Main App
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}