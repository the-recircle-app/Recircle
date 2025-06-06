import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft, Search, MapPin } from 'lucide-react';

const NotFound: React.FC = () => {
  const quickLinks = [
    {
      href: '/profile',
      label: 'View Profile',
      description: 'Check your B3TR balance and recent activity',
      icon: <Home className="h-5 w-5" />
    },
    {
      href: '/scan',
      label: 'Scan Receipt',
      description: 'Upload transportation receipts to earn tokens',
      icon: <Search className="h-5 w-5" />
    },
    {
      href: '/transportation',
      label: 'Find Locations',
      description: 'Discover sustainable transportation options',
      icon: <MapPin className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="container mx-auto max-w-2xl text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold text-white/20 mb-4">404</div>
          <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-gray-300 text-lg mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Links</CardTitle>
            <CardDescription className="text-gray-300">
              Navigate to popular sections of ReCircle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {quickLinks.map((link, index) => (
                <Link key={index} href={link.href}>
                  <div className="flex items-center space-x-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700 hover:border-green-500/50 transition-all cursor-pointer">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center text-green-400">
                      {link.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-semibold">{link.label}</h3>
                      <p className="text-gray-300 text-sm">{link.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <p className="text-gray-400 text-sm">
            Need help? Contact support at{' '}
            <span className="text-green-400">support@recircle.app</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;