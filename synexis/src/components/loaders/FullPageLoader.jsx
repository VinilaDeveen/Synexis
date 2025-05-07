import React from 'react';
import Spinner from './Spinner';

const FullPageLoader = ({ 
  size = 16, 
  borderWidth = 4, 
  color = '#3C50E0',
  bgColor = 'white'
}) => {
  return (
    <div className={`flex h-screen items-center justify-center bg-${bgColor}`}>
      <Spinner 
        size={size} 
        borderWidth={borderWidth} 
        color={color} 
      />
    </div>
  );
};

export default FullPageLoader;