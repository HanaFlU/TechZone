import React from 'react';

const MenuItem = ({ icon, icon2, label, active, isOpen, onClick, notify, outline, children }) => {
    return (
      <div className={`relative group ${outline ? "border-t border-gray-300 pt-2" : ""}`}>
        <div
          onClick={onClick}
          className={`flex items-center justify-between hover:bg-emerald-100 p-2 rounded cursor-pointer my-2 ${active ? "bg-emerald-100" : ""}`}
        >
          <div className='flex items-center space-x-2 relative'>
            {active ? <span className='text-emerald-600'>{icon}</span> : icon2}
            {isOpen && <span className={`text-base ${active ? "font-semibold text-emerald-600" : "text-dark-green"}`}>{label}</span>}
            {!isOpen && notify && <div className='absolute top-0 right-2 w-2 h-2 rounded-full bg-emerald-600'></div>}
          </div>
          {isOpen && notify && <div className='w-2 h-2 rounded-full bg-emerald-600'></div>}
        </div>
        {isOpen && children && (
          <div>{children}</div>
        )}
        {!isOpen && (
          <span className="absolute left-14 top-1/2 transform -translate-y-1/2 scale-0 group-hover:scale-100 transition bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded">
            {label}
          </span>
        )}
      </div>
    );
  };

export default MenuItem;