import React, { useEffect, useState } from 'react';
import Icon from './Icon';

export interface NotificationToastProps {
  id: string;
  type: 'success' | 'error';
  title: string;
  message: string;
  onRemove: (id: string) => void;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ id, type, title, message, onRemove, duration = 5000 }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration]);

  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(() => onRemove(id), 300); // Wait for fade-out animation
  };

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const iconName = type === 'success' ? 'check-circle-solid' : 'x-circle-solid';

  return (
    <div
      className={`relative flex items-start w-full max-w-sm p-4 text-white ${bgColor} rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform ${isFadingOut ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      style={{ animation: 'slideInRight 0.3s ease-out forwards' }}
    >
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div className="flex-shrink-0">
        <Icon name={iconName} className="w-6 h-6" />
      </div>
      <div className="ms-3 w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm whitespace-pre-wrap">{message}</p>
      </div>
      <div className="ms-4 flex-shrink-0 flex">
        <button
          onClick={handleClose}
          className="inline-flex text-white rounded-md p-1.5 hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
        >
          <span className="sr-only">Close</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
