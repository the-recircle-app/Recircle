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
      console.log('⚠️ Contract not initialized - missing configuration');
    }
  }

  private initializeContract() {
    try {
      // Simplified mnemonic handling for testing
      const adminPrivateKey = Buffer.from('dummy_private_key_for_testing', 'hex');
      
      this.contract = this.thor.contracts.load(
        VeBetterDAOConfig.CONTRACT_ADDRESS,
        RECIRCLE_EARN_ABI,
        new VeChainPrivateKeySigner(
          Buffer.from(adminPrivateKey), 
          new VeChainProvider(this.thor)
        )
      );
      
      console.log('✅ ReCircle VeBetterDAO contract initialized');
    } catch (error) {
      console.error('❌ Contract initialization error:', error);
    }
  }

  async registerSubmission(submission: Submission): Promise<boolean> {
    if (!this.contract) {
      console.error('❌ Contract not initialized');
      return false;
    }

    let isSuccess = false;
    try {
      console.log(`🎯 Distributing ${VeBetterDAOConfig.REWARD_AMOUNT} B3TR tokens to ${submission.address}`);
      
      const result = await (
        await this.contract.transact.registerValidSubmission(
          submission.address, 
          BigInt(VeBetterDAOConfig.REWARD_AMOUNT + '000000000000000000') // 1 token = 1e18 wei
        )
      ).wait();
      
      isSuccess = !result.reverted;
      
      if (isSuccess) {
        console.log('✅ B3TR tokens distributed successfully');
        console.log('🔗 Transaction hash:', result.meta.txID);
      } else {
        console.error('❌ Transaction reverted');
      }
      
    } catch (error) {
      console.error('❌ Token distribution error:', error);
    }

    return isSuccess;
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