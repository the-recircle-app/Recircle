import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, ZapIcon } from 'lucide-react';
import ReCircleLogoEarth from './ReCircleLogoEarth';

interface ConnectionCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
}

const ConnectionCelebration: React.FC<ConnectionCelebrationProps> = ({
  isVisible,
  onComplete
}) => {
  const [stage, setStage] = useState<'initial' | 'confetti' | 'complete'>('initial');
  
  // Handle the celebration sequence
  useEffect(() => {
    if (!isVisible) return;
    
    // Start sequence
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    
    // First show the check animation
    setStage('initial');
    
    // After a delay, show the confetti
    timer1 = setTimeout(() => {
      setStage('confetti');
      
      // Trigger confetti effect
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '9999';
      canvas.style.pointerEvents = 'none';
      document.body.appendChild(canvas);
      
      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
      });
      
      // Fire the confetti with custom colors (blue and white)
      myConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#ffffff', '#1d4ed8'],
        shapes: ['circle', 'square'],
        gravity: 0.8,
        zIndex: 9999
      });
      
      // After another delay, finish the animation sequence
      timer2 = setTimeout(() => {
        setStage('complete');
        document.body.removeChild(canvas);
        
        // Call onComplete after the animation sequence is done
        setTimeout(onComplete, 1000);
      }, 3000);
    }, 1500);
    
    // Cleanup timers
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isVisible, onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <AnimatePresence>
        {stage === 'initial' && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute w-32 h-32 bg-blue-600 rounded-full opacity-20 animate-ping" />
            <div className="relative flex items-center justify-center w-24 h-24 bg-blue-600 rounded-full">
              <Check className="w-12 h-12 text-white" />
            </div>
          </motion.div>
        )}
        
        {stage === 'confetti' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-white"
          >
            <div className="flex items-center justify-center mb-4">
              <ReCircleLogoEarth size="lg" variant="gradient" />
            </div>
            <motion.h1 
              className="text-3xl font-bold mb-2 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Wallet Connected!
            </motion.h1>
            <motion.div
              className="flex items-center text-xl text-blue-300 mt-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <ZapIcon className="w-5 h-5 mr-1 text-blue-300" />
              Ready to earn B3TR tokens
            </motion.div>
          </motion.div>
        )}
        
        {stage === 'complete' && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-white"
          >
            <div className="text-center">
              <div className="text-lg">Let's go!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectionCelebration;