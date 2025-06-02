import React, { useState, useEffect } from 'react';
import SynexisLoader from './SynexisLoader';
import LoginPage from './LoginPage';

const AppFlow = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading process
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000); // Show loader for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-screen min-h-screen">
      {isLoading ? <SynexisLoader /> : <LoginPage />}
    </div>
  );
};

export default AppFlow;