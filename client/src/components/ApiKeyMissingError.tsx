import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiKeyMissingErrorProps {
  serviceName: string;
  envVarName: string;
  docsUrl?: string;
  height?: string;
}

/**
 * Component to display when an API key is missing
 * This provides helpful instructions to users on how to set up the required API key
 */
const ApiKeyMissingError: React.FC<ApiKeyMissingErrorProps> = ({
  serviceName,
  envVarName,
  docsUrl,
  height = '300px'
}) => {
  return (
    <Card className="h-full flex flex-col" style={{ minHeight: height }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-600 flex items-center">
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
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
          </svg>
          {serviceName} API Key Required
        </CardTitle>
        <CardDescription>
          To use the {serviceName} integration, an API key needs to be configured
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <AlertTitle className="text-blue-800">API Key Configuration</AlertTitle>
          <AlertDescription className="text-blue-700">
            Add the {serviceName} API key to your environment variables.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Missing Environment Variable</h3>
            <div className="p-2 bg-slate-100 rounded text-sm font-mono break-all">
              {envVarName}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Steps to configure:</h3>
            <ol className="list-decimal pl-5 text-sm space-y-2">
              <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{serviceName} Console</a></li>
              <li>Create or select a project</li>
              <li>Create an API key or use an existing one</li>
              <li>Copy the API key</li>
              <li>Add it to your Replit Secrets with the name <code>{envVarName}</code></li>
            </ol>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          {docsUrl && (
            <Button size="sm" asChild>
              <a href={docsUrl} target="_blank" rel="noopener noreferrer">
                View Documentation
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyMissingError;