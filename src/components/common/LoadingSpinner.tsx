import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}></div>
  );
}

// Full screen centered loading spinner
export function FullScreenLoadingSpinner({ 
  size = 'lg',
  color = 'blue'
}: Omit<LoadingSpinnerProps, 'className'>) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <LoadingSpinner size={size} color={color} />
    </div>
  );
}

// Container centered loading spinner
export function CenteredLoadingSpinner({ 
  size = 'md',
  color = 'blue',
  className = ''
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <LoadingSpinner size={size} color={color} className={className} />
    </div>
  );
}
