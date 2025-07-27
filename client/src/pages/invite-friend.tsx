import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import B3trLogo from '../components/B3trLogo';
import BottomNavigation from '../components/BottomNavigation';

const InviteFriend = () => {
  const [, setLocation] = useLocation();
  const { isConnected, userId, tokenBalance } = useWallet();
  const { toast } = useToast();
  const [inviteMethod, setInviteMethod] = useState('sms');
  const [inviteInfo, setInviteInfo] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isInviteSent, setIsInviteSent] = useState(false);
  const inviteLinkRef = useRef<HTMLInputElement>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);

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

  // Create invite link based on the user's referral code
  const appBaseUrl = window.location.origin;
  const inviteLink = referralCode 
    ? `${appBaseUrl}/join?ref=${referralCode}`
    : 'Loading your unique invite link...';

  const handleCopyLink = () => {
    if (inviteLinkRef.current) {
      inviteLinkRef.current.select();
      document.execCommand('copy');
      setIsCopied(true);
      
      toast({
        title: 'Link Copied',
        description: 'Invite link copied to clipboard',
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    }
  };

  const handleSendInvite = () => {
    if (!inviteInfo) {
      toast({
        title: 'Information Required',
        description: inviteMethod === 'sms' 
          ? 'Please enter a phone number' 
          : 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, this would send an actual SMS or email
    setIsInviteSent(true);
    
    toast({
      title: 'Invitation Sent',
      description: `Invitation sent to ${inviteInfo}`,
    });
    
    setTimeout(() => {
      setIsInviteSent(false);
      setInviteInfo('');
    }, 2000);
  };

  const handleShareSocial = (platform: string) => {
    const shareText = "Join ReCircle and earn B3TR tokens for recycling clothes! Use my invite code to get started.";
    const shareUrl = inviteLink;
    
    // Open appropriate share URL based on platform
    let shareUrl2 = "";
    
    switch (platform) {
      case 'X':
        shareUrl2 = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'Facebook':
        shareUrl2 = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'WhatsApp':
        shareUrl2 = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case 'Instagram':
        // Instagram doesn't have a direct sharing URL, we'll use Web Share API if supported
        if (navigator.share) {
          navigator.share({
            title: 'Join ReCircle',
            text: shareText,
            url: shareUrl,
          }).catch(error => console.log('Error sharing:', error));
          
          toast({
            title: `Share on ${platform}`,
            description: `Opening share dialog for ${platform}...`,
          });
          return;
        } else {
          // Fall back to copying to clipboard for Instagram
          if (inviteLinkRef.current) {
            inviteLinkRef.current.select();
            document.execCommand('copy');
            
            toast({
              title: 'Link Copied for Instagram',
              description: 'Copy this link to your Instagram bio or direct message',
            });
          }
          return;
        }
      default:
        // Use Web Share API for other platforms if available
        if (navigator.share) {
          navigator.share({
            title: 'Join ReCircle',
            text: shareText,
            url: shareUrl,
          }).catch(error => console.log('Error sharing:', error));
          
          toast({
            title: `Share Content`,
            description: `Opening share dialog...`,
          });
          return;
        }
    }
    
    // Open the share URL in a new window/tab
    if (shareUrl2) {
      window.open(shareUrl2, '_blank', 'noopener,noreferrer');
      
      toast({
        title: `Share on ${platform}`,
        description: `Opening ${platform} sharing...`,
      });
    }
  };

  const handleBackToHome = () => {
    setLocation('/');
  };

  const renderShareButtons = () => {
    // Define custom X logo as SVG (larger and centered as the only content)
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
              <B3trLogo className="w-5 h-5" color="#38BDF8" />
              <span className="text-white font-medium">15 tokens</span>
            </div>
          </div>
          <p className="text-blue-100 text-sm">
            Invite your friends to join ReCircle. You'll earn 15 B3TR tokens for each friend who joins and scans their first receipt!
          </p>
        </div>
      </div>

      <div className="p-4">
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Share Your Invite Link</CardTitle>
            <CardDescription>
              Copy your unique invite link and share it with friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                ref={inviteLinkRef}
                value={inviteLink}
                readOnly
                className="pr-24"
              />
              <Button
                className="absolute right-0 top-0 h-full rounded-l-none"
                onClick={handleCopyLink}
              >
                {isCopied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Send Direct Invitation</CardTitle>
            <CardDescription>
              Send an invitation directly to your friend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sms" onValueChange={setInviteMethod}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="sms" className="flex-1">SMS</TabsTrigger>
                <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sms">
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={inviteInfo}
                      onChange={(e) => setInviteInfo(e.target.value)}
                      className="pr-24"
                    />
                    <Button
                      className="absolute right-0 top-0 h-full rounded-l-none"
                      onClick={handleSendInvite}
                      disabled={isInviteSent}
                    >
                      {isInviteSent ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 animate-spin">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                          </svg>
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    We'll send a text message with your invite link
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="email">
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteInfo}
                    onChange={(e) => setInviteInfo(e.target.value)}
                    className="mb-3"
                  />
                  <Textarea
                    placeholder="Add a personal message (optional)"
                    rows={3}
                    className="mb-3"
                  />
                  <Button className="w-full" onClick={handleSendInvite} disabled={isInviteSent}>
                    {isInviteSent ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Share on Social Media</CardTitle>
            <CardDescription>
              Share your invitation on your favorite platforms
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