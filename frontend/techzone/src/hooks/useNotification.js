import { useState, useCallback } from 'react';

const useNotification = () => {
    const [notificationMessage, setNotificationMessage] = useState(null);
    const [notificationType, setNotificationType] = useState(null);
    const [showNotification, setShowNotification] = useState(false);

    const displayNotification = useCallback((message, type, duration = 3000) => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);

        const timer = setTimeout(() => {
            setShowNotification(false);
            setNotificationMessage(null);
            setNotificationType(null);
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const closeNotification = useCallback(() => {
        setShowNotification(false);
        setNotificationMessage(null);
        setNotificationType(null);
    }, []);

    return { notificationMessage, notificationType, showNotification, displayNotification, closeNotification };
};

export default useNotification;