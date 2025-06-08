import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import DashboardLayout from '../Layout/DashboardLayout';

interface Notification {
  id: number;
  recipient: number;
  actor: {
    id: number;
    username: string;
  };
  notification_type: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  recipe: number | null; // recipe is optional
}

const API_BASE_URL = 'http://localhost:8000';

const AllNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); 
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<Notification[]>(
          `${API_BASE_URL}/notifications/`, 
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );
        setNotifications(response.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to fetch notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  const markAsRead = async (notificationId: number) => {
    if (!token) {
      setError('User not authenticated');
      return;
    }

    try {
      await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/`, // Assuming you have a PATCH endpoint for marking as read
        { is_read: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
    } catch (err) {
      console.error(`Error marking notification ${notificationId} as read:`, err);
      setError('Failed to mark notification as read.');
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <DashboardLayout title="All Notifications">
      <h2>All Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className="notification-header">
                <strong>{notification.actor.username}</strong> {notification.notification_type}
              </div>
              <div className="notification-message">{notification.message}</div>
              <div className="notification-timestamp">
                {moment(notification.timestamp).fromNow()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardLayout>
  );
};

export default AllNotificationsPage;