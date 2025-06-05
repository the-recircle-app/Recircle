import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import SupportFooter from '@/components/SupportFooter';

const FeedbackPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [feedbackType, setFeedbackType] = useState<string>('suggestion');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      toast({
        title: 'Feedback Required',
        description: 'Please provide some feedback before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real application, this would send the feedback to a server
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback! We appreciate your input.',
      });
      
      // Clear form
      setFeedbackText('');
      setEmail('');
      
      // Redirect to home after a brief delay
      setTimeout(() => setLocation('/'), 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-20">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-6 px-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            className="p-0 mr-2 text-white hover:bg-blue-800" 
            onClick={() => setLocation('/')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Button>
          <h1 className="text-2xl font-bold text-white">Send Feedback</h1>
        </div>
        
        <div className="bg-blue-800/50 rounded-lg p-4">
          <p className="text-blue-100 text-sm">
            Your feedback helps us improve ReCircle. Share your thoughts, suggestions, or report any issues you've encountered.
          </p>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-gray-200">How can we make ReCircle better?</CardTitle>
              <CardDescription className="text-gray-400">
                We value your input to continuously improve our app.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">What type of feedback do you have?</Label>
                <RadioGroup 
                  defaultValue="suggestion" 
                  value={feedbackType}
                  onValueChange={setFeedbackType}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="suggestion" id="suggestion" />
                    <Label htmlFor="suggestion" className="cursor-pointer text-gray-300">Suggestion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="issue" id="issue" />
                    <Label htmlFor="issue" className="cursor-pointer text-gray-300">Report an Issue</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="praise" id="praise" />
                    <Label htmlFor="praise" className="cursor-pointer text-gray-300">Praise</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer text-gray-300">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-gray-300">Your Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder={
                    feedbackType === 'suggestion' 
                      ? "I think it would be great if..." 
                      : feedbackType === 'issue' 
                      ? "I encountered a problem when..." 
                      : "Write your feedback here..."
                  }
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={5}
                  className="resize-none bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email for follow-up"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                />
                <p className="text-xs text-gray-500">
                  We'll only use your email to follow up on your feedback if needed.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setLocation('/')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <SupportFooter />
    </div>
  );
};

export default FeedbackPage;