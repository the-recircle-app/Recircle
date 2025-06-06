import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight, Zap, Leaf, Award, MapPin } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            ReCircle Transportation
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Earn B3TR tokens for sustainable transportation choices. From rideshare to electric vehicles, 
            every eco-friendly trip counts toward a greener future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/connect-wallet">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/transportation">
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Find Locations
                <MapPin className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Zap className="h-8 w-8 text-green-400" />
                <CardTitle className="text-white">Electric Vehicles</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Rent Tesla, EV cars, and hybrids. Upload your rental receipts to earn B3TR tokens 
                for choosing sustainable transportation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Leaf className="h-8 w-8 text-blue-400" />
                <CardTitle className="text-white">Rideshare Services</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Use Uber, Lyft, Waymo, and other rideshare services. Submit receipts to earn 
                rewards for reducing single-occupancy vehicle trips.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-purple-400" />
                <CardTitle className="text-white">Public Transit</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Metro cards, bus passes, and train tickets count. Support public transportation 
                and earn B3TR tokens for your sustainable choices.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Impact Dashboard</h2>
            <p className="text-gray-300">Track your environmental impact and rewards</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">2,847</div>
              <div className="text-gray-300">B3TR Tokens Distributed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">1,203</div>
              <div className="text-gray-300">Receipts Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">456</div>
              <div className="text-gray-300">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">89%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Connect your VeChain wallet and begin earning B3TR tokens for sustainable transportation choices.
          </p>
          <Link href="/connect-wallet">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              Connect Wallet & Start Earning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;