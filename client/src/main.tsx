import { createRoot } from "react-dom/client";
import React from "react";
import { useLocation } from "wouter";
import App from "./App";
import { VeChainKitProviderWrapper } from "./utils/VeChainKitProvider";
import { VeWorldBrowserGate } from "./components/VeWorldBrowserGate";
import "./index.css";

// Conditional gate wrapper - re-evaluates on every route change
function ConditionalGate({ children }: { children: React.ReactNode }) {
  const [location] = useLocation(); // Reactive - triggers re-render on navigation
  const adminRoutes = ['/admin-stats-2025', '/admin/debug-tools'];
  const isAdminRoute = adminRoutes.some(route => location.startsWith(route));

  console.log('[CONDITIONAL-GATE] Location:', location, 'isAdmin:', isAdminRoute);

  // Admin routes bypass the VeWorld gate (desktop-accessible)
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // All other routes require VeWorld mobile browser
  return <VeWorldBrowserGate>{children}</VeWorldBrowserGate>;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConditionalGate>
      <VeChainKitProviderWrapper>
        <App />
      </VeChainKitProviderWrapper>
    </ConditionalGate>
  </React.StrictMode>
);
