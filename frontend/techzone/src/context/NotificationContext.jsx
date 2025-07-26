import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import CustomerService from '../services/CustomerService';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await CustomerService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(notif => !notif.isRead).length);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError(err.response?.data?.message || "Failed to fetch notifications.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await CustomerService.markNotificationAsRead(notificationId);
            setNotifications(prevNotifications =>
                prevNotifications.map(notif =>
                    notif._id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        } catch (err) {
            console.error("Error marking notification as read:", err);
            setError(err.response?.data?.message || "Failed to mark notification as read.");
        }
    };

    const markAllAsRead = async () => {
        try {
            await CustomerService.markAllNotificationsAsRead();
            setNotifications(prevNotifications =>
                prevNotifications.map(notif => ({ ...notif, isRead: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
            setError(err.response?.data?.message || "Failed to mark all notifications as read.");
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};