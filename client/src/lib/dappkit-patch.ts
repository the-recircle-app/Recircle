// Runtime HTTP Agent injection for DAppKit
class ViteHTTPAgent {
  keepAlive: boolean;
  keepAliveMsecs: number;
  maxSockets: number;
  maxTotalSockets: number;
  maxFreeSockets: number;
  timeout: number;
  freeSockets: any;
  sockets: any;
  requests: any;
  
  constructor(options: any = {}) {
    this.keepAlive = options.keepAlive !== false;
    this.keepAliveMsecs = options.keepAliveMsecs || 1000;
    this.maxSockets = options.maxSockets || Infinity;
    this.maxTotalSockets = options.maxTotalSockets || Infinity;
    this.maxFreeSockets = options.maxFreeSockets || 256;
    this.timeout = options.timeout || 0;
    this.freeSockets = {};
    this.sockets = {};
    this.requests = {};
  }

  addRequest() {}
  createConnection() { return {}; }
  destroy() {}
  getName() { return 'localhost:80:'; }
}

// Patch the global object that Vite creates for externalized modules
const patchExternalizedModules = () => {
  // Patch window.http_1 if it exists (Vite externalization pattern)
  if (typeof window !== 'undefined') {
    (window as any).http_1 = {
      Agent: HTTPAgent,
      globalAgent: new (HTTPAgent as any)({ keepAlive: true })
    };
    
    (window as any).https_1 = {
      Agent: HTTPAgent,
      globalAgent: new (HTTPAgent as any)({ keepAlive: true })
    };
  }
  
  // Also patch global scope
  (globalThis as any).http_1 = {
    Agent: HTTPAgent,
    globalAgent: new (HTTPAgent as any)({ keepAlive: true })
  };
  
  (globalThis as any).https_1 = {
    Agent: HTTPAgent,
    globalAgent: new (HTTPAgent as any)({ keepAlive: true })
  };
};

// Apply patches immediately
patchExternalizedModules();

// Patch Vite's dep optimization
const originalImport = (globalThis as any).__vitePreload;
if (originalImport) {
  (globalThis as any).__vitePreload = function(...args: any[]) {
    const result = originalImport.apply(this, args);
    if (result && typeof result.then === 'function') {
      return result.then((module: any) => {
        if (module && !module.Agent && (args[0]?.includes('http') || args[0]?.includes('https'))) {
          return { ...module, Agent: HTTPAgent, globalAgent: new (HTTPAgent as any)() };
        }
        return module;
      });
    }
    return result;
  };
}

console.log('[DAPPKIT-PATCH] HTTP Agent patch applied for Vite externalization');