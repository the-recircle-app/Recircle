/**
 * Dashboard Component - User Token Balance & Impact Tracking
 * Demonstrates the user interface for viewing rewards and sustainability impact
 * Internal blockchain integration redacted for privacy – available in private repo
 */

import React from 'react';

interface DashboardProps {
  userBalance: number;
  currentStreak: number;
  totalReceipts: number;
}

export function Dashboard({ userBalance, currentStreak, totalReceipts }: DashboardProps) {
  // Mock data for demonstration purposes
  const impactData = {
    co2Saved: Math.round(totalReceipts * 2.3), // kg CO2
    wasteReduced: Math.round(totalReceipts * 1.8), // kg waste
    circularTransactions: totalReceipts
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Your Sustainability Impact</h1>
        <p>Rewarding circular economy participation with B3TR tokens</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card balance-card">
          <div className="stat-icon">🪙</div>
          <div className="stat-content">
            <h3>B3TR Balance</h3>
            <div className="stat-value">{userBalance}</div>
            <p className="stat-description">VeBetterDAO tokens earned</p>
          </div>
        </div>

        <div className="stat-card streak-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Current Streak</h3>
            <div className="stat-value">{currentStreak} days</div>
            <p className="stat-description">Consecutive sustainable purchases</p>
          </div>
        </div>

        <div className="stat-card impact-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <h3>CO₂ Saved</h3>
            <div className="stat-value">{impactData.co2Saved} kg</div>
            <p className="stat-description">Carbon footprint reduction</p>
          </div>
        </div>

        <div className="stat-card waste-card">
          <div className="stat-icon">♻️</div>
          <div className="stat-content">
            <h3>Waste Reduced</h3>
            <div className="stat-value">{impactData.wasteReduced} kg</div>
            <p className="stat-description">Landfill waste prevented</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Sustainable Purchases</h3>
        <div className="activity-list">
          {/* Internal transaction history logic redacted for privacy */}
          <div className="activity-item">
            <span className="activity-type">🛍️ Thrift Store</span>
            <span className="activity-reward">+8 B3TR</span>
            <span className="activity-date">2 days ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-type">🚗 Uber Ride</span>
            <span className="activity-reward">+5 B3TR</span>
            <span className="activity-date">5 days ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-type">🎮 GameStop Pre-owned</span>
            <span className="activity-reward">+8 B3TR</span>
            <span className="activity-date">1 week ago</span>
          </div>
        </div>
      </div>

      <div className="vebetterdao-info">
        <h4>Powered by VeBetterDAO</h4>
        <p>70% to users • 15% to creator fund • 15% to app fund</p>
        <p>Building a sustainable future through blockchain rewards</p>
      </div>
    </div>
  );
}