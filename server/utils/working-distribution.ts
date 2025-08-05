/**
 * Working B3TR Distribution - Production Ready
 * Fixes all HDNode and thor-devkit API issues
 */

import * as thor from 'thor-devkit';

// Real VeBetterDAO contract addresses from environment
const CONTRACTS = {
    B3TR_TOKEN: process.env.B3TR_CONTRACT_ADDRESS || '',
    X2EARN_REWARDS_POOL: process.env.X2EARNREWARDSPOOL_ADDRESS || ''
};

// Working VeChain testnet RPC endpoint
const TESTNET_RPC = 'https://testnet.veblocks.net';

// ERC20 transfer function signature
const ERC20_TRANSFER_SIG = 'transfer(address,uint256)';

/**
 * Working B3TR distribution using correct thor-devkit APIs
 */
export async function distributeRealB3TR(
    recipientAddress: string,
    totalAmount: number,
    userId: number
): Promise<{
    success: boolean;
    userReward: number;
    appReward: number;
    transactions: {
        user?: string;
        app?: string;
    };
    explorerUrls: {
        user?: string;
        app?: string;
    };
    network: string;
    error?: string;
}> {
    console.log(`[REAL-B3TR] 🔥 DISTRIBUTION FUNCTION CALLED - Starting error-resistant distribution`);
    
    try {
        console.log(`[REAL-B3TR] 🚀 Starting real B3TR distribution`);
        console.log(`[REAL-B3TR] Recipient: ${recipientAddress}`);
        console.log(`[REAL-B3TR] Total: ${totalAmount} B3TR → User: ${totalAmount * 0.7}, App: ${totalAmount * 0.3}`);

        // Check environment variables with detailed logging
        const privateKey = process.env.DISTRIBUTOR_PRIVATE_KEY;
        console.log(`[REAL-B3TR] Environment check:`);
        console.log(`[REAL-B3TR] - DISTRIBUTOR_PRIVATE_KEY: ${privateKey ? 'SET' : 'MISSING'}`);
        console.log(`[REAL-B3TR] - B3TR_CONTRACT_ADDRESS: ${CONTRACTS.B3TR_TOKEN || 'MISSING'}`);
        console.log(`[REAL-B3TR] - X2EARNREWARDSPOOL_ADDRESS: ${CONTRACTS.X2EARN_REWARDS_POOL || 'MISSING'}`);

        if (!privateKey) {
            throw new Error('DISTRIBUTOR_PRIVATE_KEY environment variable is missing');
        }

        if (!CONTRACTS.B3TR_TOKEN) {
            throw new Error('B3TR_CONTRACT_ADDRESS environment variable is missing');
        }

        console.log(`[REAL-B3TR] Connected to VeChain testnet at ${TESTNET_RPC}`);

        // Create HDNode with robust error handling and validation
        let distributorWallet: thor.HDNode;
        try {
            console.log(`[REAL-B3TR] Private key validation:`);
            console.log(`[REAL-B3TR] - Raw length: ${privateKey.length}`);
            console.log(`[REAL-B3TR] - Has 0x prefix: ${privateKey.startsWith('0x')}`);
            
            // Clean and validate the private key
            const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
            console.log(`[REAL-B3TR] - Clean key length: ${cleanPrivateKey.length}`);
            
            if (cleanPrivateKey.length !== 64) {
                throw new Error(`Invalid private key length: ${cleanPrivateKey.length}, expected 64 hex characters`);
            }
            
            // Validate hex format
            if (!/^[0-9a-fA-F]+$/.test(cleanPrivateKey)) {
                throw new Error('Private key contains invalid characters (not hex)');
            }
            
            // Create buffer with proper validation
            let privateKeyBuffer: Buffer;
            try {
                privateKeyBuffer = Buffer.from(cleanPrivateKey, 'hex');
                console.log(`[REAL-B3TR] - Buffer created successfully, length: ${privateKeyBuffer.length}`);
            } catch (bufferError) {
                throw new Error(`Failed to create buffer from private key: ${bufferError}`);
            }
            
            // Create HDNode with comprehensive error handling
            console.log(`[REAL-B3TR] Creating HDNode from validated private key...`);
            distributorWallet = thor.HDNode.fromPrivateKey(privateKeyBuffer);
            
            const distributorAddress = `0x${distributorWallet.address.toString('hex')}`;
            console.log(`[REAL-B3TR] Distributor wallet: ${distributorAddress}`);
        } catch (hdError) {
            console.log(`[REAL-B3TR] HDNode creation failed:`, hdError);
            const errorMessage = hdError instanceof Error ? hdError.message : String(hdError);
            throw new Error(`HDNode creation failed: ${errorMessage}`);
        }

        // Calculate 70/30 split
        const userReward = totalAmount * 0.7;
        const appReward = totalAmount * 0.3;
        const appFundAddress = process.env.APP_FUND_WALLET || '0x119761865b79bea9e7924edaa630942322ca09d1';

        // Convert to wei (18 decimals) using basic math
        const userAmountWei = BigInt(Math.floor(userReward * 1e18)).toString();
        const appAmountWei = BigInt(Math.floor(appReward * 1e18)).toString();

        console.log(`[REAL-B3TR] User: ${userReward} B3TR (${userAmountWei} wei) → ${recipientAddress}`);
        console.log(`[REAL-B3TR] App: ${appReward} B3TR (${appAmountWei} wei) → ${appFundAddress}`);

        // Encode transfer function calls manually
        const transferSelector = thor.keccak256(ERC20_TRANSFER_SIG).slice(0, 4);
        
        // User transfer data
        const userTransferData = Buffer.concat([
            transferSelector,
            Buffer.from(recipientAddress.slice(2).padStart(64, '0'), 'hex'),
            Buffer.from(BigInt(userAmountWei).toString(16).padStart(64, '0'), 'hex')
        ]);

        // App transfer data
        const appTransferData = Buffer.concat([
            transferSelector,
            Buffer.from(appFundAddress.slice(2).padStart(64, '0'), 'hex'),
            Buffer.from(BigInt(appAmountWei).toString(16).padStart(64, '0'), 'hex')
        ]);

        // Get best block
        console.log(`[REAL-B3TR] Fetching best block from ${TESTNET_RPC}/blocks/best`);
        const response = await fetch(`${TESTNET_RPC}/blocks/best`);
        if (!response.ok) {
            throw new Error(`Failed to fetch best block: ${response.status} ${response.statusText}`);
        }
        
        const bestBlock = await response.json();
        console.log(`[REAL-B3TR] Using block ${bestBlock.number} (${bestBlock.id})`);

        // Build transactions with proper nonce
        const baseNonce = Date.now();

        // User transaction
        const userTxBody = {
            chainTag: 0x27,
            blockRef: bestBlock.id.slice(0, 18),
            expiration: 32,
            clauses: [{
                to: CONTRACTS.B3TR_TOKEN,
                value: '0x0',
                data: `0x${userTransferData.toString('hex')}`
            }],
            gasPriceCoef: 0,
            gas: 50000,
            dependsOn: null,
            nonce: baseNonce
        };

        // App transaction
        const appTxBody = {
            chainTag: 0x27,
            blockRef: bestBlock.id.slice(0, 18),
            expiration: 32,
            clauses: [{
                to: CONTRACTS.B3TR_TOKEN,
                value: '0x0',
                data: `0x${appTransferData.toString('hex')}`
            }],
            gasPriceCoef: 0,
            gas: 50000,
            dependsOn: null,
            nonce: baseNonce + 1
        };

        // Sign transactions
        console.log(`[REAL-B3TR] Signing user transaction...`);
        const userTx = new thor.Transaction(userTxBody);
        const userSignature = thor.secp256k1.sign(userTx.signingHash(), distributorWallet.privateKey!);
        userTx.signature = userSignature;

        console.log(`[REAL-B3TR] Signing app transaction...`);
        const appTx = new thor.Transaction(appTxBody);
        const appSignature = thor.secp256k1.sign(appTx.signingHash(), distributorWallet.privateKey!);
        appTx.signature = appSignature;

        // Submit transactions
        const userTxRaw = `0x${userTx.encode().toString('hex')}`;
        const appTxRaw = `0x${appTx.encode().toString('hex')}`;

        console.log(`[REAL-B3TR] Submitting user transaction to ${TESTNET_RPC}/transactions`);
        const userTxResponse = await fetch(`${TESTNET_RPC}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw: userTxRaw })
        });

        console.log(`[REAL-B3TR] Submitting app transaction to ${TESTNET_RPC}/transactions`);
        const appTxResponse = await fetch(`${TESTNET_RPC}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw: appTxRaw })
        });

        if (!userTxResponse.ok) {
            const userError = await userTxResponse.text();
            throw new Error(`User transaction failed: ${userTxResponse.status} - ${userError}`);
        }

        if (!appTxResponse.ok) {
            const appError = await appTxResponse.text();
            throw new Error(`App transaction failed: ${appTxResponse.status} - ${appError}`);
        }

        const userTxResult = await userTxResponse.json();
        const appTxResult = await appTxResponse.json();

        const userTxId = userTxResult.id;
        const appTxId = appTxResult.id;

        console.log(`[REAL-B3TR] ✅ User transaction submitted: ${userTxId}`);
        console.log(`[REAL-B3TR] ✅ App transaction submitted: ${appTxId}`);

        const explorerUrls = {
            user: `https://explore-testnet.vechain.org/transactions/${userTxId}`,
            app: `https://explore-testnet.vechain.org/transactions/${appTxId}`
        };

        console.log(`[REAL-B3TR] Explorer URLs:`);
        console.log(`[REAL-B3TR] - User: ${explorerUrls.user}`);
        console.log(`[REAL-B3TR] - App: ${explorerUrls.app}`);

        return {
            success: true,
            userReward,
            appReward,
            transactions: {
                user: userTxId,
                app: appTxId
            },
            explorerUrls,
            network: 'VeChain Testnet'
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`[REAL-B3TR] ❌ Distribution failed: ${errorMessage}`);
        console.log(`[REAL-B3TR] Full error:`, error);
        
        return {
            success: false,
            userReward: 0,
            appReward: 0,
            transactions: {},
            explorerUrls: {},
            network: 'VeChain Testnet',
            error: errorMessage
        };
    }
}