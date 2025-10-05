import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSmartNavigation } from '../utils/navigation';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import B3trLogo from '../components/B3trLogo';
import BottomNavigation from '../components/BottomNavigation';

const InviteFriend = () => {
  const [, setLocation] = useLocation();
  const { goHome } = useSmartNavigation();
  const { isConnected, userId, tokenBalance } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCopied, setIsCopied] = useState(false);
  const referralCodeRef = useRef<HTMLInputElement>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [enteredCode, setEnteredCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's referral code
  const { data: referralCodeData, isLoading: isLoadingCode } = useQuery({
    queryKey: ['/api/users', userId, 'referral-code'],
    queryFn: async () => {
      if (!userId) return null;
      const res = await apiRequest('GET', `/api/users/${userId}/referral-code`);
      const data = await res.json();
      return data;
    },
    enabled: !!userId,
    refetchOnWindowFocus: false
  });

  // Fetch user's referrals
  const { data: referralsData, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['/api/users', userId, 'referrals'],
    queryFn: async () => {
      if (!userId) return null;
      const res = await apiRequest('GET', `/api/users/${userId}/referrals`);
      const data = await res.json();
      return data;
    },
    enabled: !!userId,
    refetchOnWindowFocus: false
  });

  // Update state when data is fetched
  useEffect(() => {
    if (referralCodeData && referralCodeData.referralCode) {
      setReferralCode(referralCodeData.referralCode);
    }
  }, [referralCodeData]);

  useEffect(() => {
    if (referralsData && referralsData.count !== undefined) {
      setReferralCount(referralsData.count);
    }
  }, [referralsData]);

  const handleCopyCode = () => {
    if (referralCodeRef.current && referralCode) {
      referralCodeRef.current.select();
      navigator.clipboard.writeText(referralCode);
      setIsCopied(true);
      
      toast({
        title: 'Code Copied',
        description: 'Referral code copied to clipboard',
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    }
  };

  const handleShareSocial = (platform: string) => {
    if (!referralCode) return;
    
    const shareText = `Join ReCircle and earn B3TR tokens for sustainable transportation! Use my referral code: ${referralCode}`;
    
    let shareUrl2 = "";
    
    switch (platform) {
      case 'X':
        shareUrl2 = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        break;
      case 'Facebook':
        shareUrl2 = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'WhatsApp':
        shareUrl2 = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        break;
      case 'Instagram':
        if (navigator.share) {
          navigator.share({
            title: 'Join ReCircle',
            text: shareText,
          }).catch(error => console.log('Error sharing:', error));
          
          toast({
            title: `Share on ${platform}`,
            description: `Opening share dialog for ${platform}...`,
          });
          return;
        } else {
          navigator.clipboard.writeText(shareText);
          toast({
            title: 'Code Copied for Instagram',
            description: 'Paste this code in your Instagram bio or direct message',
          });
          return;
        }
      default:
        if (navigator.share) {
          navigator.share({
            title: 'Join ReCircle',
            text: shareText,
          }).catch(error => console.log('Error sharing:', error));
          
          toast({
            title: `Share Content`,
            description: `Opening share dialog...`,
          });
          return;
        }
    }
    
    if (shareUrl2) {
      window.open(shareUrl2, '_blank', 'noopener,noreferrer');
      
      toast({
        title: `Share on ${platform}`,
        description: `Opening ${platform} sharing...`,
      });
    }
  };

  const handleSubmitReferralCode = async () => {
    if (!enteredCode.trim()) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a referral code',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiRequest('POST', `/api/users/${userId}/apply-referral`, {
        referralCode: enteredCode.trim().toUpperCase()
      });

      if (res.ok) {
        toast({
          title: 'Success!',
          description: 'Referral code applied successfully',
        });
        setEnteredCode('');
        queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      } else {
        const error = await res.json();
        toast({
          title: 'Invalid Code',
          description: error.message || 'This referral code is invalid or has already been used',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply referral code',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    goHome();
  };

  const renderShareButtons = () => {
    const XLogo = () => (
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );

    const socialButtons = [
      { name: 'X', icon: <XLogo />, displayName: '', color: 'bg-black hover:bg-gray-800 flex justify-center items-center' },
      { name: 'Facebook', icon: <i className="fab fa-facebook-f mr-2"></i>, displayName: 'Facebook', color: 'bg-[#1877F2] hover:bg-[#0d68d8]' },
      { name: 'Instagram', icon: <i className="fab fa-instagram mr-2"></i>, displayName: 'Instagram', color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90' },
      { name: 'WhatsApp', icon: <i className="fab fa-whatsapp mr-2"></i>, displayName: 'WhatsApp', color: 'bg-[#25D366] hover:bg-[#1fb055]' },
    ];

    return (
      <div className="grid grid-cols-2 gap-3 mt-4">
        {socialButtons.map((button) => (
          <Button
            key={button.name}
            className={`${button.color} text-white w-full`}
            onClick={() => handleShareSocial(button.name)}
          >
            {button.icon}
            {button.displayName}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 px-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            className="p-0 mr-2 text-white hover:bg-blue-700" 
            onClick={handleBackToHome}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Button>
          <h1 className="text-2xl font-bold text-white">Invite Friends</h1>
        </div>
        
        <div className="bg-blue-700/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Reward Per Referral</h3>
            <div className="flex items-center gap-1 bg-blue-600 px-3 py-1 rounded-full">
              <span className="text-white font-medium">bonus B3TR</span>
            </div>
          </div>
          <p className="text-blue-100 text-sm">
            Invite your friends to join ReCircle. You'll earn bonus B3TR tokens for each friend who joins and scans their first receipt!
          </p>
        </div>
      </div>

      <div className="p-4">
        {/* Your Referral Code Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>
              Share this code with friends to earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Code</p>
              {isLoadingCode ? (
                <div className="h-12 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="text-4xl font-bold text-gray-900 tracking-wider mb-4">
                  {referralCode || 'LOADING...'}
                </div>
              )}
              <Input
                ref={referralCodeRef}
                value={referralCode || ''}
                readOnly
                className="hidden"
              />
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleCopyCode}
                disabled={!referralCode}
              >
                {isCopied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Have a Referral Code Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Have a Referral Code?</CardTitle>
            <CardDescription>
              Enter a friend's code to get started with a bonus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="referral-code-input">Referral Code</Label>
                <Input
                  id="referral-code-input"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                  placeholder="Enter code here..."
                  className="mt-1"
                  maxLength={20}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSubmitReferralCode}
                disabled={isSubmitting || !enteredCode.trim()}
              >
                {isSubmitting ? 'Applying...' : 'Apply Code'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Sharing Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Share on Social Media</CardTitle>
            <CardDescription>
              Share your referral code on your favorite platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderShareButtons()}
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Your Total Referrals</p>
              <div className="flex items-center justify-center gap-2">
                <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                {isLoadingReferrals ? (
                  <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                ) : (
                  <span className="text-xl font-semibold">{referralCount}</span>
                )}
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      <BottomNavigation isConnected={isConnected} />
    </div>
  );
};

export default InviteFriend;
