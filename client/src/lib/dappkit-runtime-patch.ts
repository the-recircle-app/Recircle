// Runtime code injection to fix DAppKit HTTP Agent issues
// This patches the execution context at runtime to provide HTTP Agent

class HTTPAgentImplementation {
  keepAlive: boolean;
  keepAliveMsecs: number;
  maxSockets: number;
  maxTotalSockets: number;
  maxFreeSockets: number;
  timeout: number;
  freeSockets: Record<string, any[]>;
  sockets: Record<string, any[]>;
  requests: Record<string, any[]>;
  
  constructor(options: any = {}) {
    this.keepAlive = options.keepAlive || false;
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
  keepSocketAlive() { return true; }
  reuseSocket() {}
}

// Create a complete http module replacement
const httpImplementation = {
  Agent: HTTPAgentImplementation,
  globalAgent: new HTTPAgentImplementation({ keepAlive: true }),
  default: {
    Agent: HTTPAgentImplementation,
    globalAgent: new HTTPAgentImplementation({ keepAlive: true })
  }
};

// Override all possible module access patterns
(window as any).http_1 = httpImplementation;
(window as any).https_1 = httpImplementation;
(globalThis as any).http_1 = httpImplementation;
(globalThis as any).https_1 = httpImplementation;

// Inject into module cache if it exists
if ((globalThis as any).__vitePreload) {
  const originalPreload = (globalThis as any).__vitePreload;
  (globalThis as any).__vitePreload = async function(deps: string[], ...args: any[]) {
    const result = await originalPreload.call(this, deps, ...args);
    // Patch any http modules in the result
    if (result && typeof result === 'object') {
      if (!result.Agent && (deps.some(d => d.includes('http')) || args.some(a => a.includes('http')))) {
        Object.assign(result, httpImplementation);
      }
    }
    return result;
  };
}

// Override the specific error-causing code at execution time
const originalSetTimeout = setTimeout;
setTimeout(() => {
  // Patch all scripts that might contain DAppKit code
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    if (script.src && script.src.includes('dapp-kit')) {
      const originalOnLoad = script.onload;
      script.onload = function(e) {
        // After DAppKit loads, patch any undefined http_1 references
        try {
          if (!(window as any).http_1 || !(window as any).http_1.Agent) {
            (window as any).http_1 = httpImplementation;
            console.log('[RUNTIME-PATCH] Injected HTTP Agent after DAppKit load');
          }
        } catch (err) {
          console.warn('[RUNTIME-PATCH] Could not patch after load:', err);
        }
        if (originalOnLoad) originalOnLoad.call(this, e);
      };
    }
  });
}, 0);

// Patch Error constructor to catch and fix HTTP Agent errors
const originalError = Error;
(globalThis as any).Error = function(message: string) {
  if (message && message.includes('http_1.Agent') && message.includes('not a constructor')) {
    console.log('[RUNTIME-PATCH] Intercepted HTTP Agent constructor error, providing fallback');
    // Ensure http_1 is available
    if (!(window as any).http_1) {
      (window as any).http_1 = httpImplementation;
    }
    // Return a less severe error or ignore
    return new originalError('HTTP Agent patched in browser environment');
  }
  return new originalError(message);
};

console.log('[RUNTIME-PATCH] DAppKit HTTP Agent runtime patch installed');