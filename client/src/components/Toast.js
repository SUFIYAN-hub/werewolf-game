import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: <CheckCircle className="w-6 h-6" />,
          border: 'border-green-400'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: <XCircle className="w-6 h-6" />,
          border: 'border-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          icon: <AlertTriangle className="w-6 h-6" />,
          border: 'border-yellow-400'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          icon: <Info className="w-6 h-6" />,
          border: 'border-blue-400'
        };
    }
  };

  const style = getToastStyle();

  return (
    <div className={`fixed top-20 right-4 z-50 ${style.bg} text-white px-6 py-4 rounded-lg shadow-2xl border-2 ${style.border} animate-slideIn max-w-md`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default Toast;