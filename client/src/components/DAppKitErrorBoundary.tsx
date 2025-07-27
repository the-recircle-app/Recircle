import React from 'react';
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class DAppKitErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.log('[ERROR-BOUNDARY] DAppKit error caught:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('[ERROR-BOUNDARY] DAppKit error details:', { error, errorInfo });
    
    // If this is the HTTP Agent constructor error, we know it's a polyfill issue
    if (error.message.includes('http_1.Agent') || error.message.includes('not a constructor')) {
      console.log('[ERROR-BOUNDARY] HTTP Agent polyfill issue detected, using fallback');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-gray-800 rounded-lg border border-yellow-600">
          <div className="text-center">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">⚠️ DAppKit Loading Issue</h3>
            <p className="text-gray-300 text-sm mb-4">
              VeChain DAppKit encountered a browser compatibility issue. Using fallback wallet connection.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DAppKitErrorBoundary;