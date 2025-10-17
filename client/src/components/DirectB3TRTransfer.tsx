import { useState, useCallback, useMemo } from 'react';
import { Interface } from '@ethersproject/abi';
import { parseUnits } from '@ethersproject/units';

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
  userAddress: string;
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
  const [isPending, setIsPending] = useState(false);
  const [processedError, setProcessedError] = useState<TransactionError | null>(null);
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [transactionState, setTransactionState] = useState<'idle' | 'preparing' | 'signing' | 'sending' | 'confirming' | 'success' | 'error'>('idle');

  // Build clause for raw Connex
  const clause = useMemo(() => {
    if (!recipientAddress || !amount) return null;
    
    try {
      const b3trInterface = new Interface(VIP180_ABI);
      const amountInWei = parseUnits(amount, 18).toString();
      
      return {
        to: B3TR_CONTRACT_ADDRESS,
        value: '0x0',
        data: b3trInterface.encodeFunctionData('transfer', [
          recipientAddress,
          amountInWei,
        ]),
      };
    } catch (error) {
      console.error('[DIRECT-B3TR] Error creating clause:', error);
      return null;
    }
  }, [recipientAddress, amount]);

  // Process errors
  const processError = useCallback((err: any): TransactionError => {
    const error = new Error() as TransactionError;
    const errorMsg = err?.message?.toLowerCase() || err?.toString()?.toLowerCase() || '';
    
    console.error('[DIRECT-B3TR] Processing error:', { err, errorMsg });
    
    if (errorMsg.includes('reject') || errorMsg.includes('denied') || errorMsg.includes('cancelled')) {
      error.type = 'user_rejection';
      error.message = 'You rejected the transaction in your wallet. No B3TR was transferred.';
    } else if (errorMsg.includes('insufficient') || errorMsg.includes('balance')) {
      error.type = 'insufficient_funds';
      error.message = 'Insufficient B3TR balance';
    } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
      error.type = 'network';
      error.message = 'Network connection issue';
    } else {
      error.type = 'unknown';
      error.message = err?.message || 'Transaction failed';
    }
    
    error.originalError = err;
    return error;
  }, []);

  // Send transaction using raw window.connex
  const handleSendTransfer = useCallback(async () => {
    if (!userAddress) {
      const error = new Error('No wallet address available') as TransactionError;
      error.type = 'technical';
      setProcessedError(error);
      setTransactionState('error');
      if (onError) onError(error);
      return;
    }

    if (!clause) {
      const error = new Error('Invalid transaction parameters') as TransactionError;
      error.type = 'technical';
      setProcessedError(error);
      setTransactionState('error');
      if (onError) onError(error);
      return;
    }

    if (typeof window === 'undefined' || !window.connex) {
      const error = new Error('Connex not available - please use VeWorld wallet') as TransactionError;
      error.type = 'technical';
      setProcessedError(error);
      setTransactionState('error');
      if (onError) onError(error);
      return;
    }

    try {
      setIsPending(true);
      setTransactionState('preparing');
      setProcessedError(null);
      
      console.log('[DIRECT-B3TR] Sending via raw Connex:', { clause, userAddress });
      
      setTransactionState('signing');
      
      // Use raw Connex API - same pattern as the working test button
      const result = await window.connex.vendor
        .sign('tx', [clause])
        .signer(userAddress)
        .request();
      
      console.log('[DIRECT-B3TR] Transaction result:', result);
      
      setTransactionState('success');
      setTxReceipt(result);
      setIsPending(false);
      
      if (onSuccess) {
        onSuccess(result.txid, result);
      }
    } catch (err: any) {
      console.error('[DIRECT-B3TR] Transaction failed:', err);
      const processedErr = processError(err);
      setProcessedError(processedErr);
      setTransactionState('error');
      setIsPending(false);
      
      if (onError) onError(processedErr);
    }
  }, [userAddress, clause, processError, onSuccess, onError]);

  return children({
    sendTransfer: handleSendTransfer,
    isPending,
    error: processedError,
    txReceipt,
    transactionState,
  });
}
