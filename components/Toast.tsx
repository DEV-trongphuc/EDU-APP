
import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <FaCheckCircle className="text-green-500 text-xl" />;
      case 'error': return <FaExclamationCircle className="text-red-500 text-xl" />;
      default: return <FaInfoCircle className="text-blue-500 text-xl" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      default: return 'border-blue-500';
    }
  };

  return (
    <div 
      className={`fixed top-24 right-4 z-[130] bg-white dark:bg-gray-800 border-l-4 ${getBorderColor()} shadow-2xl p-4 rounded-r-lg flex items-center gap-3 min-w-[300px] max-w-sm transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      {getIcon()}
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 dark:text-white text-sm capitalize">{type}</h4>
        <p className="text-gray-600 dark:text-gray-300 text-xs">{message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
