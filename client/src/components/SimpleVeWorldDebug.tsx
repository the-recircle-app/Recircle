import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    vechain?: any;
  }
}

export default function SimpleVeWorldDebug() {
  const [debugOutput, setDebugOutput] = useState<string>('');

  const analyzeVeWorld = () => {
    if (!window.vechain) {
      setDebugOutput('window.vechain not found');
      return;
    }

    const output: string[] = [];
    
    try {
      output.push('=== VeWorld Object Analysis ===');
      output.push(`Type: ${typeof window.vechain}`);
      output.push(`Constructor: ${window.vechain.constructor?.name || 'unknown'}`);
      
      const keys = Object.keys(window.vechain);
      output.push(`\nProperties (${keys.length}):`);
      
      keys.forEach(key => {
        const prop = window.vechain[key];
        const type = typeof prop;
        
        if (type === 'function') {
          output.push(`  ${key}() - function`);
        } else if (type === 'object' && prop !== null) {
          const subKeys = Object.keys(prop);
          output.push(`  ${key} - object with ${subKeys.length} properties`);
          subKeys.slice(0, 3).forEach(subKey => {
            output.push(`    .${subKey} (${typeof prop[subKey]})`);
          });
          if (subKeys.length > 3) {
            output.push(`    ... and ${subKeys.length - 3} more`);
          }
        } else {
          output.push(`  ${key} - ${type}: ${prop}`);
        }
      });
      
      // Test common wallet methods
      output.push('\n=== Method Testing ===');
      
      const methodsToTest = [
        'request', 'send', 'sendAsync', 'enable', 'connect', 
        'getAccounts', 'getChainId', 'isConnected'
      ];
      
      methodsToTest.forEach(method => {
        if (typeof window.vechain[method] === 'function') {
          output.push(`✅ ${method}() - available`);
        } else {
          output.push(`❌ ${method}() - not available`);
        }
      });
      
      // Check for nested objects
      output.push('\n=== Nested Objects ===');
      ['thor', 'wallet', 'provider', 'ethereum'].forEach(objName => {
        if (window.vechain[objName]) {
          output.push(`✅ ${objName} - available`);
          const subKeys = Object.keys(window.vechain[objName]);
          output.push(`  Properties: ${subKeys.join(', ')}`);
        } else {
          output.push(`❌ ${objName} - not available`);
        }
      });

    } catch (error) {
      output.push(`Error during analysis: ${error}`);
    }
    
    setDebugOutput(output.join('\n'));
    console.log('VeWorld Analysis:', output.join('\n'));
  };

  const testConnection = async () => {
    if (!window.vechain) {
      setDebugOutput('window.vechain not found');
      return;
    }

    const output: string[] = [];
    output.push('=== Connection Testing ===');
    
    try {
      // Test 1: Check if it's actually Connex
      if (window.vechain.thor?.account?.getSelected) {
        output.push('Testing Connex-style connection...');
        try {
          const account = await window.vechain.thor.account.getSelected();
          output.push(`✅ Connex account: ${account?.address || 'no address'}`);
        } catch (err) {
          output.push(`❌ Connex failed: ${err}`);
        }
      }
      
      // Test 2: Direct property access
      if (window.vechain.selectedAddress) {
        output.push(`✅ Direct selectedAddress: ${window.vechain.selectedAddress}`);
      }
      
      if (window.vechain.accounts) {
        output.push(`✅ Direct accounts: ${JSON.stringify(window.vechain.accounts)}`);
      }
      
      // Test 3: Check what happens when we just log the object
      output.push('\n=== Raw Object ===');
      output.push(JSON.stringify(window.vechain, null, 2));
      
    } catch (error) {
      output.push(`Connection test error: ${error}`);
    }
    
    setDebugOutput(output.join('\n'));
    console.log('VeWorld Connection Test:', output.join('\n'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>VeWorld Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={analyzeVeWorld} variant="outline">
            Analyze VeWorld Object
          </Button>
          <Button onClick={testConnection} variant="outline">
            Test Connection
          </Button>
        </div>
        
        {debugOutput && (
          <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <pre className="text-xs whitespace-pre-wrap font-mono overflow-auto max-h-96">
              {debugOutput}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}