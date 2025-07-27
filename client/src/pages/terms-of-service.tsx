import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ReCircle User Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              By using ReCircle, you agree to earn B3TR tokens for sustainable transportation receipts. 
              We validate receipts through AI and manual review to prevent fraud.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Receipt Data</h4>
              <p className="text-blue-700 text-sm">
                Receipt images may contain pickup/dropoff locations and trip details. This data is used only 
                for validation and is automatically deleted after 90 days. Only our team reviews receipts.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">How It Works</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Upload receipts from rideshare, electric vehicles, or public transit</li>
                <li>AI validates receipt authenticity and eligibility</li>
                <li>Earn B3TR tokens distributed through VeBetterDAO</li>
                <li>Fraudulent submissions result in account suspension</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                <strong>Disclaimer:</strong> B3TR tokens have no guaranteed value. Service provided "as is" 
                without warranties. You must be 13+ to use ReCircle.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button onClick={() => setLocation("/")} className="bg-primary">
          Got it - Return to ReCircle
        </Button>
      </div>
    </div>
  );
}