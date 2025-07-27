// Advanced polyfills for VeChain DAppKit browser compatibility
import { Buffer } from 'buffer';
import * as process from 'process';

// Make Node.js globals available
(globalThis as any).Buffer = Buffer;
(globalThis as any).process = process;
(globalThis as any).global = globalThis;

// HTTP Agent polyfill that mimics Node.js http.Agent
class HTTPAgent {
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
  createConnection() {}
  keepSocketAlive() {}
  reuseSocket() {}
  destroy() {}
  getName() { return 'localhost:80:'; }
}

// Comprehensive http module polyfill
const httpModule = {
  Agent: HTTPAgent,
  globalAgent: new HTTPAgent({ keepAlive: true }),
  ClientRequest: class ClientRequest {},
  IncomingMessage: class IncomingMessage {},
  OutgoingMessage: class OutgoingMessage {},
  ServerResponse: class ServerResponse {},
  request: () => ({
    on: () => {},
    end: () => {},
    write: () => {},
    abort: () => {}
  }),
  get: () => ({
    on: () => {},
    end: () => {},
    write: () => {},
    abort: () => {}
  }),
  createServer: () => {
    throw new Error('HTTP server not available in browser');
  },
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'],
  STATUS_CODES: {}
};

// Comprehensive https module polyfill
const httpsModule = {
  Agent: HTTPAgent,
  globalAgent: new HTTPAgent({ keepAlive: true }),
  request: httpModule.request,
  get: httpModule.get,
  createServer: () => {
    throw new Error('HTTPS server not available in browser');
  }
};

// Events module polyfill
class EventEmitter {
  _events: any = {};
  
  on(event: string, listener: Function) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(listener);
    return this;
  }
  
  emit(event: string, ...args: any[]) {
    if (this._events[event]) {
      this._events[event].forEach((listener: Function) => listener(...args));
    }
    return this;
  }
  
  removeListener(event: string, listener: Function) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter((l: Function) => l !== listener);
    }
    return this;
  }
}

// Module system polyfills
if (!(globalThis as any).__VeChainDAppKitPolyfilled) {
  // Install module polyfills globally
  (globalThis as any).http = httpModule;
  (globalThis as any).https = httpsModule;
  
  // CommonJS module system
  (globalThis as any).module = { exports: {} };
  (globalThis as any).exports = {};
  (globalThis as any).require = (id: string) => {
    switch (id) {
      case 'http': return httpModule;
      case 'https': return httpsModule;
      case 'buffer': return { Buffer };
      case 'process': return process;
      case 'events': return { EventEmitter };
      case 'util': return { 
        inherits: () => {},
        format: () => '',
        isBuffer: (obj: any) => Buffer.isBuffer(obj)
      };
      case 'stream': return { 
        Readable: class Readable extends EventEmitter {},
        Writable: class Writable extends EventEmitter {},
        Transform: class Transform extends EventEmitter {}
      };
      case 'url': return {
        parse: () => ({}),
        format: () => '',
        resolve: () => ''
      };
      default:
        console.warn(`[POLYFILL] Module "${id}" not polyfilled, returning empty object`);
        return {};
    }
  };
  
  // Mark as loaded
  (globalThis as any).__VeChainDAppKitPolyfilled = true;
}

console.log('[POLYFILLS] Browser polyfills loaded for DAppKit compatibility');