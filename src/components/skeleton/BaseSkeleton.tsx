import React from 'react';

interface BaseSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
}

export default function BaseSkeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem', 
  rounded = 'md',
  animate = true 
}: BaseSkeletonProps) {
  const baseClasses = 'bg-gray-200';
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  const animateClass = animate ? 'animate-pulse' : '';

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${roundedClasses[rounded]} ${animateClass} ${className}`}
      style={style}
    />
  );
}
