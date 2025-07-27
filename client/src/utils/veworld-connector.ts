export async function connectVeWorldWallet() {
  if (typeof window === "undefined") return { error: "Not in a browser" };

  const vechainProvider = (window as any).vechain;

  if (!vechainProvider) {
    return { error: "VeWorld not detected. Use the in-app browser." };
  }

  console.log("[VEWORLD] Provider detected:", {
    hasRequest: typeof vechainProvider.request === "function",
    hasEnable: typeof vechainProvider.enable === "function", 
    selectedAddress: vechainProvider.selectedAddress,
    accounts: vechainProvider.accounts
  });

  try {
    // For desktop VeWorld (has .request)
    if (typeof vechainProvider.request === "function") {
      const accounts = await vechainProvider.request({ method: "eth_requestAccounts" });
      const chainId = await vechainProvider.request({ method: "eth_chainId" });

      if (chainId !== "0x27" && chainId !== 39 && chainId !== "39") {
        return { error: "Wrong network. Switch to VeChain testnet." };
      }

      return { address: accounts[0], chainId };
    }

    // For mobile VeWorld (may lack .request)
    if (vechainProvider.selectedAddress) {
      // Already connected in the background
      return { address: vechainProvider.selectedAddress, chainId: "0x27" };
    }

    // Try to enable the wallet for mobile VeWorld
    if (typeof vechainProvider.enable === "function") {
      console.log("[VEWORLD] Attempting to enable wallet for mobile");
      
      try {
        const enableResult = await vechainProvider.enable();
        console.log("[VEWORLD] Enable result:", enableResult);
        
        // Enhanced polling with multiple address sources
        let tries = 0;
        const maxTries = 30; // Increased to 6 seconds
        
        while (tries < maxTries) {
          const address = vechainProvider.selectedAddress || 
                         vechainProvider.address || 
                         vechainProvider.account ||
                         (vechainProvider.accounts && vechainProvider.accounts[0]) ||
                         null;
          
          if (address && typeof address === 'string' && address.startsWith('0x')) {
            console.log(`[VEWORLD] Mobile address found on attempt ${tries + 1}:`, address);
            return { address, chainId: "0x27" };
          }
          
          console.log(`[VEWORLD] Polling for address... attempt ${tries + 1}/${maxTries}`);
          await new Promise(resolve => setTimeout(resolve, 200));
          tries++;
        }
        
        console.log("[VEWORLD] Address polling timeout after enable()");
      } catch (enableError) {
        console.log("[VEWORLD] Enable method error:", enableError);
      }
      
      // Fallback: try eth_accounts after enable
      if (typeof vechainProvider.request === "function") {
        try {
          console.log("[VEWORLD] Trying eth_accounts fallback after enable");
          const accounts = await vechainProvider.request({ method: "eth_accounts" });
          if (accounts && accounts[0]) {
            return { address: accounts[0], chainId: "0x27" };
          }
        } catch (err) {
          console.log("[VEWORLD] eth_accounts fallback failed:", err);
        }
      }
    }

    return { error: "Wallet detected, but no address available. Try refreshing or reconnecting." };

  } catch (err: any) {
    console.error("❌ Wallet connection error:", err);
    return { error: "Failed to connect to VeWorld. Please approve in the wallet." };
  }
}