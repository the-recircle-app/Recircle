import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { WalletProvider } from "./context/WalletContext";
import { AchievementProvider } from "./context/AchievementContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import ConnectWallet from "./pages/ConnectWallet";
import ScanReceipt from "./pages/ScanReceipt";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Dashboard from "./pages/TransportationLocations";
import TransactionHistory from "./pages/TransactionHistory";
import NotFound from "./pages/NotFound";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 text-gray-100">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/connect-wallet" component={ConnectWallet} />
      
      {/* Protected routes */}
      <Route path="/scan">
        <ProtectedRoute>
          <ScanReceipt />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/achievements">
        <ProtectedRoute>
          <Achievements />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/transactions">
        <ProtectedRoute>
          <TransactionHistory />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    console.log("ReCircle Transportation Rewards Platform initialized");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <AchievementProvider>
          <TooltipProvider>
            <Layout>
              <Router />
            </Layout>
            <Toaster />
          </TooltipProvider>
        </AchievementProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;