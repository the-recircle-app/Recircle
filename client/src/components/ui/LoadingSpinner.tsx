interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = "w-6 h-6" }: LoadingSpinnerProps) {
  return (
    <div 
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}