 // Define notification interface
export interface Notification {
    id: string; // Assuming ID can be a string from backend
    notification_type: 'follow' | 'like' | 'comment'; // Match backend field name
    message: string;
    timestamp: string; // Match backend field name
    is_read: boolean; // Match backend field name
  }