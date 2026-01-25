import React, { useEffect } from 'react';

// This component suppresses React DevTools x-line-number errors
const DevToolsSuppressor = ({ children }) => {
  useEffect(() => {
    // Suppress specific React DevTools errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args[0]?.toString() || '';
      
      // Filter out React DevTools x-line-number errors
      if (
        errorMessage.includes('x-line-number') ||
        errorMessage.includes('line-number') ||
        errorMessage.includes('R3F: Cannot set')
      ) {
        return; // Suppress this error
      }
      
      // Log all other errors normally
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
};

export default DevToolsSuppressor;
