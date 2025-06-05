import React from 'react';

const SupportFooter: React.FC = () => {
  return (
    <footer className="w-full py-4 px-6 bg-gray-800 border-t border-gray-700">
      <div className="flex justify-center gap-8 text-sm text-gray-300">
        <a 
          href="https://forms.gle/p6tx58CirWn4s4ew5"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 flex items-center gap-1.5 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Send Feedback
        </a>
        <a 
          href="https://forms.gle/UrNdize3gQHXf8s67"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 flex items-center gap-1.5 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Need Help?
        </a>
      </div>
      <div className="text-xs text-center text-gray-500 mt-3">
        &copy; {new Date().getFullYear()} ReCircle • All rights reserved
      </div>
    </footer>
  );
};

export default SupportFooter;