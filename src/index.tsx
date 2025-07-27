/**
 * ReCircle App - Main Entry Point
 * Blockchain-powered circular economy platform
 * Rewards sustainable purchases with B3TR tokens
 */

import React from 'react';
import { Router, Route, Switch } from 'wouter';
import { Dashboard } from './pages/Dashboard';
import { ReceiptUpload } from './components/ReceiptUpload';

function App() {
  // Mock user data for demonstration
  const userData = {
    balance: 47,
    streak: 12,
    totalReceipts: 18
  };

  const handleReceiptSubmit = (receipt: File) => {
    // Internal submission logic redacted for privacy
    console.log('Receipt submitted:', receipt.name);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ReCircle</h1>
        <p>Sustainable Living • Blockchain Rewards • Circular Economy</p>
      </header>

      <Router>
        <Switch>
          <Route path="/" component={() => 
            <Dashboard 
              userBalance={userData.balance}
              currentStreak={userData.streak}
              totalReceipts={userData.totalReceipts}
            />
          } />
          
          <Route path="/scan" component={() => 
            <ReceiptUpload onReceiptSubmit={handleReceiptSubmit} />
          } />
        </Switch>
      </Router>

      <footer className="app-footer">
        <p>Powered by VeBetterDAO • VeChain Thor Blockchain</p>
      </footer>
    </div>
  );
}

export default App;