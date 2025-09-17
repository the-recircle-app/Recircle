import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";
import { VeChainKitProviderWrapper } from "./utils/VeChainKitProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <VeChainKitProviderWrapper>
      <App />
    </VeChainKitProviderWrapper>
  </React.StrictMode>
);
