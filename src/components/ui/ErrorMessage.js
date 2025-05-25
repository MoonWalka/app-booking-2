import React from 'react';
import Alert from './Alert';

/**
 * ErrorMessage - Display error messages to the user
 * Migré vers le composant Alert standardisé TourCraft
 */
const ErrorMessage = ({ 
  message = 'Une erreur est survenue.', 
  variant = 'danger',
  children,
  className = '',
  ...props 
}) => {
  return (
    <Alert 
      variant={variant} 
      className={className}
      {...props}
    >
      {children || message}
    </Alert>
  );
};

export default ErrorMessage;