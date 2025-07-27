import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Flame } from 'lucide-react';
import ReWardrobeLogo from './ReWardrobeLogo';

interface StreakCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  streakCount: number;
}

const StreakCelebration: React.FC<StreakCelebrationProps> = ({
  isVisible,
  onComplete,
  streakCount
}) => {
  const [stage, setStage] = useState<'initial' | 'confetti' | 'complete'>('initial');
  
  // Handle the celebration sequence
  useEffect(() => {
    if (!isVisible) return;
    
    // Start sequence
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    
    // First show the streak animation
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
      
      // Fire the confetti with streak colors (oranges and reds)
      myConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ef4444', '#fbbf24', '#fdba74'],
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
            <div className="absolute w-32 h-32 bg-orange-600 rounded-full opacity-20 animate-ping" />
            <div className="relative flex items-center justify-center w-24 h-24 bg-orange-600 rounded-full">
              <Flame className="w-12 h-12 text-white" />
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
            <div className="mb-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <ReWardrobeLogo className="h-8 mb-1" color="white" />
              </motion.div>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-orange-500/40" />
                <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-orange-600 to-red-500 rounded-full shadow-lg shadow-orange-900/30">
                  <Flame className="w-12 h-12 text-white" />
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="absolute font-bold text-2xl text-white"
                  >
                    {streakCount}
                  </motion.div>
                </div>
              </div>
            </div>
            
            <motion.h1 
              className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-orange-300 to-amber-200 text-transparent bg-clip-text"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {streakCount} Day Streak!
            </motion.h1>
            
            <motion.div
              className="flex items-center text-xl text-orange-300 mt-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Flame className="w-5 h-5 mr-1 text-orange-300" />
              Keep it up for more rewards!
            </motion.div>
            
            <motion.div
              className="mt-6 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white font-medium shadow-lg"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + {Math.min(10 + (Math.floor(streakCount / 7) * 10), 50)}% B3TR Reward Bonus!
            </motion.div>
            
            <motion.div
              className="mt-3 text-sm text-orange-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Next streak milestone: {Math.ceil(streakCount / 7) * 7} days
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
              <div className="text-lg">You're on fire!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreakCelebration;