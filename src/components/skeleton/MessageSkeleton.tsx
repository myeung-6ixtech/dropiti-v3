import React from 'react';
import BaseSkeleton from './BaseSkeleton';

interface MessageSkeletonProps {
  count?: number;
  className?: string;
  variant?: 'sent' | 'received';
}

export default function MessageSkeleton({ 
  count = 3, 
  className = '', 
  variant = 'received' 
}: MessageSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div 
          key={index} 
          className={`flex ${variant === 'sent' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-xs ${variant === 'sent' ? 'order-2' : 'order-1'}`}>
            {/* Message bubble skeleton */}
            <div className="space-y-2">
              <BaseSkeleton 
                width={Math.random() * 100 + 150} // Random width between 150-250px
                height={20} 
                rounded="lg"
              />
              {Math.random() > 0.5 && (
                <BaseSkeleton 
                  width={Math.random() * 80 + 100} // Random width between 100-180px
                  height={20} 
                  rounded="lg"
                />
              )}
            </div>
            
            {/* Timestamp skeleton */}
            <BaseSkeleton 
              width={60} 
              height={12} 
              className={`mt-1 ${variant === 'sent' ? 'ml-auto' : 'mr-auto'}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
