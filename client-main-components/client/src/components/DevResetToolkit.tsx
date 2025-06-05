import React, { useEffect, useState, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

/**
 * Development-only toolkit with utilities for resetting app state
 * This component is only rendered in development mode
 */
const DevResetToolkit: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded by default
  // Set initial position to top left instead of bottom right to avoid blocking content
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const toolkitRef = useRef<HTMLDivElement>(null);
  
  // Reset local storage and session storage
  const resetLocalState = useCallback(() => {
    console.log('[DEV] Reset Local State button clicked');
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('[DEV] Local storage cleared successfully');
      toast({
        title: 'Local state reset',
        description: 'localStorage and sessionStorage cleared successfully',
      });
      
      // Force page reload after a short delay
      setTimeout(() => {
        console.log('[DEV] Reloading page...');
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error('[DEV] Error clearing local storage:', e);
      toast({
        title: 'Reset Failed',
        description: 'Failed to clear local storage: ' + (e as Error).message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Reset backend user data
  const resetBackendUser = useCallback(async () => {
    console.log('[DEV] Reset Backend User button clicked, userId:', userId);
    if (!userId) {
      console.log('[DEV] No user ID provided');
      toast({
        title: 'No User Selected',
        description: 'Please enter a valid user ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[DEV] Making API request to reset user:', userId);
      const response = await apiRequest('GET', `/api/debug/reset-user/${userId}`);
      const result = await response.json();
      console.log('[DEV] Reset API response:', result);
      
      toast({
        title: 'Backend User Reset',
        description: result.message || 'User data reset successfully',
      });
      
      // After backend reset, also clear frontend state
      console.log('[DEV] Triggering frontend reset after backend reset');
      resetLocalState();
    } catch (e) {
      console.error('[DEV] Error resetting backend user:', e);
      toast({
        title: 'Reset Failed',
        description: 'Failed to reset backend user: ' + (e as Error).message,
        variant: 'destructive',
      });
    }
  }, [userId, toast, resetLocalState]);

  // Reset everything (both frontend and backend)
  const resetEverything = useCallback(async () => {
    if (!userId) {
      toast({
        title: 'No User Selected',
        description: 'Please enter a valid user ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First reset backend
      await resetBackendUser();
      // Local state will be reset by resetBackendUser
    } catch (e) {
      toast({
        title: 'Full Reset Failed',
        description: 'Failed to perform full reset: ' + (e as Error).message,
        variant: 'destructive',
      });
    }
  }, [userId, toast, resetBackendUser]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection during drag
    
    if (toolkitRef.current) {
      const rect = toolkitRef.current.getBoundingClientRect();
      // Calculate the offset from the mouse position to the element's top-left corner
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      
      console.log('[DEV] Drag started at:', e.clientX, e.clientY);
    }
  }, []);
  
  // Touch event handlers for mobile devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (toolkitRef.current && e.touches.length === 1) {
      e.preventDefault(); // Prevent scrolling on touch devices
      const touch = e.touches[0];
      const rect = toolkitRef.current.getBoundingClientRect();
      
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      setIsDragging(true);
      
      console.log('[DEV] Touch drag started at:', touch.clientX, touch.clientY);
    }
  }, []);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      
      // Calculate new position based on touch position and initial offset
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      
      // Ensure the toolkit stays within viewport bounds
      const maxX = window.innerWidth - (toolkitRef.current?.offsetWidth || 200);
      const maxY = window.innerHeight - (toolkitRef.current?.offsetHeight || 200);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset]);
  
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    // Save position to localStorage for persistence
    try {
      localStorage.setItem('devToolkitPosition', JSON.stringify(position));
    } catch (e) {
      console.error('Error saving toolkit position:', e);
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      // Calculate new position based on mouse position and initial offset
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Ensure the toolkit stays within viewport bounds
      const maxX = window.innerWidth - (toolkitRef.current?.offsetWidth || 200);
      const maxY = window.innerHeight - (toolkitRef.current?.offsetHeight || 200);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    
    // Save position to localStorage for persistence
    try {
      localStorage.setItem('devToolkitPosition', JSON.stringify(position));
    } catch (e) {
      console.error('Error saving toolkit position:', e);
    }
  }, [position]);

  // Helper function to grab user ID from local storage
  const findUserIdInLocalStorage = useCallback(() => {
    // Check multiple possible localStorage keys
    const possibleKeys = ['user', 'userData', 'currentUser', 'authUser'];
    
    for (const key of possibleKeys) {
      try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // Check common ID properties
          if (parsedData.id) {
            console.log(`[DEV] Found user ID ${parsedData.id} in localStorage.${key}`);
            return parsedData.id.toString();
          } else if (parsedData.userId) {
            console.log(`[DEV] Found user ID ${parsedData.userId} in localStorage.${key}`);
            return parsedData.userId.toString();
          }
        }
      } catch (e) {
        console.error(`Error checking localStorage.${key}:`, e);
      }
    }
    
    // Default user ID (for testing) if nothing found
    console.log('[DEV] No user ID found in localStorage, using default user ID 102');
    return '102';
  }, []);

  useEffect(() => {
    // Try to load saved position
    try {
      const savedPosition = localStorage.getItem('devToolkitPosition');
      if (savedPosition) {
        setPosition(JSON.parse(savedPosition));
      }
    } catch (e) {
      console.error('Error loading toolkit position:', e);
    }
    
    // Set user ID from localStorage or default to 1 (current logged-in user)
    const foundUserId = findUserIdInLocalStorage();
    setUserId(foundUserId === '102' ? '1' : foundUserId);

    // Set up keyboard shortcut (Alt+Shift+R) for resetting local state
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Alt+Shift+R
      if (e.altKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        console.log('[DEV] Keyboard shortcut triggered: Alt+Shift+R - Resetting local state');
        resetLocalState();
      }
    };

    // Only add event listener in development mode
    if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [resetLocalState, findUserIdInLocalStorage]);
  
  // Add mouse/touch move and up/end handlers globally when dragging
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      // Touch events
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    } else {
      // Remove mouse events
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Remove touch events
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    }
    
    return () => {
      // Clean up all event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development' && !import.meta.env.DEV) {
    return null;
  }

  return (
    <div 
      ref={toolkitRef}
      className="fixed z-50"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        touchAction: 'none' // Prevents scrolling while dragging on touch devices
      }}
    >
      {/* Collapsible panel */}
      <div 
        className={`bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg border border-gray-700 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Header with drag handle and toggle - entire header can be dragged */}
        <div 
          className="flex items-center justify-between mb-2 select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">
              ≡ {/* Better drag handle symbol */}
            </span>
            <h3 
              className="text-sm font-semibold text-yellow-400"
              onClick={(e) => {
                // Only toggle if we're not dragging
                if (!isDragging) {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }
              }}
            >
              DEV TOOLKIT
            </h3>
          </div>
          <span 
            className="text-xs px-2 py-1" // Increased click target size
            onClick={(e) => {
              // Only toggle if we're not dragging
              if (!isDragging) {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }
            }}
          >
            {isExpanded ? '▼' : '▲'}
          </span>
        </div>
        
        {/* Collapsible content */}
        {isExpanded && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* User ID input */}
            <div className="flex gap-2 items-center">
              <label className="text-xs whitespace-nowrap">User ID:</label>
              <input 
                type="text" 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)}
                className="bg-gray-800 text-white text-xs px-2 py-1 rounded w-16"
              />
            </div>
            
            {/* Reset buttons */}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetLocalState();
                }}
                className="bg-blue-800 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded cursor-pointer"
                type="button"
              >
                Reset Frontend State (Alt+Shift+R)
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetBackendUser();
                }}
                className="bg-purple-800 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded cursor-pointer"
                type="button"
              >
                Reset Backend User
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetEverything();
                }}
                className="bg-red-800 hover:bg-red-700 text-white text-xs py-1 px-2 rounded cursor-pointer"
                type="button"
              >
                Reset Everything
              </button>
            </div>
            
            {/* Admin access button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLocation('/admin/pending-submissions');
              }}
              className="bg-amber-800 hover:bg-amber-700 text-white text-xs py-1 px-2 rounded cursor-pointer"
              type="button"
            >
              Admin: Pending Submissions
            </button>
            
            {/* Status info */}
            <div className="text-xs text-gray-400">
              <div>User ID: {userId || 'None'}</div>
              <div className="text-xs text-gray-500 mt-1 italic">
                Drag header to move • Click to toggle
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevResetToolkit;