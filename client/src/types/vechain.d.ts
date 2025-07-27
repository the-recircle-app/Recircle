// Type definitions for VeChain wallet integration

// Window.vechain interface (browser extension)
interface VeChainProvider {
  request: (args: { method: string }) => Promise<string[]>;
}

// Connex interface (VeWorld mobile & in-app browser)
interface ConnexAccount {
  address: string;
}

interface ConnexThor {
  account: {
    getSelected: () => Promise<ConnexAccount>;
  };
}

interface ConnexProvider {
  thor: ConnexThor;
}

declare global {
  interface Window {
    vechain?: VeChainProvider;
    connex?: ConnexProvider;
  }
}

export {};