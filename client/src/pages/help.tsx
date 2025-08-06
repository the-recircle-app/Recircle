import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SupportFooter from '@/components/SupportFooter';
import B3trLogo from '@/components/B3trLogo';

const HelpPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const faqItems = [
    {
      question: "What is ReCircle?",
      answer: "ReCircle is a blockchain-powered sustainable shopping platform that transforms eco-conscious consumption into an engaging, transparent, and rewarding experience using VeChain Thor technology."
    },
    {
      question: "How do I earn B3TR tokens?",
      answer: "You can earn B3TR tokens by scanning receipts from thrift store purchases, referring friends to join ReCircle, and maintaining a daily streak by using the app regularly."
    },
    {
      question: "Why do I need to connect a wallet?",
      answer: "Connecting a VeWorld wallet allows you to securely receive and store your earned B3TR tokens on the VeChain Thor blockchain, providing full ownership of your rewards."
    },
    {
      question: "How do I scan my receipt?",
      answer: "After making a purchase at a thrift store, navigate to the 'Scan' tab, take a clear photo of your receipt, and our system will validate it to award you B3TR tokens."
    },
    {
      question: "What happens if my receipt isn't recognized?",
      answer: "If your receipt isn't recognized automatically, our team will manually review it within 24-48 hours to ensure you receive your rewards."
    }
  ];

  const supportCategories = [
    { 
      title: "Wallet Connection", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    },
    { 
      title: "Token Rewards", 
      icon: <B3trLogo className="w-6 h-6" color="#38BDF8" />
    },
    { 
      title: "Receipt Scanning", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 8h.01" />
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M4 16l4-4a3 5 0 0 1 3 0l5 5" />
          <path d="M14 14l1-1a3 5 0 0 1 3 0l2 2" />
        </svg>
      )
    },
    { 
      title: "Account Issues", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

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
          <h1 className="text-2xl font-bold text-white">Help & Support</h1>
        </div>
        
        <div className="bg-blue-800/50 rounded-lg p-4">
          <p className="text-blue-100 text-sm">
            Find answers to common questions or get in touch with our support team for further assistance.
          </p>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Support Categories</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {supportCategories.map((category, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow bg-gray-800 border-gray-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-blue-900/60 p-2 rounded-full text-blue-400">
                  {category.icon}
                </div>
                <span className="font-medium text-gray-200">{category.title}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="p-4 pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-gray-700">
                  <AccordionTrigger className="text-left font-medium text-gray-200">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-400">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-200">Contact Support</CardTitle>
            <CardDescription className="text-gray-400">
              Still need help? Our support team is here for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Chat with Support
            </Button>
            <Button variant="outline" className="w-full justify-start border-gray-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="4" />
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
              </svg>
              Send Email
            </Button>
          </CardContent>
        </Card>
      </div>

      <SupportFooter />
    </div>
  );
};

export default HelpPage;