import React from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  let styleClasses = 'border-2 bg-white rounded-lg px-4 py-2 shadow-lg';
  if (type === 'success') {
    styleClasses +=
        'border-light-green text-light-green';
  } else {
    styleClasses +=
        'border-rose-400 text-rose-500 ';
  }

  return (
    <div className={`fixed top-[60px] right-8 z-50 flex items-center gap-3 ${styleClasses} animate-bounce-in`}>
      <p className={`text-sm font-medium`}>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close notification"
        >
          <XCircleIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Notification;