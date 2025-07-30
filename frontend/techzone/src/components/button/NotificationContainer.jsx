import React from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const NotificationContainer = ({ notifications, onClose }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-[100px] right-8 z-50 flex flex-col gap-2">
      {notifications.map((notification) => {
        let styleClasses = 'border-2 bg-white rounded-lg px-4 py-3 shadow-lg flex items-center gap-3';
        if (notification.type === 'success') {
          styleClasses += ' border-light-green text-light-green';
        } else if (notification.type === 'warning') {
          styleClasses += ' border-yellow-400 text-yellow-600';
        } else {
          styleClasses += ' border-rose-400 text-rose-500 bg-red-50';
        }

        return (
          <div key={notification.id} className={`${styleClasses} animate-bounce-in ${notification.type === 'error' ? 'animate-error-pulse' : ''}`}>
            <p className={`text-sm ${notification.type === 'error' ? 'font-bold' : 'font-medium'}`}>{notification.message}</p>
            {onClose && (
              <button
                onClick={() => onClose(notification.id)}
                aria-label="Close notification"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NotificationContainer; 