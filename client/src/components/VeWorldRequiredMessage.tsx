import { AlertCircle, Download, Smartphone } from 'lucide-react';
import { detectPlatform } from '../utils/platformDetection';

export function VeWorldRequiredMessage() {
  const platform = detectPlatform();
  
  // Debug info
  const hasConnex = typeof window !== 'undefined' && 'connex' in window;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const userAgentMatch = /veworld|sync2|vechain/i.test(userAgent);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            VeWorld App Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            To start earning B3TR tokens with ReCircle, please use the VeWorld mobile app.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">You're currently on: {platform.platformName}</p>
              <p>ReCircle works exclusively through the VeWorld mobile wallet for secure blockchain transactions.</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-2">How to get started:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Download VeWorld from your app store</li>
              <li>Create or import your VeChain wallet</li>
              <li>Open ReCircle in the VeWorld browser</li>
              <li>Start earning B3TR for sustainable rides!</li>
            </ol>
          </div>
          
          <div className="flex gap-3">
            <a
              href="https://apps.apple.com/app/veworld/id1633545210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-black text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">App Store</span>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.vechain.wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-black text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Play Store</span>
            </a>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Already have VeWorld? Open this page in the VeWorld app browser.
          </p>
          
          {/* Debug info */}
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-left">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Debug Info:</p>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 font-mono">
              <p>Connex: {hasConnex ? '✅ Found' : '❌ Not found'}</p>
              <p>UA Match: {userAgentMatch ? '✅ Yes' : '❌ No'}</p>
              <p className="break-all">UA: {userAgent.substring(0, 60)}...</p>
            </div>
          </div>
          
          <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-2">
            v2025.11.02-006
          </p>
        </div>
      </div>
    </div>
  );
}
