import React from 'react';

/**
 * LoadingSpinner - A simple loading spinner component
 */
const LoadingSpinner = ({ message = 'Chargement en cours...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
      <p className="text-center text-muted">{message}</p>
    </div>
  );
};

export default LoadingSpinner;