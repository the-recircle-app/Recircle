import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const JoinWithReferral = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Get referral code from URL
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get('ref');
    
    if (referralCode) {
      // Store the referral code in localStorage or sessionStorage
      localStorage.setItem('referralCode', referralCode);
      
      toast({
        title: 'Welcome to ReCircle!',
        description: `You've been invited with referral code: ${referralCode}`,
      });
    }
    
    // Redirect to home page after a short delay
    const timer = setTimeout(() => {
      setLocation('/');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [setLocation, toast]);
  
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center p-6">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to ReCircle!</h1>
        <p className="text-blue-300">Processing your invitation...</p>
      </div>
    </div>
  );
};

export default JoinWithReferral;