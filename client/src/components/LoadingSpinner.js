import React from 'react';

function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} border-white border-t-transparent rounded-full animate-spin`}></div>
      {text && <p className="text-white mt-3 text-sm">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;