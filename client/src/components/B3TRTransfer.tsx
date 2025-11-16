import { useMemo, useEffect, useState } from 'react';
import { useWallet } from '@/context/WalletContext';
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

interface B3TRTransferProps {
  recipientAddress: string;
  amount: string;
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

export function B3TRTransfer({ 
  recipientAddress, 
  amount, 
  onSuccess, 
  onError,
  children 
}: B3TRTransferProps) {
  const { address: account } = useWallet();
  const [vthoBalance, setVthoBalance] = useState<string | null>(null);
  const [transactionState, setTransactionState] = useState<'idle' | 'preparing' | 'signing' | 'sending' | 'confirming' | 'success' | 'error'>('idle');
  const [processedError, setProcessedError] = useState<TransactionError | null>(null);
  
  useEffect(() => {
    async function checkVTHOBalance() {
      if (!account) return;
      
      try {
        const response = await fetch(`/api/vtho-balance/${account}`);
        if (response.ok) {
          const data = await response.json();
          setVthoBalance(data.vtho);
          
          console.log('[FEE-DELEGATION] VTHO Balance Check:', {
            address: account,
            vthoBalance: data.vtho,
            willUseDelegation: parseFloat(data.vtho) < 10 ? 'YES - VeChain Energy VIP-191' : 'NO - User pays own gas',
            threshold: '10 VTHO'
          });
        }
      } catch (error) {
        console.error('[FEE-DELEGATION] Failed to fetch VTHO balance:', error);
      }
    }
    
    checkVTHOBalance();
  }, [account]);
  
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<any>(null);

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
        comment: `Transfer ${amount} B3TR tokens`,
      }];
    } catch (error) {
      console.error('[B3TR-TRANSFER] Error creating clauses:', error);
      return [];
    }
  }, [recipientAddress, amount]);
  
  // Wait for Connex to be available (VeWorld mobile injects it asynchronously)
  const waitForConnex = async (maxWaitMs = 5000): Promise<boolean> => {
    const checkInterval = 100; // Check every 100ms
    const maxChecks = maxWaitMs / checkInterval;
    
    for (let i = 0; i < maxChecks; i++) {
      if (window.connex) {
        console.log('[B3TR-TRANSFER] ✅ Connex detected after', i * checkInterval, 'ms');
        return true;
      }
      
      if (i === 0) {
        console.log('[B3TR-TRANSFER] Waiting for VeWorld Connex to be available...');
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.error('[B3TR-TRANSFER] Connex not available after', maxWaitMs, 'ms');
    return false;
  };
  
  // Direct Connex transaction function for VeWorld compatibility
  const sendTransaction = async () => {
    // Wait for Connex to be available (VeWorld mobile loads it asynchronously)
    const connexAvailable = await waitForConnex();
    
    if (!connexAvailable || !window.connex) {
      throw new Error('VeWorld wallet not detected. Please ensure you are using the VeWorld app.');
    }
    
    if (!account || clauses.length === 0) {
      throw new Error('Invalid transaction parameters');
    }
    
    try {
      setIsTransactionPending(true);
      setStatus('pending');
      setError(null);
      
      // Use Connex directly for VeWorld mobile compatibility
      const tx = window.connex.vendor.sign('tx', clauses)
        .signer(account)
        .comment(`Transfer ${amount} B3TR tokens to ${recipientAddress}`);
      
      const result = await tx.request();
      
      if (result) {
        // Wait for transaction receipt
        const ticker = window.connex.thor.ticker();
        await ticker.next();
        
        // Get transaction receipt
        const receipt = await window.connex.thor.transaction(result.txid).getReceipt();
        
        if (receipt) {
          setTxReceipt({
            meta: {
              txID: result.txid,
              blockNumber: receipt.meta.blockNumber,
              blockTimestamp: receipt.meta.blockTimestamp
            },
            gasUsed: receipt.gasUsed,
            reverted: receipt.reverted,
            outputs: receipt.outputs
          });
          setStatus('success');
        }
      }
    } catch (err: any) {
      setError(err);
      setStatus('error');
      throw err;
    } finally {
      setIsTransactionPending(false);
    }
  };
  
  // Process and categorize errors
  const processError = (err: any): TransactionError => {
    const error = new Error() as TransactionError;
    
    // Check error message for specific patterns
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
  
  // Track transaction state changes
  useEffect(() => {
    if (isTransactionPending && transactionState !== 'signing') {
      setTransactionState('signing');
    } else if (status === 'pending' && transactionState === 'signing') {
      setTransactionState('sending');
    } else if (status === 'success' && transactionState !== 'success') {
      setTransactionState('success');
    } else if (status === 'error' && transactionState !== 'error') {
      setTransactionState('error');
    }
  }, [isTransactionPending, status, transactionState]);
  
  // Handle successful transaction
  useEffect(() => {
    if (txReceipt?.meta?.txID && onSuccess) {
      console.log('[B3TR-TRANSFER] ✅ Transaction confirmed:', {
        txId: txReceipt.meta.txID,
        blockNumber: txReceipt.meta.blockNumber,
        timestamp: txReceipt.meta.blockTimestamp,
        gasUsed: txReceipt.gasUsed,
      });
      
      setTransactionState('success');
      onSuccess(txReceipt.meta.txID, {
        blockNumber: txReceipt.meta.blockNumber,
        timestamp: txReceipt.meta.blockTimestamp,
        gasUsed: txReceipt.gasUsed,
        receipt: txReceipt
      });
    }
  }, [txReceipt, onSuccess]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      const processedErr = processError(error);
      setProcessedError(processedErr);
      setTransactionState('error');
      
      console.error('[B3TR-TRANSFER] ❌ Transaction failed:', {
        type: processedErr.type,
        message: processedErr.message,
        originalError: error
      });
      
      if (onError) {
        onError(processedErr);
      }
    }
  }, [error, onError]);
  
  const sendTransfer = async () => {
    console.log('[B3TR-TRANSFER] sendTransfer called!', {
      hasAccount: !!account,
      account: account,
      hasConnexNow: !!window.connex,
      connexVersion: window.connex?.version,
      recipientAddress,
      amount,
      clausesLength: clauses.length,
    });
    
    // Reset states
    setTransactionState('preparing');
    setProcessedError(null);
    
    if (!account) {
      const noAccountError = new Error('No wallet connected. Please connect your VeWorld wallet first') as TransactionError;
      noAccountError.type = 'technical';
      console.error('[B3TR-TRANSFER]', noAccountError);
      setProcessedError(noAccountError);
      setTransactionState('error');
      if (onError) onError(noAccountError);
      return;
    }
    
    if (clauses.length === 0) {
      const invalidParamsError = new Error('Invalid transfer parameters. Please check the amount and try again') as TransactionError;
      invalidParamsError.type = 'technical';
      console.error('[B3TR-TRANSFER]', invalidParamsError);
      setProcessedError(invalidParamsError);
      setTransactionState('error');
      if (onError) onError(invalidParamsError);
      return;
    }
    
    // Check if amount is valid
    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        const invalidAmountError = new Error('Invalid amount. Please enter a valid positive number') as TransactionError;
        invalidAmountError.type = 'technical';
        setProcessedError(invalidAmountError);
        setTransactionState('error');
        if (onError) onError(invalidAmountError);
        return;
      }
    } catch (err) {
      const parseError = new Error('Failed to parse amount. Please check the value') as TransactionError;
      parseError.type = 'technical';
      setProcessedError(parseError);
      setTransactionState('error');
      if (onError) onError(parseError);
      return;
    }
    
    // Check if sendTransaction is a function before calling it
    if (typeof sendTransaction !== 'function') {
      const walletError = new Error('Wallet transaction function not available. Please refresh the page and try again') as TransactionError;
      walletError.type = 'technical';
      console.error('[B3TR-TRANSFER] sendTransaction is not a function:', {
        sendTransaction,
        type: typeof sendTransaction
      });
      setProcessedError(walletError);
      setTransactionState('error');
      if (onError) onError(walletError);
      return;
    }
    
    const willDelegate = vthoBalance && parseFloat(vthoBalance) < 10;
    
    console.log('[B3TR-TRANSFER] 🚀 Initiating B3TR Transfer:', {
      from: account,
      to: recipientAddress,
      amount: `${amount} B3TR`,
      vthoBalance: vthoBalance || 'checking...',
      feeDelegation: willDelegate ? '✅ ENABLED - VeChain Energy will sponsor' : '❌ DISABLED - User pays own gas',
      walletType: 'VeWorld',
      timestamp: new Date().toISOString()
    });
    
    try {
      setTransactionState('signing');
      await sendTransaction();
      
      console.log('[B3TR-TRANSFER] ✅ Transaction submitted successfully!', {
        feeDelegation: willDelegate ? 'SPONSORED by VeChain Energy' : 'SELF-PAID by user',
        status: 'awaiting_confirmation'
      });
      
      setTransactionState('confirming');
    } catch (err: any) {
      const processedErr = processError(err);
      setProcessedError(processedErr);
      setTransactionState('error');
      
      console.error('[B3TR-TRANSFER] ❌ Transaction failed:', {
        type: processedErr.type,
        message: processedErr.message,
        details: err
      });
      
      if (onError) onError(processedErr);
    }
  };
  
  return children({
    sendTransfer,
    isPending: isTransactionPending,
    error: processedError,
    txReceipt,
    transactionState
  });
}