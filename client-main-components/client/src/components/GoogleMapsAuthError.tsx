import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GoogleMapsAuthErrorProps {
  height?: string;
  currentDomain: string;
}

/**
 * Component to display when the Google Maps API key fails with a RefererNotAllowed error
 * Provides instructions to update the API key's authorized domains
 */
const GoogleMapsAuthError: React.FC<GoogleMapsAuthErrorProps> = ({ 
  height = '300px', 
  currentDomain 
}) => {
  return (
    <Card className="h-full flex flex-col" style={{ minHeight: height }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-600 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5 h-5 mr-2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Google Maps Authorization Required
        </CardTitle>
        <CardDescription>
          This domain is not authorized to use the provided Google Maps API key
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Alert className="mb-4 border-amber-200 bg-amber-50">
          <AlertTitle className="text-amber-800">Please update your API key settings</AlertTitle>
          <AlertDescription className="text-amber-700">
            Go to the Google Cloud Console and add this domain to your API key's authorized domains.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Current Domain</h3>
            <div className="p-2 bg-slate-100 rounded text-sm font-mono break-all">
              {currentDomain}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Steps to authorize your domain:</h3>
            <ol className="list-decimal pl-5 text-sm space-y-2">
              <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
              <li>Select your project and find your Maps API key</li>
              <li>Click "Edit" on your API key</li>
              <li>Under "Application restrictions" &gt; "Website restrictions", add the domain above</li>
              <li>You can also add a wildcard domain like <code>*.replit.dev</code> to authorize all Replit domains</li>
              <li>Save your changes</li>
            </ol>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button size="sm" asChild>
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
              Open Google Cloud Console
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GoogleMapsAuthError;