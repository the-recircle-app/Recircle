import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";
import "./index.css";
import { VeChainKitProviderWrapper } from './components/VeChainKitProviderWrapper';

function AppWithProvider() {
  return (
    <VeChainKitProviderWrapper>
      <App />
    </VeChainKitProviderWrapper>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWithProvider />
  </React.StrictMode>
);
