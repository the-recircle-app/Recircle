// HTTP Agent polyfill for DAppKit browser compatibility
// This creates a compatible HTTP Agent that DAppKit can use

class HTTPAgent {
  keepAlive: boolean;
  keepAliveMsecs: number;
  maxSockets: number;
  maxTotalSockets: number;
  maxFreeSockets: number;
  timeout: number;
  
  constructor(options: any = {}) {
    this.keepAlive = options.keepAlive !== false;
    this.keepAliveMsecs = options.keepAliveMsecs || 1000;
    this.maxSockets = options.maxSockets || Infinity;
    this.maxTotalSockets = options.maxTotalSockets || Infinity;
    this.maxFreeSockets = options.maxFreeSockets || 256;
    this.timeout = options.timeout || 0;
  }

  addRequest() {}
  createConnection() { return {}; }
  destroy() {}
  getName() { return 'localhost:80:'; }
}

// Create http module replacement
const httpModule = {
  Agent: HTTPAgent,
  globalAgent: new HTTPAgent({ keepAlive: true })
};

// Install globally for module resolution
(globalThis as any).http = httpModule;
(globalThis as any).https = httpModule;

// Monkey patch for Vite's module externalization
const originalDefine = (globalThis as any).define;
if (originalDefine) {
  (globalThis as any).define = function(...args: any[]) {
    const moduleFactory = args[args.length - 1];
    if (typeof moduleFactory === 'function') {
      return originalDefine(...args.slice(0, -1), function(...deps: any[]) {
        // Inject our http module when requested
        const modifiedDeps = deps.map((dep: any) => {
          if (dep && dep.default === undefined && typeof dep === 'object') {
            return { ...dep, Agent: HTTPAgent };
          }
          return dep;
        });
        return moduleFactory(...modifiedDeps);
      });
    }
    return originalDefine(...args);
  };
}

console.log('[HTTP-POLYFILL] HTTP Agent polyfill loaded');