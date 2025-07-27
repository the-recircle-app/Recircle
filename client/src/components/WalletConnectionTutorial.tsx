import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Check, Smartphone, QrCode, Wallet, Download, Lock } from 'lucide-react';
import B3trLogo from './B3trLogo';

interface WalletConnectionTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  description: React.ReactNode;
  image?: React.ReactNode;
}

const WalletConnectionTutorial: React.FC<WalletConnectionTutorialProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("mobile");

  // Reset to first step when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentStep, onClose]);

  const handleNextStep = () => {
    const maxSteps = activeTab === "mobile" ? mobileSteps.length - 1 : browserSteps.length - 1;
    if (currentStep < maxSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentStep(0); // Reset to first step when switching tabs
  };

  // Define the tutorial steps for mobile connection
  const mobileSteps: TutorialStep[] = [
    {
      title: "Download VeWorld Mobile App",
      description: (
        <div className="space-y-2">
          <p>First, you need to download the VeWorld mobile app on your smartphone.</p>
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Available on iOS App Store and Google Play Store</span>
            </div>
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Free to download and use</span>
            </div>
          </div>
        </div>
      ),
      image: (
        <div className="flex items-center justify-center h-full bg-gray-800/50 rounded-lg p-8">
          <Smartphone className="h-24 w-24 text-blue-400" />
        </div>
      )
    },
    {
      title: "Open the App & Create a Wallet",
      description: (
        <div className="space-y-2">
          <p>After installing, open the VeWorld app and create a new wallet:</p>
          <ol className="list-decimal pl-5 space-y-1 mt-2 text-sm">
            <li>Tap "Create a New Wallet"</li>
            <li>Write down your recovery phrase in a safe place</li>
            <li>Confirm your recovery phrase</li>
            <li>Set a strong password</li>
          </ol>
          <p className="text-yellow-400 text-sm mt-2 flex items-center">
            <Lock className="h-4 w-4 mr-1" />
            Never share your recovery phrase with anyone!
          </p>
        </div>
      ),
      image: (
        <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-lg p-6 gap-4">
          <Wallet className="h-16 w-16 text-blue-400" />
          <div className="flex flex-wrap justify-center gap-1 max-w-[200px]">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-700 text-xs px-2 py-1 rounded">word {i+1}</div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Scan the QR Code",
      description: (
        <div className="space-y-2">
          <p>Now you're ready to connect your wallet to B3TR:</p>
          <ol className="list-decimal pl-5 space-y-1 mt-2 text-sm">
            <li>In the VeWorld app, tap the scan icon in the top right</li>
            <li>Position your phone to scan the QR code displayed on this screen</li>
            <li>Review and approve the connection request</li>
          </ol>
          <p className="text-green-400 text-sm mt-2">Once connected, you'll earn B3TR tokens for your thrift store receipts!</p>
        </div>
      ),
      image: (
        <div className="flex items-center justify-center h-full bg-gray-800/50 rounded-lg p-6">
          {/* Mockup of a phone with QR code scanner screen */}
          <div className="relative w-48 h-80 border-4 border-gray-700 rounded-xl overflow-hidden bg-black flex flex-col">
            {/* Phone status bar */}
            <div className="h-6 w-full bg-black flex justify-between items-center px-3">
              <div className="text-white text-[8px]">5:22 PM</div>
              <div className="flex space-x-1">
                <div className="w-1 h-2 bg-white"></div>
                <div className="w-1 h-2 bg-white"></div>
                <div className="w-1 h-2 bg-white"></div>
                <div className="w-1 h-2 bg-white"></div>
              </div>
            </div>
            
            {/* App header */}
            <div className="h-8 w-full bg-blue-600 flex items-center justify-center">
              <div className="text-white text-xs font-semibold">VeWorld Wallet</div>
            </div>
            
            {/* Scanner view */}
            <div className="flex-grow bg-gray-900 flex items-center justify-center">
              <div className="relative w-32 h-32 border border-blue-400">
                {/* Scanner targeting corners */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400"></div>
                
                {/* Scanning animation */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 animate-pulse"></div>
              </div>
            </div>
            
            {/* Bottom instruction */}
            <div className="h-8 w-full bg-gray-800 flex items-center justify-center">
              <div className="text-white text-[8px]">Position QR code in frame to scan</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Define the tutorial steps for browser extension connection
  const browserSteps: TutorialStep[] = [
    {
      title: "Install VeWorld Browser Extension",
      description: (
        <div className="space-y-2">
          <p>First, install the VeWorld browser extension from your browser's extension store:</p>
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Available for Chrome, Firefox, and Edge</span>
            </div>
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Search for "VeWorld" in your browser's extension store</span>
            </div>
          </div>
        </div>
      ),
      image: (
        <div className="flex items-center justify-center h-full bg-gray-800/50 rounded-lg p-8">
          <Download className="h-24 w-24 text-blue-400" />
        </div>
      )
    },
    {
      title: "Create or Import a Wallet",
      description: (
        <div className="space-y-2">
          <p>After installing the extension, you'll need to set up your wallet:</p>
          <ol className="list-decimal pl-5 space-y-1 mt-2 text-sm">
            <li>Click on the VeWorld extension icon in your browser</li>
            <li>Follow the instructions to create a new wallet or import an existing one</li>
            <li>If creating new, securely store your recovery phrase</li>
            <li>Set a strong password to protect your wallet</li>
          </ol>
        </div>
      ),
      image: (
        <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-lg p-6 gap-4">
          <Wallet className="h-16 w-16 text-blue-400" />
          <div className="flex flex-wrap justify-center gap-1 max-w-[200px]">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-700 text-xs px-2 py-1 rounded">word {i+1}</div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Connect to B3TR",
      description: (
        <div className="space-y-2">
          <p>Now you're ready to connect your wallet:</p>
          <ol className="list-decimal pl-5 space-y-1 mt-2 text-sm">
            <li>Make sure your VeWorld extension is unlocked</li>
            <li>Click the "Connect VeWorld Browser Extension" button on this screen</li>
            <li>A popup will appear asking for permission to connect</li>
            <li>Click "Connect" to approve the connection</li>
          </ol>
          <p className="text-green-400 text-sm mt-2">Once connected, you'll earn B3TR tokens for your thrift store receipts!</p>
        </div>
      ),
      image: (
        <div className="flex items-center justify-center h-full bg-gray-800/50 rounded-lg p-6">
          <div className="flex flex-col items-center gap-4">
            <Button 
              className="relative"
              variant="outline"
              disabled
            >
              <svg className="mr-2 h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="8" y1="12" x2="16" y2="12"></line>
                <line x1="12" y1="16" x2="12" y2="8"></line>
              </svg>
              Connect VeWorld
            </Button>
            <div className="text-sm text-gray-400">Click this button to connect</div>
          </div>
        </div>
      )
    }
  ];

  // Get current tutorial steps based on active tab
  const tutorialSteps = activeTab === "mobile" ? mobileSteps : browserSteps;
  const currentTutorialStep = tutorialSteps[currentStep];
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <B3trLogo className="w-6 h-6 mr-2" color="#38BDF8" />
            <span>Wallet Connection Guide</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Learn how to connect your VeWorld wallet to start earning B3TR tokens.
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue="mobile" 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-800 p-1 border border-gray-700">
            <TabsTrigger 
              value="mobile" 
              className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile Wallet
            </TabsTrigger>
            <TabsTrigger 
              value="browser" 
              className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="8" y1="12" x2="16" y2="12"></line>
                <line x1="12" y1="16" x2="12" y2="8"></line>
              </svg>
              Browser Extension
            </TabsTrigger>
          </TabsList>

          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="flex flex-col md:flex-row md:gap-6">
              <div className="md:w-1/2">
                <h3 className="text-lg font-medium mb-2">{currentTutorialStep.title}</h3>
                <div className="text-gray-300 text-sm">{currentTutorialStep.description}</div>
              </div>
              
              <div className="md:w-1/2 mt-4 md:mt-0">
                {currentTutorialStep.image}
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className={`h-8 border-blue-700 ${currentStep === 0 
                    ? 'opacity-50 bg-gray-700 text-gray-300 cursor-not-allowed' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white'}`}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextStep}
                  disabled={currentStep === tutorialSteps.length - 1}
                  className={`h-8 border-blue-700 ${currentStep === tutorialSteps.length - 1 
                    ? 'opacity-50 bg-gray-700 text-gray-300 cursor-not-allowed' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white'}`}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between mt-4">
          <p className="text-xs text-gray-500 mb-4 sm:mb-0">
            Use arrow keys to navigate between steps
          </p>
          <Button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            Close Guide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectionTutorial;