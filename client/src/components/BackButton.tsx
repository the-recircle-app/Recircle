import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  href: string;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  href = "/home", 
  label = "Back" 
}) => {
  return (
    <Link href={href}>
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full bg-primary/20 border-primary/40 hover:bg-primary/30 hover:border-primary/60"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 text-primary"
        >
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <span className="sr-only">{label}</span>
      </Button>
    </Link>
  );
};

export default BackButton;