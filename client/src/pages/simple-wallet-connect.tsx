import React from "react";
import SimpleWalletConnect from "@/components/SimpleWalletConnect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SimpleWalletConnectPage() {
  const { toast } = useToast();
  
  const handleConnect = () => {
    toast({
      title: "Wallet Connected!",
      description: "Your VeWorld wallet has been connected successfully.",
      variant: "default",
    });
  };

  return (
    <div className="container max-w-screen-md mx-auto py-8">
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Production-Ready Wallet Connect</CardTitle>
          <CardDescription>
            A simplified, reliable implementation for connecting to VeWorld wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleWalletConnect onConnect={handleConnect} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Implementation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Uses window.onload + document.readyState for production-safe detection</li>
            <li>Automatically retries if Connex is not yet injected</li>
            <li>Shows clear loading state with visual indicators</li>
            <li>Allows manual retry for edge cases</li>
            <li>Connects and returns wallet address cleanly</li>
            <li>Fails gracefully with user instructions if wallet not detected</li>
            <li>Stores connection in localStorage for persistent sessions</li>
            <li>Works reliably in both browser and in-app environments</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}