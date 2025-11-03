import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";
import { VeChainKitProviderWrapper } from "./utils/VeChainKitProvider";
import { VeWorldBrowserGate } from "./components/VeWorldBrowserGate";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <VeWorldBrowserGate>
      <VeChainKitProviderWrapper>
        <App />
      </VeChainKitProviderWrapper>
    </VeWorldBrowserGate>
  </React.StrictMode>
);
