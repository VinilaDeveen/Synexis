import React from 'react';
import Spinner from './Spinner';

const ImageLoader = ({ 
  size = 4, 
  borderWidth = 2, 
  color = '#3C50E0'
}) => {
  return (
    <div className={`flex h-screen items-center justify-center`}>
      <Spinner 
        size={size} 
        borderWidth={borderWidth} 
        color={color} 
      />
    </div>
  );
};

export default ImageLoader;