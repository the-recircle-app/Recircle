import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "./context/WalletContext";
import { AchievementProvider } from "./context/AchievementContext";
import DevResetToolkit from "@/components/DevResetToolkit";
import EnvCheck from "./components/EnvCheck";
import NotFound from "@/pages/not-found";
import ImpactExplorer from "./pages/impact-explorer";
import Home from "./pages/home";
import ScanReceipt from "./pages/scan";
import Profile from "./pages/profile";
import ConnectWallet from "./pages/connect-wallet";
import Achievements from "./pages/achievements-new";
import Stores from "./pages/stores";
import StoreDetail from "./pages/store-detail";
import AddStoreForm from "./pages/add-store-form";
import InviteFriend from "./pages/invite-friend";
import TransactionExplorer from "./pages/transactions";
import JoinWithReferral from "./pages/join-with-referral";
import Redeem from "./pages/redeem";
import LogoShowcase from "./pages/logo-showcase";
import PendingSubmissionsAdmin from "./pages/admin/pending-submissions";
import TestAutoConnect from "./pages/test-auto-connect";
import TestWalletConnect from "./pages/test-wallet-connect";
import DAOWalletConnectPage from "./pages/dao-wallet-connect";
import SimpleWalletConnectPage from "./pages/simple-wallet-connect";
import MinimalConnect from "./pages/minimal-connect";
import HelpPage from "./pages/help";
import FeedbackPage from "./pages/feedback";
import RewardHistory from "./pages/reward-history";
import ContractStatus from "./pages/contract-status";
import { useEffect } from "react";
import { vechain } from "./lib/vechain";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-900 text-gray-100">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/connect-wallet" component={ConnectWallet} />
      <Route path="/join" component={JoinWithReferral} />
      <Route path="/logo-showcase" component={LogoShowcase} />
      <Route path="/test-auto-connect" component={TestAutoConnect} />
      <Route path="/test-wallet-connect" component={TestWalletConnect} />
      <Route path="/dao-wallet-connect" component={DAOWalletConnectPage} />
      <Route path="/simple-wallet-connect" component={SimpleWalletConnectPage} />
      <Route path="/minimal-connect" component={MinimalConnect} />
      <Route path="/help" component={HelpPage} />
      <Route path="/feedback" component={FeedbackPage} />
      
      {/* Admin routes */}
      <Route path="/admin/pending-submissions" component={PendingSubmissionsAdmin} />
      
      {/* Protected routes - require wallet connection */}
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
      <Route path="/stores">
        <ProtectedRoute>
          <Stores />
        </ProtectedRoute>
      </Route>
      <Route path="/stores/:id">
        <ProtectedRoute>
          <StoreDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/add-store">
        <ProtectedRoute>
          <AddStoreForm />
        </ProtectedRoute>
      </Route>
      <Route path="/invite-friend">
        <ProtectedRoute>
          <InviteFriend />
        </ProtectedRoute>
      </Route>
      <Route path="/transactions">
        <ProtectedRoute>
          <TransactionExplorer />
        </ProtectedRoute>
      </Route>
      <Route path="/rewards">
        <ProtectedRoute>
          <RewardHistory />
        </ProtectedRoute>
      </Route>
      <Route path="/contract-status">
        <ProtectedRoute>
          <ContractStatus />
        </ProtectedRoute>
      </Route>
      <Route path="/redeem">
        <ProtectedRoute>
          <Redeem />
        </ProtectedRoute>
      </Route>
      <Route path="/impact-explorer">
        <ProtectedRoute>
          <ImpactExplorer />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/pending-submissions">
        <ProtectedRoute>
          <PendingSubmissionsAdmin />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Add Font Awesome
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  // Preload wallet addresses when the app starts
  useEffect(() => {
    console.log("Preloading wallet addresses...");
    vechain.preloadWalletAddresses();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <AchievementProvider>
          <TooltipProvider>
            <Layout>
              <Router />
              {/* Dev Reset Toolkit - only visible in development mode */}
              <DevResetToolkit />
              {/* EnvCheck - logs environment variables to console */}
              <EnvCheck />
            </Layout>
            <Toaster />
          </TooltipProvider>
        </AchievementProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
