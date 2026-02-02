// frontend/src/components/UI/LoadingIndicator.jsx

import React from 'react';
import './LoadingIndicator.css';

const LoadingIndicator = ({ 
  size = 'medium', 
  text = 'Düşünüyor...', 
  fullscreen = false 
}) => {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium',
    large: 'loading-large'
  };

  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-container">
          <div className={`loading-spinner ${sizeClasses[size]}`}>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
      </div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

export default LoadingIndicator;