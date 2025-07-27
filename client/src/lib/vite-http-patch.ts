// Runtime monkey patch for Vite's HTTP module externalization
// This directly patches the bundled DAppKit code to inject HTTP Agent

// Create the HTTP Agent class that DAppKit expects
class BrowserHTTPAgent {
  keepAlive: boolean;
  keepAliveMsecs: number;
  maxSockets: number;
  maxTotalSockets: number;
  maxFreeSockets: number;
  timeout: number;
  freeSockets: Record<string, any>;
  sockets: Record<string, any>;
  requests: Record<string, any>;
  
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
  keepSocketAlive() {}
  reuseSocket() {}
}

// Patch the window object with http modules before DAppKit loads
const httpAgent = new BrowserHTTPAgent({ keepAlive: true });

// Install http_1 and https_1 that Vite creates for externalized modules
(window as any).http_1 = {
  Agent: BrowserHTTPAgent,
  globalAgent: httpAgent,
  default: {
    Agent: BrowserHTTPAgent,
    globalAgent: httpAgent
  }
};

(window as any).https_1 = {
  Agent: BrowserHTTPAgent, 
  globalAgent: httpAgent,
  default: {
    Agent: BrowserHTTPAgent,
    globalAgent: httpAgent
  }
};

// Also patch globalThis for broader compatibility
(globalThis as any).http_1 = (window as any).http_1;
(globalThis as any).https_1 = (window as any).https_1;

// Direct module execution interception
const originalDefine = (globalThis as any).define;
if (typeof originalDefine === 'function') {
  (globalThis as any).define = function(...args: any[]) {
    // Intercept AMD module definitions
    if (args.length >= 2 && typeof args[args.length - 1] === 'function') {
      const factory = args[args.length - 1];
      const newFactory = function(...deps: any[]) {
        // Patch dependencies array to inject our HTTP agent
        const patchedDeps = deps.map((dep: any, index: number) => {
          if (dep === undefined && args[args.length - 2] && args[args.length - 2][index] === 'http') {
            return { Agent: BrowserHTTPAgent, globalAgent: httpAgent };
          }
          return dep;
        });
        return factory.apply(this, patchedDeps);
      };
      return originalDefine(...args.slice(0, -1), newFactory);
    }
    return originalDefine.apply(this, args);
  };
}

// Patch eval to replace http_1.Agent at runtime
const originalEval = (globalThis as any).eval;
if (typeof originalEval === 'function') {
  (globalThis as any).eval = function(code: string) {
    if (typeof code === 'string' && code.includes('http_1.Agent')) {
      code = code.replace(/new\s+http_1\.Agent/g, 'new window.http_1.Agent');
      code = code.replace(/http_1\.Agent/g, 'window.http_1.Agent');
    }
    return originalEval.call(this, code);
  };
}

console.log('[VITE-HTTP-PATCH] HTTP Agent runtime patch applied');