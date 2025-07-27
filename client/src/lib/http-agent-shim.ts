// HTTP Agent browser shim for VeChain DAppKit
// This creates a complete HTTP Agent replacement that works in browser environment

class HTTPAgentShim {
  keepAlive: boolean;
  keepAliveMsecs: number;
  maxSockets: number;
  maxTotalSockets: number;
  maxFreeSockets: number;
  timeout: number;
  scheduling: string;
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
    this.scheduling = options.scheduling || 'lifo';
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
  removeSocket() {}
}

// Create module exports that match Node.js http module
const httpShim = {
  Agent: HTTPAgentShim,
  globalAgent: new HTTPAgentShim({ keepAlive: true }),
  ClientRequest: class ClientRequest {},
  IncomingMessage: class IncomingMessage {},
  OutgoingMessage: class OutgoingMessage {},
  ServerResponse: class ServerResponse {},
  request: () => ({ on: () => {}, end: () => {}, write: () => {} }),
  get: () => ({ on: () => {}, end: () => {}, write: () => {} }),
  createServer: () => { throw new Error('HTTP server not available in browser'); },
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'],
  STATUS_CODES: {
    100: 'Continue',
    200: 'OK',
    400: 'Bad Request',
    404: 'Not Found',
    500: 'Internal Server Error'
  }
};

// Export as ES module for import compatibility
export { HTTPAgentShim as Agent, httpShim as default };

// Install globally for require() calls
(globalThis as any).http = httpShim;
(globalThis as any).https = httpShim;

// Install for Vite's externalized module pattern
(globalThis as any).http_1 = httpShim;
(globalThis as any).https_1 = httpShim;
(window as any).http_1 = httpShim;
(window as any).https_1 = httpShim;

console.log('[HTTP-SHIM] Browser HTTP Agent shim installed');