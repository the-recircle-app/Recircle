import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "./context/WalletContext";
import { AchievementProvider } from "./context/AchievementContext";

import { VeChainStateBridge } from "./components/VeChainStateBridge";
import NotFound from "@/pages/not-found";
import ImpactExplorer from "./pages/impact-explorer";
import Welcome from "./pages/welcome";
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
import ModernRedeem from "./pages/redeem-modern";
import LogoShowcase from "./pages/logo-showcase";
import PendingSubmissionsAdmin from "./pages/admin/pending-submissions";
import TestAutoConnect from "./pages/test-auto-connect";
import TestWalletConnect from "./pages/test-wallet-connect";
import DebugWallet from "./pages/debug-wallet";
import VeWorldTestSimple from "./pages/veworld-test-simple";
import DAOWalletConnectPage from "./pages/dao-wallet-connect";
import SimpleWalletConnectPage from "./pages/simple-wallet-connect";
import MinimalConnect from "./pages/minimal-connect";
import WalletDebugPage from "./pages/wallet-debug";
import VeWorldTestPage from "./pages/veworld-test";
import WalletConnectProductionPage from "./pages/wallet-connect-production";
import VeChainKitTest from "./pages/vechain-kit-test";
import HelpPage from "./pages/help";
import FeedbackPage from "./pages/feedback";
import RewardHistory from "./pages/reward-history";
import ContractStatus from "./pages/contract-status";
import DebugToolsPage from "./pages/admin/debug-tools";
import Debug from "./pages/debug";
import VeWorldDebugPage from "./pages/VeWorldDebugPage";
import TermsOfService from "./pages/terms-of-service";
import SoloSetupPage from "./pages/solo-setup";
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
      <Route path="/" component={Welcome} />
      <Route path="/home" component={Home} />
      <Route path="/connect-wallet" component={ConnectWallet} />
      <Route path="/join" component={JoinWithReferral} />
      <Route path="/logo-showcase" component={LogoShowcase} />
      <Route path="/test-auto-connect" component={TestAutoConnect} />
      <Route path="/test-wallet-connect" component={TestWalletConnect} />
      <Route path="/debug-wallet" component={DebugWallet} />
      <Route path="/veworld-simple" component={VeWorldTestSimple} />
      <Route path="/dao-wallet-connect" component={DAOWalletConnectPage} />
      <Route path="/simple-wallet-connect" component={SimpleWalletConnectPage} />
      <Route path="/minimal-connect" component={MinimalConnect} />
      <Route path="/wallet-debug" component={WalletDebugPage} />
      <Route path="/veworld-test" component={VeWorldTestPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/feedback" component={FeedbackPage} />
      <Route path="/vechain-kit-test" component={VeChainKitTest} />
      <Route path="/debug" component={Debug} />
      <Route path="/veworld-debug" component={VeWorldDebugPage} />
      
      {/* Admin routes */}
      <Route path="/admin/pending-submissions" component={PendingSubmissionsAdmin} />
      <Route path="/admin/debug-tools" component={DebugToolsPage} />
      
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
      <Route path="/redeem-modern">
        <ProtectedRoute>
          <ModernRedeem />
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
      
      {/* Wallet Connection Pages */}
      <Route path="/veworld-test">
        <VeWorldTestPage />
      </Route>
      <Route path="/wallet-connect-production">
        <WalletConnectProductionPage />
      </Route>
      
      {/* Legal Pages */}
      <Route path="/terms-of-service" component={TermsOfService} />
      
      {/* Solo Network Setup */}
      <Route path="/solo-setup" component={SoloSetupPage} />
      
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
    
    // Initialize development mode VeWorld simulation
    vechain.initializeDevelopmentMode();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <VeChainStateBridge />
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
