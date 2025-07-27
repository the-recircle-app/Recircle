import { useEffect, useState } from "react";

const VeWorldTest = () => {
  const [results, setResults] = useState<string[]>([]);

  const log = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    console.log(message);
    setResults(prev => [...prev, `${type}: ${message}`]);
  };

  const testAll = async () => {
    setResults([]);
    
    log('=== VeWorld Direct Test ===');
    log('URL: ' + window.location.href);
    log('Domain: ' + window.location.hostname);
    log('Is .replit.app domain: ' + window.location.hostname.includes('replit.app'));
    log('User Agent: ' + navigator.userAgent);
    
    // Check all possible VeChain objects
    log('window.vechain: ' + typeof (window as any).vechain);
    log('window.connex: ' + typeof (window as any).connex);
    log('window.ethereum: ' + typeof (window as any).ethereum);
    log('window.web3: ' + typeof (window as any).web3);
    
    // Check for any object that might be VeChain related
    const allKeys = Object.keys(window);
    const vechainKeys = allKeys.filter(key => 
      key.toLowerCase().includes('vechain') || 
      key.toLowerCase().includes('connex') ||
      key.toLowerCase().includes('thor') ||
      key.toLowerCase().includes('vet')
    );
    log('VeChain-related keys: ' + JSON.stringify(vechainKeys));
    
    // If VeWorld provider exists, try to connect
    if ((window as any).vechain) {
      log('✅ VeWorld provider found!', 'success');
      try {
        const accounts = await (window as any).vechain.request({ method: 'eth_requestAccounts' });
        log('✅ VeWorld connection successful! Address: ' + accounts[0], 'success');
      } catch (err: any) {
        log('❌ VeWorld connection failed: ' + err.message, 'error');
      }
    } else if ((window as any).connex) {
      log('✅ Connex provider found!', 'success');
      try {
        const result = await (window as any).connex.vendor.sign('cert', {
          purpose: 'identification',
          payload: { type: 'text', content: 'Test connection' }
        }).request();
        log('✅ Connex connection successful! Address: ' + result.annex.signer, 'success');
      } catch (err: any) {
        log('❌ Connex connection failed: ' + err.message, 'error');
      }
    } else {
      log('❌ No VeChain provider found', 'error');
      log('This means VeWorld is not injecting providers into this domain', 'error');
    }
  };

  useEffect(() => {
    setTimeout(testAll, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">VeWorld Direct Test</h1>
      
      <button 
        onClick={testAll}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-lg mb-6"
      >
        Test Everything
      </button>
      
      <div className="space-y-2">
        {results.map((result, index) => {
          const [type, message] = result.split(': ', 2);
          const bgColor = type === 'success' ? 'bg-green-900' : 
                         type === 'error' ? 'bg-red-900' : 'bg-gray-800';
          
          return (
            <div key={index} className={`p-3 rounded ${bgColor}`}>
              {message}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VeWorldTest;