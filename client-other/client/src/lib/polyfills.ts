// This file provides polyfills for browser environments when using packages 
// that rely on Node.js globals like process and Buffer

// Polyfill for global
if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

// Polyfill for process
if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

// Polyfill for Buffer
if (typeof window !== 'undefined' && typeof (window as any).Buffer === 'undefined') {
  // Simple shim for Buffer, not a full implementation
  (window as any).Buffer = {
    isBuffer: () => false,
    from: (data: any) => data,
  };
}

// Polyfill for Node.js util module
if (typeof window !== 'undefined' && typeof (window as any).util === 'undefined') {
  (window as any).util = {
    // Simple inherits implementation for classes
    inherits: function(ctor: any, superCtor: any) {
      if (superCtor) {
        ctor.super_ = superCtor;
        Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
      }
    },
    debuglog: () => () => {},
    inspect: (obj: any) => JSON.stringify(obj)
  };
}

// Polyfill for Node.js http/https modules
if (typeof window !== 'undefined') {
  if (typeof (window as any).http === 'undefined') {
    (window as any).http = { globalAgent: {} };
  }
  
  if (typeof (window as any).https === 'undefined') {
    (window as any).https = { globalAgent: {} };
  }
}

// Polyfill for Node.js stream module
if (typeof window !== 'undefined' && typeof (window as any).stream === 'undefined') {
  (window as any).stream = { 
    Transform: class {
      constructor() {}
      pipe() { return this; }
    }
  };
}

export default function setupPolyfills() {
  // This function doesn't need to do anything as the polyfills are applied when this file is imported
  console.log('🛠️ Browser polyfills for Node.js globals loaded');
}