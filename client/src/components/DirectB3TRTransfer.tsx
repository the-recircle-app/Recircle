import { useState, useCallback, useMemo, useEffect } from 'react';
import { useWallet, useSendTransaction } from '@vechain/vechain-kit';
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
  const { account } = useWallet();
  const [processedError, setProcessedError] = useState<TransactionError | null>(null);
  const [transactionState, setTransactionState] = useState<'idle' | 'preparing' | 'signing' | 'sending' | 'confirming' | 'success' | 'error'>('idle');

  // Build clauses for VeChain Kit
  const clauses = useMemo(() => {
    if (!recipientAddress || !amount) return [];
    
    try {
      const b3trInterface = new Interface(VIP180_ABI);
      const amountInWei = parseUnits(amount, 18).toString();
      
      return [{
        to: B3TR_CONTRACT_ADDRESS,
        value: '0x0',
        data: b3trInterface.encodeFunctionData('transfer', [
          recipientAddress,
          amountInWei,
        ]),
        comment: `Transfer ${amount} B3TR`,
      }];
    } catch (error) {
      console.error('[DIRECT-B3TR] Error creating clauses:', error);
      return [];
    }
  }, [recipientAddress, amount]);

  // Use VeChain Kit's transaction hook
  const { 
    sendTransaction, 
    status, 
    txReceipt, 
    isTransactionPending,
    error: txError,
  } = useSendTransaction({
    signerAccountAddress: userAddress || account?.address || '',
  });

  // Process VeChain Kit errors
  const processError = useCallback((err: any): TransactionError => {
    const error = new Error() as TransactionError;
    const errorMsg = err?.message?.toLowerCase() || err?.toString()?.toLowerCase() || '';
    
    if (err?.type === 'UserRejectedError' || errorMsg.includes('reject') || errorMsg.includes('denied')) {
      error.type = 'user_rejection';
      error.message = 'Transaction was rejected by the user';
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

  // Wrapper function for sending
  const handleSendTransfer = useCallback(async () => {
    if (!userAddress && !account?.address) {
      const error = new Error('No wallet address available') as TransactionError;
      error.type = 'technical';
      setProcessedError(error);
      setTransactionState('error');
      if (onError) onError(error);
      return;
    }

    if (clauses.length === 0) {
      const error = new Error('Invalid transaction parameters') as TransactionError;
      error.type = 'technical';
      setProcessedError(error);
      setTransactionState('error');
      if (onError) onError(error);
      return;
    }

    try {
      setTransactionState('preparing');
      setProcessedError(null);
      
      console.log('[DIRECT-B3TR] Sending via VeChain Kit:', { clauses, userAddress });
      
      setTransactionState('signing');
      await sendTransaction(clauses);
      
      // Success is handled by status changes
    } catch (err: any) {
      console.error('[DIRECT-B3TR] Transaction failed:', err);
      const processedErr = processError(err);
      setProcessedError(processedErr);
      setTransactionState('error');
      
      if (onError) onError(processedErr);
    }
  }, [userAddress, account?.address, clauses, sendTransaction, processError, onError]);

  // Update state based on VeChain Kit status
  useEffect(() => {
    if (status === 'pending' || status === 'waitingConfirmation') {
      setTransactionState('signing');
    } else if (status === 'success') {
      setTransactionState('success');
      if (txReceipt && onSuccess) {
        onSuccess(txReceipt.meta.txID, txReceipt);
      }
    } else if (status === 'error' && txError) {
      const processedErr = processError(txError);
      setProcessedError(processedErr);
      setTransactionState('error');
      if (onError) onError(processedErr);
    }
  }, [status, txReceipt, txError, onSuccess, onError, processError]);

  return children({
    sendTransfer: handleSendTransfer,
    isPending: isTransactionPending,
    error: processedError,
    txReceipt: txReceipt || null,
    transactionState,
  });
}
