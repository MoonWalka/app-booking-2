import React from 'react';
import Spinner from '../common/Spinner';

/**
 * LoadingSpinner - Redirects to the common Spinner component
 * 
 * @deprecated Use the more feature-rich Spinner component from '../common/Spinner' instead
 * This component is maintained for backward compatibility only
 */
const LoadingSpinner = ({ message = 'Chargement en cours...' }) => {
  return (
    <Spinner 
      message={message}
      contentOnly={true}
    />
  );
};

export default LoadingSpinner;