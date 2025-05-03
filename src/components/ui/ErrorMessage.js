import React from 'react';

/**
 * ErrorMessage - Display error messages to the user
 */
const ErrorMessage = ({ message = 'Une erreur est survenue.', variant = 'danger' }) => {
  return (
    <div className={`alert alert-${variant} m-3`} role="alert">
      <div className="d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <div>{message}</div>
      </div>
    </div>
  );
};

export default ErrorMessage;