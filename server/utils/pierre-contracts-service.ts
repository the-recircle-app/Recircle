// Contracts service following Pierre's exact VeBetterDAO integration pattern
import { ThorClient, VeChainPrivateKeySigner, VeChainProvider } from '@vechain/sdk-network';
import { addressUtils, unitsUtils } from '@vechain/sdk-core';
import { Submission } from '../../shared/pierre-vebetterdao-types';
import { VeBetterDAOConfig, NetworkConfig, RECIRCLE_EARN_ABI } from '../../shared/pierre-vebetterdao-types';

export class PierreContractsService {
  private thor: ThorClient;
  private contract: any;

  constructor() {
    // Initialize Thor client (following Pierre's pattern)
    this.thor = new ThorClient(NetworkConfig.NETWORK_URL, {
      isPollingEnabled: false,
    });

    // Only initialize contract if we have addresses configured
    if (VeBetterDAOConfig.CONTRACT_ADDRESS && NetworkConfig.ADMIN_MNEMONIC) {
      this.initializeContract();
    } else {
      console.log('ℹ️  Pierre VeBetterDAO contract system disabled (using direct B3TR distribution instead)');
    }
  }

  private initializeContract() {
    try {
      // Handle real private key from environment
      let adminPrivateKey: Buffer;
      
      if (NetworkConfig.ADMIN_MNEMONIC.startsWith('0x')) {
        // Remove 0x prefix if present
        adminPrivateKey = Buffer.from(NetworkConfig.ADMIN_MNEMONIC.slice(2), 'hex');
      } else if (NetworkConfig.ADMIN_MNEMONIC.length === 64) {
        // Raw hex private key
        adminPrivateKey = Buffer.from(NetworkConfig.ADMIN_MNEMONIC, 'hex');
      } else {
        console.error('❌ Invalid private key format');
        return;
      }
      
      this.contract = this.thor.contracts.load(
        VeBetterDAOConfig.CONTRACT_ADDRESS,
        RECIRCLE_EARN_ABI,
        new VeChainPrivateKeySigner(
          adminPrivateKey, 
          new VeChainProvider(this.thor)
        )
      );
      
      console.log('✅ ReCircle VeBetterDAO contract initialized with real key');
      console.log(`🏛️ Contract address: ${VeBetterDAOConfig.CONTRACT_ADDRESS}`);
    } catch (error) {
      console.error('❌ Contract initialization error:', error);
    }
  }

  async registerSubmission(submission: Submission): Promise<{ success: boolean, txHash?: string, error?: string }> {
    if (!this.contract) {
      console.error('❌ Contract not initialized');
      return { success: false, error: 'Contract not initialized' };
    }

    try {
      console.log(`🎯 VeBetterDAO Distribution: ${VeBetterDAOConfig.REWARD_AMOUNT} B3TR tokens to ${submission.address}`);
      console.log(`📋 App ID: ${VeBetterDAOConfig.APP_ID}`);
      console.log(`🏛️ Contract: ${VeBetterDAOConfig.CONTRACT_ADDRESS}`);
      
      // Convert reward amount to wei (multiply by 10^18)
      const amountInWei = BigInt(VeBetterDAOConfig.REWARD_AMOUNT) * BigInt('1000000000000000000');
      
      const result = await (
        await this.contract.transact.distributeReward(
          VeBetterDAOConfig.APP_ID, // bytes32 appId
          amountInWei, // uint256 amount in wei
          submission.address, // address recipient
          `Receipt validation: ${submission.timestamp}` // string proof
        )
      ).wait();
      
      const isSuccess = !result.reverted;
      
      if (isSuccess) {
        console.log('✅ VeBetterDAO B3TR tokens distributed successfully');
        console.log('🔗 Transaction hash:', result.meta.txID);
        return { success: true, txHash: result.meta.txID };
      } else {
        console.error('❌ VeBetterDAO transaction reverted');
        return { success: false, error: 'Transaction reverted' };
      }
      
    } catch (error) {
      console.error('❌ VeBetterDAO token distribution error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async validateSubmission(submission: Submission): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log(`🔍 Checking submission limits for ${submission.address}`);
      
      const isMaxSubmissionsReached = (
        await this.contract.read.isUserMaxSubmissionsReached(submission.address)
      )[0];
      
      if (Boolean(isMaxSubmissionsReached) === true) {
        throw new Error(`ReCircle: Max submissions reached for this cycle (${VeBetterDAOConfig.MAX_SUBMISSIONS_PER_CYCLE})`);
      }
      
      console.log('✅ Submission validation passed');
      
    } catch (error) {
      console.error('❌ Submission validation error:', error);
      throw error;
    }
  }

  // Utility method to check contract status
  async getContractStatus(): Promise<any> {
    if (!this.contract) {
      return { initialized: false, error: 'Contract not initialized' };
    }

    try {
      const currentCycle = await this.contract.read.getCurrentCycle();
      const cycleDuration = await this.contract.read.cycleDuration();
      const maxSubmissions = await this.contract.read.maxSubmissionsPerCycle();
      
      return {
        initialized: true,
        currentCycle: currentCycle[0]?.toString(),
        cycleDuration: cycleDuration[0]?.toString(),
        maxSubmissions: maxSubmissions[0]?.toString(),
        contractAddress: VeBetterDAOConfig.CONTRACT_ADDRESS,
      };
    } catch (error) {
      return { initialized: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const pierreContractsService = new PierreContractsService();