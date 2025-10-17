import { useState, useEffect, useCallback } from 'react';
import { Interface } from '@ethersproject/abi';
import { parseUnits } from '@ethersproject/units';
import { useSendTransaction } from '@vechain/dapp-kit-react';

const B3TR_CONTRACT_ADDRESS = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';

const VIP180_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "success", "type": "bool" }],
    "type": "function"
  }
];

export interface TransactionError extends Error {
  type?: 'user_rejection' | 'insufficient_funds' | 'network' | 'technical' | 'unknown';
  originalError?: any;
}

interface DirectB3TRTransferProps {
  recipientAddress: string;
  amount: string;
  userAddress: string; // Pass the user's address directly
  onSuccess?: (txId: string, txDetails?: any) => void;
  onError?: (error: TransactionError) => void;
  children: (props: {
    sendTransfer: () => Promise<void>;
    isPending: boolean;
    error: TransactionError | null;
    txReceipt: any;
    transactionState: 'idle' | 'preparing' | 'signing' | 'sending' | 'confirming' | 'success' | 'error';
  }) => React.ReactNode;
}

export function DirectB3TRTransfer({ 
  recipientAddress, 
  amount,
  userAddress,
  onSuccess, 
  onError,
  children 
}: DirectB3TRTransferProps) {
  const [transactionState, setTransactionState] = useState<'idle' | 'preparing' | 'signing' | 'sending' | 'confirming' | 'success' | 'error'>('idle');
  const [processedError, setProcessedError] = useState<TransactionError | null>(null);
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);
  
  // Use VeChain Kit's sendTransaction hook - works with VeWorld mobile!
  const { send } = useSendTransaction();

  // Process and categorize errors
  const processError = (err: any): TransactionError => {
    const error = new Error() as TransactionError;
    const errorMsg = err?.message?.toLowerCase() || err?.toString()?.toLowerCase() || '';
    
    if (errorMsg.includes('reject') || errorMsg.includes('denied') || errorMsg.includes('cancel')) {
      error.type = 'user_rejection';
      error.message = 'Transaction was rejected by the user';
    } else if (errorMsg.includes('insufficient') || errorMsg.includes('balance')) {
      error.type = 'insufficient_funds';
      error.message = 'Insufficient B3TR balance to complete this transaction';
    } else if (errorMsg.includes('network') || errorMsg.includes('timeout') || errorMsg.includes('connection')) {
      error.type = 'network';
      error.message = 'Network connection issue. Please check your connection and try again';
    } else if (errorMsg.includes('revert') || errorMsg.includes('failed')) {
      error.type = 'technical';
      error.message = 'Transaction failed. The smart contract rejected this transaction';
    } else {
      error.type = 'unknown';
      error.message = err?.message || 'An unexpected error occurred during the transaction';
    }
    
    error.originalError = err;
    return error;
  };

  const sendTransfer = useCallback(async () => {
    console.log('[DIRECT-B3TR] sendTransfer called with VeChain Kit!', {
      userAddress,
      recipientAddress,
      amount,
      hasVeChainKit: !!send,
    });

    // Reset states
    setTransactionState('preparing');
    setProcessedError(null);

    if (!userAddress) {
      const error = new Error('No wallet address provided') as TransactionError;
      error.type = 'technical';
      setProcessedError(error);
      setTransactionState('error');
      if (onError) onError(error);
      return;
    }

    if (!send) {
      const error = new Error('VeChain Kit not available. Please ensure you are connected.') as TransactionError;
      error.type = 'technical';
      setProcessedError(error);
      setTransactionState('error');
      if (onError) onError(error);
      return;
    }

    try {
      setIsPending(true);
      setTransactionState('signing');

      // Create transfer clause using VeChain Kit
      const b3trInterface = new Interface(VIP180_ABI);
      const amountInWei = parseUnits(amount, 18).toString();
      
      const clause = {
        to: B3TR_CONTRACT_ADDRESS,
        value: '0x0',
        data: b3trInterface.encodeFunctionData('transfer', [
          recipientAddress,
          amountInWei,
        ]),
      };

      console.log('[DIRECT-B3TR] Sending transaction with VeChain Kit:', clause);

      // Use VeChain Kit's send method - works with VeWorld mobile!
      const result = await send({
        clauses: [clause],
        comment: `Transfer ${amount} B3TR to ${recipientAddress}`,
      });
      
      console.log('[DIRECT-B3TR] Transaction result:', result);

      if (result && result.txId) {
        setTransactionState('confirming');
        
        const receiptData = {
          meta: {
            txID: result.txId,
          },
        };
        
        setTxReceipt(receiptData);
        setTransactionState('success');
        
        if (onSuccess) {
          onSuccess(result.txId, receiptData);
        }
      }
    } catch (err: any) {
      console.error('[DIRECT-B3TR] Transaction failed:', err);
      const processedErr = processError(err);
      setProcessedError(processedErr);
      setTransactionState('error');
      
      if (onError) {
        onError(processedErr);
      }
    } finally {
      setIsPending(false);
    }
  }, [userAddress, recipientAddress, amount, send, onSuccess, onError]);

  return children({
    sendTransfer,
    isPending,
    error: processedError,
    txReceipt,
    transactionState
  });
}