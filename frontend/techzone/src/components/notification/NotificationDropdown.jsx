import React, { useEffect, useRef } from 'react';
import { Typography, Box, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import {
    formatTime, formatDateOnly
} from '../../hooks/useOrderFormat';



const NotificationDropdown = ({ show, onMouseEnter, onMouseLeave, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  useEffect(() => {
    if (show && unreadCount > 0) {
      markAllAsRead(); 
    }
  }, [show, unreadCount, markAllAsRead]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    onClose();
    if (notification.link) {
        navigate(notification.link);
    } else {
        navigate('/account/orders'); 
    }
  };

  if (!show) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 text-gray-900"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex justify-between items-center">
          Thông báo
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </h3>
        <Divider sx={{ mb: 2 }} />
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Không có thông báo nào.
          </Typography>
        ) : (
          <Box className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <Box
                key={notification._id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  p: 2,
                  mb: 1,
                  borderRadius: 1,
                  backgroundColor: notification.isRead ? '#f8f9fa' : '#e0f7fa',
                  '&:hover': {
                    backgroundColor: notification.isRead ? '#e9ecef' : '#b2ebf2',
                    cursor: 'pointer',
                  },
                  transition: 'background-color 0.2s',
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <BellAlertIcon className="h-5 w-5 text-light-green flex-shrink-0 mr-3 mt-1" />
                <Box>
                  <Typography variant="body2" fontWeight={notification.isRead ? 'normal' : 'bold'}>
                    {notification.message} từ {notification.oldStatus} sang {notification.newStatus}. <br/>
                    <div className='flex items-center gap-2 mt-1 text-light-green'>Theo dõi đơn hàng tại đây <ArrowRightIcon className="h-4 w-4"/></div>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(notification.timestamp)} {formatDateOnly(notification.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;