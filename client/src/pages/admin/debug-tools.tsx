import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DevResetToolkit from "@/components/DevResetToolkit";
import EnvCheck from "@/components/EnvCheck";
import VeWorldWalletConnect from "@/components/VeWorldWalletConnect";
import VeChainWalletConnect from "@/components/VeChainWalletConnect";
import { Link } from "wouter";

const DebugToolsPage = () => {
  const [showEnvVars, setShowEnvVars] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Debug Tools</h1>
          <Link href="/home">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Production VeChain Wallet */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Production VeChain Wallet (Multi-method)</CardTitle>
            </CardHeader>
            <CardContent>
              <VeChainWalletConnect />
            </CardContent>
          </Card>

          {/* Legacy Wallet Connection Testing */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Legacy VeWorld Test (Debugging)</CardTitle>
            </CardHeader>
            <CardContent>
              <VeWorldWalletConnect />
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Environment Variables
                <Button 
                  onClick={() => setShowEnvVars(!showEnvVars)}
                  variant="outline"
                  size="sm"
                >
                  {showEnvVars ? 'Hide' : 'Show'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showEnvVars && <EnvCheck />}
            </CardContent>
          </Card>

          {/* Development Reset Tools */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Development Reset Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <DevResetToolkit />
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Debug Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Link href="/veworld-test">
                  <Button variant="outline" className="w-full">VeWorld Test</Button>
                </Link>
                <Link href="/wallet-debug">
                  <Button variant="outline" className="w-full">Wallet Debug</Button>
                </Link>
                <Link href="/test-wallet-connect">
                  <Button variant="outline" className="w-full">Test Wallet</Button>
                </Link>
                <Link href="/dao-wallet-connect">
                  <Button variant="outline" className="w-full">DAO Wallet</Button>
                </Link>
                <Link href="/minimal-connect">
                  <Button variant="outline" className="w-full">Minimal Connect</Button>
                </Link>
                <Link href="/admin/pending-submissions">
                  <Button variant="outline" className="w-full">Pending Receipts</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono">
                <p>URL: {window.location.href}</p>
                <p>Domain: {window.location.hostname}</p>
                <p>User Agent: {navigator.userAgent}</p>
                <p>Is Production: {window.location.hostname.includes('replit.app') ? 'Yes' : 'No'}</p>
                <p>VeChain Provider: {typeof (window as any).vechain !== 'undefined' ? 'Available' : 'Not Available'}</p>
                <p>Connex Provider: {typeof (window as any).connex !== 'undefined' ? 'Available' : 'Not Available'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DebugToolsPage;