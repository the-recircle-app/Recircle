import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { featureFlags } from '../lib/environment';

interface SampleReceiptProps {
  onSelectSample: (file: File) => void;
}

export const SampleReceipts: React.FC<SampleReceiptProps> = ({ onSelectSample }) => {
  // Only show sample receipts in development
  if (!featureFlags.showSampleReceipts) {
    return null;
  }
  const sampleReceipts = [
    {
      id: 'goodwill',
      name: 'Goodwill Receipt',
      description: 'A sample receipt from Goodwill thrift store',
      expected: 'Should be recognized as a valid thrift store receipt',
      previewElement: (
        <div className="flex items-center justify-center h-full bg-gray-800 text-center p-2">
          <div>
            <div className="text-green-400 text-2xl mb-1">♻️</div>
            <div className="font-bold mb-1">GOODWILL</div>
            <div className="text-xs text-gray-400">Sample Thrift Store Receipt</div>
            <div className="mt-2 text-xs">
              <div>Total: $24.99</div>
              <div>Date: 04/22/2023</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'restaurant',
      name: 'Restaurant Receipt',
      description: 'A non-thrift store receipt',
      expected: 'Should NOT be recognized as a thrift store receipt',
      previewElement: (
        <div className="flex items-center justify-center h-full bg-gray-800 text-center p-2">
          <div>
            <div className="text-red-400 text-2xl mb-1">🍔</div>
            <div className="font-bold mb-1">BURGER PLACE</div>
            <div className="text-xs text-gray-400">Sample Restaurant Receipt</div>
            <div className="mt-2 text-xs">
              <div>Total: $18.50</div>
              <div>Date: 04/21/2023</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Create a sample file directly from text
  const handleSelectSample = (receiptId: string) => {
    try {
      // Create receipt text based on type
      const isGoodwill = receiptId === 'goodwill';
      const receiptText = isGoodwill
        ? `GOODWILL INDUSTRIES
123 Main Street
San Francisco, CA
--------------------------------
1x Vintage Shirt     $12.99
1x Jeans             $9.99
1x Book              $2.01
--------------------------------
SUBTOTAL:            $24.99
TAX:                 $2.50
TOTAL:               $27.49

THANK YOU FOR SUPPORTING
OUR MISSION!
04/22/2023
HAVE A GREAT DAY`
        : `BURGER PLACE
456 Elm Avenue
San Francisco, CA
--------------------------------
1x Cheeseburger      $8.99
1x Fries             $3.50
1x Soda              $2.49
1x Shake             $3.99
--------------------------------
SUBTOTAL:            $18.97
TAX:                 $1.52
TOTAL:               $20.49

THANKS FOR VISITING!
04/21/2023
PLEASE COME AGAIN!`;

      // Convert text to a Blob and then to a File
      const blob = new Blob([receiptText], { type: 'text/plain' });
      const file = new File([blob], `sample-receipt-${receiptId}-${Date.now()}.txt`, { type: 'text/plain' });
      
      onSelectSample(file);
    } catch (error) {
      console.error('Error creating sample receipt:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white h-full">
      <h3 className="text-xl font-semibold mb-3">Sample Receipts</h3>
      <p className="text-sm text-gray-300 mb-4">
        Select a sample receipt to test the AI analysis:
      </p>
      
      <ScrollArea className="h-[250px] rounded-md border border-gray-700 p-2">
        <div className="space-y-4">
          {sampleReceipts.map((receipt) => (
            <div 
              key={receipt.id}
              className="bg-gray-800 rounded-lg p-3 flex flex-col"
            >
              <div className="mb-2">
                <h4 className="font-medium">{receipt.name}</h4>
                <p className="text-xs text-gray-400">{receipt.description}</p>
              </div>
              
              <div className="aspect-[4/3] bg-black rounded mb-2 overflow-hidden">
                {receipt.previewElement}
              </div>
              
              <div className="mt-1">
                <p className="text-xs text-gray-400 mb-2">{receipt.expected}</p>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleSelectSample(receipt.id)}
                >
                  Use This Sample
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Custom upload button - always visible */}
      <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-center mb-3 font-medium">Or upload your own receipt image:</p>
        <Button 
          variant="default" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            // Create a custom event that bubbles up to trigger the file input
            const customEvent = new CustomEvent('custom:openFileSelector', { bubbles: true });
            document.dispatchEvent(customEvent);
          }}
        >
          Upload Custom Image
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        These are sample receipts generated for testing purposes. 
        You can also upload your own receipt images to test the AI analysis.
      </p>
    </div>
  );
};

export default SampleReceipts;