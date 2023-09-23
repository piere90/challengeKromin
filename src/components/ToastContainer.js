import React, { useState, useEffect } from 'react';
import Toast from './Toast'; 

const ToastContainer = () => {
  const [toastQueue, setToastQueue] = useState([]);

  const handleToastClick = () => {
    if (toastQueue.length > 0) {
      setToastQueue((prevQueue) => prevQueue.slice(1));
    }
  };

  useEffect(() => {
    if (toastQueue.length > 0) {
      handleToastClick();
    }
  }, [toastQueue]);

  return (
    <div className="toast-container">
      {toastQueue.map((toast, index) => (
        <Toast
          key={index}
          message={toast.message}
          type={toast.type}
          onClose={handleToastClick}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
