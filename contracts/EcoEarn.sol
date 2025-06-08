// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import './interfaces/IX2EarnRewardsPool.sol';

/**
 * @title EcoEarn - ReCircle Sustainability Rewards Contract
 * @dev Smart contract for distributing B3TR tokens through VeBetterDAO's x2Earn system
 * Validates and rewards sustainable transportation behaviors on the ReCircle platform
 * Follows VeBetterDAO standards with AccessControl and submission tracking
 */
contract EcoEarn is AccessControl {
    
    // VeBetterDAO Integration
    bytes32 public appId;
    IX2EarnRewardsPool public immutable x2EarnRewardsPoolContract;
    address public immutable B3TR_TOKEN;
    

    
    // Reward Categories
    enum RewardCategory {
        THRIFT_STORE,
        GAMING_PREOWNED,
        RIDESHARE,
        EV_RENTAL,
        STORE_ADDITION,
        ACHIEVEMENT
    }
    
    // Reward Configuration
    struct RewardConfig {
        uint256 baseReward;      // Base reward amount in wei
        uint256 maxReward;       // Maximum reward cap
        bool isActive;           // Whether this category is active
    }
    
    // Receipt Validation Data
    struct ReceiptProof {
        string storeName;
        string category;
        uint256 amount;
        uint256 timestamp;
        string ipfsHash;         // IPFS hash of receipt image
        uint256 confidenceScore; // AI confidence score (0-100)
    }
    
    // Events
    event RewardDistributed(
        address indexed recipient,
        uint256 amount,
        RewardCategory category,
        string storeName,
        string receiptHash
    );
    
    event RewardConfigUpdated(
        RewardCategory category,
        uint256 baseReward,
        uint256 maxReward,
        bool isActive
    );
    
    event ReceiptValidated(
        address indexed user,
        string storeName,
        uint256 amount,
        uint256 confidenceScore,
        string ipfsHash
    );
    
    // Storage
    mapping(RewardCategory => RewardConfig) public rewardConfigs;
    mapping(address => uint256) public totalEarned;
    mapping(string => bool) public processedReceipts; // Prevent duplicate processing
    
    // Statistics
    uint256 public totalRewardsDistributed;
    uint256 public totalReceiptsProcessed;
    uint256 public totalCO2Saved; // Environmental impact tracking
    

    
    /**
     * @dev Constructor
     * @param _appId VeBetterDAO App ID for ReCircle
     * @param _rewardsPool VeBetterDAO rewards pool contract
     * @param _b3trToken B3TR token contract address
     */
    constructor(
        address _admin,
        bytes32 _appId,
        address _rewardsPool,
        address _b3trToken
    ) {
        require(_admin != address(0), 'EcoEarn: admin cannot be zero address');
        require(_rewardsPool != address(0), 'EcoEarn: rewards pool cannot be zero address');
        appId = _appId;
        x2EarnRewardsPoolContract = IX2EarnRewardsPool(_rewardsPool);
        B3TR_TOKEN = _b3trToken;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        
        // Initialize default reward configurations
        _initializeRewardConfigs();
    }
    
    /**
     * @dev Initialize default reward configurations
     */
    function _initializeRewardConfigs() private {
        // Thrift store receipts: 1-50 B3TR based on amount
        rewardConfigs[RewardCategory.THRIFT_STORE] = RewardConfig({
            baseReward: 1 ether,
            maxReward: 50 ether,
            isActive: true
        });
        
        // Gaming pre-owned items: 2-30 B3TR
        rewardConfigs[RewardCategory.GAMING_PREOWNED] = RewardConfig({
            baseReward: 2 ether,
            maxReward: 30 ether,
            isActive: true
        });
        
        // Rideshare services: 1-20 B3TR
        rewardConfigs[RewardCategory.RIDESHARE] = RewardConfig({
            baseReward: 1 ether,
            maxReward: 20 ether,
            isActive: true
        });
        
        // EV rentals: 5-100 B3TR
        rewardConfigs[RewardCategory.EV_RENTAL] = RewardConfig({
            baseReward: 5 ether,
            maxReward: 100 ether,
            isActive: true
        });
        
        // Store addition rewards: Fixed 25 B3TR
        rewardConfigs[RewardCategory.STORE_ADDITION] = RewardConfig({
            baseReward: 25 ether,
            maxReward: 25 ether,
            isActive: true
        });
        
        // Achievement rewards: 10-100 B3TR
        rewardConfigs[RewardCategory.ACHIEVEMENT] = RewardConfig({
            baseReward: 10 ether,
            maxReward: 100 ether,
            isActive: true
        });
    }
    
    /**
     * @dev Distribute reward for validated receipt
     * @param recipient Address to receive the reward
     * @param category Reward category
     * @param proof Receipt validation proof data
     * @param rewardAmount Calculated reward amount
     */
    function distributeReward(
        address recipient,
        RewardCategory category,
        ReceiptProof calldata proof,
        uint256 rewardAmount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        require(rewardConfigs[category].isActive, "Category not active");
        require(rewardAmount > 0, "Invalid reward amount");
        require(rewardAmount <= rewardConfigs[category].maxReward, "Exceeds max reward");
        require(!processedReceipts[proof.ipfsHash], "Receipt already processed");
        require(proof.confidenceScore >= 70, "Confidence score too low");
        
        // Mark receipt as processed
        processedReceipts[proof.ipfsHash] = true;
        
        // Update statistics
        totalEarned[recipient] += rewardAmount;
        totalRewardsDistributed += rewardAmount;
        totalReceiptsProcessed++;
        
        // Calculate environmental impact based on category
        uint256 co2Saved = _calculateCO2Impact(category, proof.amount);
        totalCO2Saved += co2Saved;
        
        // Distribute reward through VeBetterDAO's X2EarnRewardsPool
        string memory sustainabilityProof = string.concat(
            '{"receiptHash":"', proof.ipfsHash, 
            '","storeName":"', proof.storeName,
            '","category":"', _getCategoryName(category),
            '","amount":"', Strings.toString(proof.amount),
            '","co2Saved":"', Strings.toString(co2Saved), '"}'
        );
        
        x2EarnRewardsPoolContract.distributeReward(
            appId,
            rewardAmount,
            recipient,
            sustainabilityProof
        );
        
        // Emit events
        emit RewardDistributed(
            recipient,
            rewardAmount,
            category,
            proof.storeName,
            proof.ipfsHash
        );
        
        emit ReceiptValidated(
            recipient,
            proof.storeName,
            proof.amount,
            proof.confidenceScore,
            proof.ipfsHash
        );
    }
    
    /**
     * @dev Get category name as string
     * @param category Reward category enum
     * @return Category name as string
     */
    function _getCategoryName(RewardCategory category) private pure returns (string memory) {
        if (category == RewardCategory.THRIFT_STORE) return "thrift_store";
        if (category == RewardCategory.GAMING_PREOWNED) return "gaming_preowned";
        if (category == RewardCategory.RIDESHARE) return "rideshare";
        if (category == RewardCategory.EV_RENTAL) return "ev_rental";
        if (category == RewardCategory.STORE_ADDITION) return "store_addition";
        if (category == RewardCategory.ACHIEVEMENT) return "achievement";
        return "unknown";
    }

    /**
     * @dev Calculate CO2 impact based on purchase category
     * @param category Purchase category
     * @param amount Purchase amount in cents
     * @return co2Saved CO2 saved in grams
     */
    function _calculateCO2Impact(RewardCategory category, uint256 amount) private pure returns (uint256) {
        if (category == RewardCategory.THRIFT_STORE) {
            // Thrift store: ~2.3kg CO2 saved per $10 spent
            return (amount * 230) / 1000; // Convert to grams
        } else if (category == RewardCategory.GAMING_PREOWNED) {
            // Pre-owned gaming: ~1.5kg CO2 saved per $10
            return (amount * 150) / 1000;
        } else if (category == RewardCategory.RIDESHARE) {
            // Rideshare: ~0.5kg CO2 saved per $10 (vs private car)
            return (amount * 50) / 1000;
        } else if (category == RewardCategory.EV_RENTAL) {
            // EV rental: ~3kg CO2 saved per $10 (vs gas car)
            return (amount * 300) / 1000;
        }
        return 0;
    }
    
    /**
     * @dev Update reward configuration for a category
     * @param category Reward category to update
     * @param baseReward New base reward amount
     * @param maxReward New maximum reward amount
     * @param isActive Whether the category should be active
     */
    function updateRewardConfig(
        RewardCategory category,
        uint256 baseReward,
        uint256 maxReward,
        bool isActive
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(baseReward <= maxReward, "Base reward exceeds max");
        
        rewardConfigs[category] = RewardConfig({
            baseReward: baseReward,
            maxReward: maxReward,
            isActive: isActive
        });
        
        emit RewardConfigUpdated(category, baseReward, maxReward, isActive);
    }
    
    /**
     * @dev Get reward configuration for a category
     * @param category Reward category
     * @return RewardConfig structure
     */
    function getRewardConfig(RewardCategory category) external view returns (RewardConfig memory) {
        return rewardConfigs[category];
    }
    
    /**
     * @dev Get user statistics
     * @param user User address
     * @return totalEarned Total B3TR earned by user
     */
    function getUserStats(address user) external view returns (uint256) {
        return totalEarned[user];
    }
    
    /**
     * @dev Get platform statistics
     * @return totalRewards Total rewards distributed
     * @return totalReceipts Total receipts processed
     * @return totalCO2 Total CO2 saved in grams
     */
    function getPlatformStats() external view returns (uint256 totalRewards, uint256 totalReceipts, uint256 totalCO2) {
        return (totalRewardsDistributed, totalReceiptsProcessed, totalCO2Saved);
    }
    
    /**
     * @dev Check if a receipt has been processed
     * @param ipfsHash IPFS hash of the receipt
     * @return bool Whether receipt was processed
     */
    function isReceiptProcessed(string calldata ipfsHash) external view returns (bool) {
        return processedReceipts[ipfsHash];
    }
}