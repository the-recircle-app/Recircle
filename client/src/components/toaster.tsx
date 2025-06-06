import React from 'react';
import { useToast } from '../../hooks/use-toast';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all
            ${toast.variant === 'destructive' 
              ? 'border-red-500/50 bg-red-900/90 text-red-50' 
              : 'border-gray-700 bg-gray-900/90 text-gray-50'
            }
          `}
        >
          <div className="grid gap-1">
            <div className="text-sm font-semibold">{toast.title}</div>
            {toast.description && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}