import React from 'react';
import ReCircleTextLogo from '../components/ReCircleTextLogo';
import ReCircleLogoIntegrated from '../components/ReCircleLogoIntegrated';
import ReCircleLogoEarth from '../components/ReCircleLogoEarth';
import { Link } from 'wouter';

const LogoShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6 flex">
          <Link href="/home" className="text-blue-400 hover:text-blue-300 flex items-center mb-8">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8 text-center">ReCircle Logo Showcase</h1>
        
        <div className="grid grid-cols-1 gap-12">
          {/* Original logo with symbol on the side */}
          <div className="bg-gray-800 rounded-lg p-8 shadow">
            <h2 className="text-xl font-semibold mb-4">Original Logo (with icon on side)</h2>
            <div className="flex items-center justify-center h-20 mb-4">
              <ReCircleTextLogo size="lg" colorScheme="white" />
            </div>
            <div className="flex items-center justify-center h-20 mb-4 bg-white rounded-md">
              <ReCircleTextLogo size="lg" colorScheme="blue" />
            </div>
            <p className="text-gray-400 text-center">The classic ReCircle logo with the refresh icon on the right side</p>
          </div>
          
          {/* Integrated C-replacement logo */}
          <div className="bg-gray-800 rounded-lg p-8 shadow">
            <h2 className="text-xl font-semibold mb-4">Integrated Logo (icon replaces C)</h2>
            <div className="flex items-center justify-center h-20 mb-4">
              <ReCircleLogoIntegrated size="lg" colorScheme="white" />
            </div>
            <div className="flex items-center justify-center h-20 mb-4 bg-white rounded-md">
              <ReCircleLogoIntegrated size="lg" colorScheme="blue" />
            </div>
            <p className="text-gray-400 text-center">The refresh icon seamlessly replaces the "C" in ReCircle</p>
          </div>
          
          {/* Earth colors version */}
          <div className="bg-gray-800 rounded-lg p-8 shadow">
            <h2 className="text-xl font-semibold mb-4">Earth Colors Logo (gradient)</h2>
            <div className="flex items-center justify-center h-20 mb-4">
              <ReCircleLogoEarth size="lg" variant="gradient" />
            </div>
            <div className="flex items-center justify-center h-20 mb-4 bg-white rounded-md">
              <ReCircleLogoEarth size="lg" variant="gradient" />
            </div>
            <p className="text-gray-400 text-center">Earth-themed gradients with forest green and ocean blue</p>
          </div>
          
          {/* Earth colors version - solid */}
          <div className="bg-gray-800 rounded-lg p-8 shadow">
            <h2 className="text-xl font-semibold mb-4">Earth Colors Logo (solid)</h2>
            <div className="flex items-center justify-center h-20 mb-4">
              <ReCircleLogoEarth size="lg" variant="solid" />
            </div>
            <div className="flex items-center justify-center h-20 mb-4 bg-white rounded-md">
              <ReCircleLogoEarth size="lg" variant="solid" />
            </div>
            <p className="text-gray-400 text-center">Solid earth colors without gradients</p>
          </div>
          
          {/* Different sizes */}
          <div className="bg-gray-800 rounded-lg p-8 shadow">
            <h2 className="text-xl font-semibold mb-4">Size Variations</h2>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-8">
                <div className="text-right w-20">Small:</div>
                <ReCircleLogoEarth size="sm" variant="gradient" />
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right w-20">Medium:</div>
                <ReCircleLogoEarth size="md" variant="gradient" />
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right w-20">Large:</div>
                <ReCircleLogoEarth size="lg" variant="gradient" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoShowcase;