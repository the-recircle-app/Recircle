import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    vechain?: any;
  }
}

export default function VeWorldAPIExplorer() {
  const [apiStructure, setApiStructure] = useState<any>(null);
  const [connectionResult, setConnectionResult] = useState<string>('');
  const [isExploring, setIsExploring] = useState(false);

  useEffect(() => {
    if (window.vechain) {
      exploreAPI();
    }
  }, []);

  const exploreAPI = () => {
    if (!window.vechain) return;

    const exploration = {
      exists: true,
      type: typeof window.vechain,
      keys: Object.keys(window.vechain),
      properties: {} as Record<string, any>,
      prototype: Object.getPrototypeOf(window.vechain),
      constructor: window.vechain.constructor?.name
    };

    // Deep explore each property
    Object.keys(window.vechain).forEach(key => {
      const prop = window.vechain[key];
      exploration.properties[key] = {
        type: typeof prop,
        value: prop,
        isFunction: typeof prop === 'function',
        isObject: typeof prop === 'object' && prop !== null,
        keys: typeof prop === 'object' && prop !== null ? Object.keys(prop) : []
      };

      if (typeof prop === 'object' && prop !== null) {
        exploration.properties[key].subProperties = {};
        Object.keys(prop).forEach(subKey => {
          exploration.properties[key].subProperties[subKey] = {
            type: typeof prop[subKey],
            isFunction: typeof prop[subKey] === 'function'
          };
        });
      }
    });

    setApiStructure(exploration);
    console.log('VeWorld API Exploration:', exploration);
  };

  const testAllConnectionMethods = async () => {
    if (!window.vechain) return;

    setIsExploring(true);
    const results = [];

    try {
      // Method 1: Direct request
      if (typeof window.vechain.request === 'function') {
        try {
          const accounts = await window.vechain.request({ method: 'eth_requestAccounts' });
          results.push(`✅ request() method: ${accounts?.length || 0} accounts`);
        } catch (err) {
          results.push(`❌ request() method: ${err.message}`);
        }
      } else {
        results.push('❌ request() method not available');
      }

      // Method 2: Enable pattern
      if (typeof window.vechain.enable === 'function') {
        try {
          await window.vechain.enable();
          results.push('✅ enable() method successful');
        } catch (err) {
          results.push(`❌ enable() method: ${err.message}`);
        }
      } else {
        results.push('❌ enable() method not available');
      }

      // Method 3: Connect pattern
      if (typeof window.vechain.connect === 'function') {
        try {
          const result = await window.vechain.connect();
          results.push(`✅ connect() method: ${JSON.stringify(result)}`);
        } catch (err) {
          results.push(`❌ connect() method: ${err.message}`);
        }
      } else {
        results.push('❌ connect() method not available');
      }

      // Method 4: Direct property access
      if (window.vechain.selectedAddress) {
        results.push(`✅ selectedAddress: ${window.vechain.selectedAddress}`);
      } else {
        results.push('❌ selectedAddress not available');
      }

      if (window.vechain.accounts) {
        results.push(`✅ accounts property: ${Array.isArray(window.vechain.accounts) ? window.vechain.accounts.length : 'not array'}`);
      } else {
        results.push('❌ accounts property not available');
      }

      // Method 5: Check for Connex-style thor
      if (window.vechain.thor) {
        results.push('✅ thor property available (Connex-style)');
        if (window.vechain.thor.account) {
          try {
            const account = await window.vechain.thor.account.getSelected();
            results.push(`✅ thor.account.getSelected(): ${account?.address || 'no address'}`);
          } catch (err) {
            results.push(`❌ thor.account.getSelected(): ${err.message}`);
          }
        }
      } else {
        results.push('❌ thor property not available');
      }

      // Method 6: Check for wallet provider methods
      const commonMethods = ['send', 'sendAsync', 'isConnected', 'getAccounts', 'getChainId'];
      commonMethods.forEach(method => {
        if (typeof window.vechain[method] === 'function') {
          results.push(`✅ ${method}() method available`);
        }
      });

    } catch (err) {
      results.push(`❌ General error: ${err.message}`);
    }

    setConnectionResult(results.join('\n'));
    setIsExploring(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>VeWorld API Explorer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiStructure && (
            <div>
              <h4 className="font-semibold mb-2">API Structure</h4>
              <div className="space-y-2">
                <Badge variant="outline">Type: {apiStructure.type}</Badge>
                <Badge variant="outline">Constructor: {apiStructure.constructor}</Badge>
                <div className="text-sm">
                  <p className="font-medium">Available Properties:</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.keys(apiStructure.properties).map(key => (
                      <div key={key} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        <span className="font-mono">{key}</span>
                        <span className="ml-2 text-gray-500">
                          ({apiStructure.properties[key].type})
                          {apiStructure.properties[key].isFunction && ' 🔧'}
                        </span>
                        {apiStructure.properties[key].isObject && (
                          <div className="ml-2 mt-1">
                            {apiStructure.properties[key].keys.map(subKey => (
                              <div key={subKey} className="text-xs text-gray-600">
                                .{subKey} ({apiStructure.properties[key].subProperties?.[subKey]?.type})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={testAllConnectionMethods}
            disabled={isExploring || !window.vechain}
            className="w-full"
          >
            {isExploring ? "Testing All Methods..." : "Test All Connection Methods"}
          </Button>

          {connectionResult && (
            <div>
              <h4 className="font-semibold mb-2">Connection Test Results</h4>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono whitespace-pre-line">
                {connectionResult}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}