import React, { createContext, useState, useCallback } from 'react';


export const NotificationContext = createContext();

// Define notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Notification component that renders a single notification
const NotificationItem = ({ notification, onClose }) => {
  const { id, type, message, duration } = notification;
  
  // Auto-close after duration
  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);
  
  return (
    <div className={`notification-item notification-${type}`}>
      <div className="notification-content">
        {message}
      </div>
      <button className="notification-close" onClick={() => onClose(id)}>
        ×
      </button>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Add a new notification
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, options = {}) => {
    const id = Date.now();
    const duration = options.duration || (type === NOTIFICATION_TYPES.ERROR ? 10000 : 5000);
    
    setNotifications(prevNotifications => [
      ...prevNotifications,
      { id, message, type, duration, ...options }
    ]);
    
    return id;
  }, []);
  
  // Remove a notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);
  
  // Helper methods for specific notification types
  const success = useCallback((message, options = {}) => 
    addNotification(message, NOTIFICATION_TYPES.SUCCESS, options), 
    [addNotification]
  );
  
  const error = useCallback((message, options = {}) => 
    addNotification(message, NOTIFICATION_TYPES.ERROR, options), 
    [addNotification]
  );
  
  const warning = useCallback((message, options = {}) => 
    addNotification(message, NOTIFICATION_TYPES.WARNING, options), 
    [addNotification]
  );
  
  const info = useCallback((message, options = {}) => 
    addNotification(message, NOTIFICATION_TYPES.INFO, options), 
    [addNotification]
  );
  
  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="notification-container">
        {notifications.map(notification => (
          <NotificationItem 
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};