import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRWalletConnect from "./QRWalletConnect";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: string) => void;
  connecting: boolean;
}

const ConnectWalletModal = ({
  isOpen,
  onClose,
  onSelectWallet,
  connecting
}: ConnectWalletModalProps) => {
  const [activeTab, setActiveTab] = useState("desktop");
  
  // Make sure tab changes are properly handled
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleWalletSelection = (walletType: string) => {
    onSelectWallet(walletType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            Connect to VeChain Wallet
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} className="mt-4" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="desktop">Desktop Wallet</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Wallet</TabsTrigger>
          </TabsList>
          
          <TabsContent value="desktop" className="space-y-3 mt-4">
            <button
              className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => handleWalletSelection("VeChainThor")}
              disabled={connecting}
            >
              <div className="flex items-center">
                <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <i className="fa-solid fa-wallet text-white"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium">VeChain Thor Wallet</p>
                  <p className="text-xs text-gray-500">Connect to your VeChain Thor wallet</p>
                </div>
              </div>
              <i className="fa-solid fa-arrow-right"></i>
            </button>

            <button
              className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => handleWalletSelection("SyncApp")}
              disabled={connecting}
            >
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <i className="fa-solid fa-sync text-white"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium">Sync App</p>
                  <p className="text-xs text-gray-500">Connect using VeChain Sync App</p>
                </div>
              </div>
              <i className="fa-solid fa-arrow-right"></i>
            </button>

            <button
              className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => handleWalletSelection("VeChainX")}
              disabled={connecting}
            >
              <div className="flex items-center">
                <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <i className="fa-solid fa-plug text-white"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium">VeChainX</p>
                  <p className="text-xs text-gray-500">Connect to VeChainX browser extension</p>
                </div>
              </div>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </TabsContent>
          
          <TabsContent value="mobile" className="mt-4">
            <QRWalletConnect 
              onConnect={() => {
                // Close the modal after successful connection
                setTimeout(() => onClose(), 1500);
              }}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-5 bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;
