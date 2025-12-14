
import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  isDangerous = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-gray-900 dark:text-white">
            <div className={`p-3 rounded-full ${isDangerous ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <FaExclamationTriangle size={20} />
            </div>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          
          <p className="text-gray-500 dark:text-gray-300 text-sm mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 justify-end">
            <button 
              onClick={onCancel}
              className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-colors ${isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
