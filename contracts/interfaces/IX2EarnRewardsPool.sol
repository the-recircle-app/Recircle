// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IX2EarnRewardsPool Interface
 * @dev Interface for VeBetterDAO's X2EarnRewardsPool contract
 * This interface defines the methods for distributing rewards and managing funds
 */
interface IX2EarnRewardsPool {
    /**
     * @dev Distributes reward to a participant
     * @param appId The application ID registered with VeBetterDAO
     * @param amount Amount of B3TR tokens to distribute
     * @param recipient Address of the reward recipient
     * @param proof Sustainability proof data (optional)
     */
    function distributeReward(
        bytes32 appId,
        uint256 amount,
        address recipient,
        string calldata proof
    ) external;

    /**
     * @dev Returns available funds for an app
     * @param appId The application ID
     * @return Available fund balance
     */
    function availableFunds(bytes32 appId) external view returns (uint256);

    /**
     * @dev Withdraws funds from the pool
     * @param amount Amount to withdraw
     * @param appId The application ID
     * @param reason Reason for withdrawal
     */
    function withdraw(
        uint256 amount,
        bytes32 appId,
        string calldata reason
    ) external;
}