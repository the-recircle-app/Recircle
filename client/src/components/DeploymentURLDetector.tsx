import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";

export default function DeploymentURLDetector() {
  const [urls, setUrls] = useState<{
    current: string;
    replit: string | null;
    custom: string;
    isHTTPS: boolean;
  }>({
    current: '',
    replit: null,
    custom: 'recirclerewards.app',
    isHTTPS: false
  });

  useEffect(() => {
    const currentUrl = window.location.origin;
    const isHTTPS = currentUrl.startsWith('https://');
    const isReplit = currentUrl.includes('.replit.app');
    
    setUrls({
      current: currentUrl,
      replit: isReplit ? currentUrl : null,
      custom: 'recirclerewards.app',
      isHTTPS
    });
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const veWorldInstructions = [
    "Download VeWorld app on your mobile device",
    "Open VeWorld app (not device browser)",
    "Navigate to in-app browser within VeWorld",
    "Enter URL below + '/veworld-test'",
    "Ensure VeChain testnet is selected in VeWorld settings"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deployment URL Detection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current URL</h3>
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <code className="flex-1 text-sm">{urls.current}</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(urls.current)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              HTTPS: {urls.isHTTPS ? '✅ Yes' : '❌ No'} | 
              Replit: {urls.current.includes('.replit.app') ? '✅ Yes' : '❌ No'}
            </p>
          </div>

          {urls.current.includes('.replit.app') && (
            <div>
              <h3 className="font-semibold mb-2">VeWorld Test URL</h3>
              <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <code className="flex-1 text-sm">{urls.current}/veworld-test</code>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => copyToClipboard(`${urls.current}/veworld-test`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Custom Domain Status</h3>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm">
                <code>recirclerewards.app</code> is not accessible - domain configuration needed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>VeWorld Wallet Connection Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {veWorldInstructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm">{instruction}</span>
              </li>
            ))}
          </ol>
          
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium">Important:</p>
            <p className="text-sm">VeWorld wallet only works in VeWorld's in-app browser, not regular browsers like Chrome or Safari.</p>
          </div>
        </CardContent>
      </Card>

      {urls.current.includes('.replit.app') && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Action</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/veworld-test" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open VeWorld Test Page
              </a>
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Copy this URL and paste it in VeWorld's in-app browser
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}