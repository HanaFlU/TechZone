import { useState, useCallback } from 'react';

const useNotification = () => {
    const [notifications, setNotifications] = useState([]);

    const displayNotification = useCallback((message, type, duration = 3000) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            message,
            type,
            timestamp: Date.now()
        };

        setNotifications(prev => [...prev, newNotification]);

        const timer = setTimeout(() => {
            setNotifications(prev => prev.filter(notification => notification.id !== id));
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const closeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const closeAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return { 
        notifications, 
        displayNotification, 
        closeNotification, 
        closeAllNotifications 
    };
};

export default useNotification;