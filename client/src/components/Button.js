import React from 'react';
import { Loader2, Check } from 'lucide-react';

function Button({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  success = false,
  icon: Icon,
  fullWidth = false,
  className = ''
}) {
  
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 transform hover-scale flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:ring-purple-500',
    secondary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
    warning: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500',
    ghost: 'bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50',
    outline: 'bg-transparent border-2 border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading || success}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {/* Loading State */}
      {loading && (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </>
      )}
      
      {/* Success State */}
      {success && !loading && (
        <>
          <Check className="w-5 h-5 animate-bounce" />
          <span>Success!</span>
        </>
      )}
      
      {/* Normal State */}
      {!loading && !success && (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

export default Button;