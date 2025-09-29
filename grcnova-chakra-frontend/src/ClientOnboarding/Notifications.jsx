// components/Notification/Notification.jsx
import React, { useEffect } from 'react';

const Notification = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close" 
          onClick={onClose}
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;