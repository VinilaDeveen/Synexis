import React from 'react';
import Spinner from './Spinner';

const ButtonLoader = ({ 
  size = 4, 
  borderWidth = 2, 
  color = 'white',
  text = 'Loading...',
  showText = true
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Spinner 
        size={size} 
        borderWidth={borderWidth} 
        color={color}
      />
      {showText && <span>{text}</span>}
    </div>
  );
};

export default ButtonLoader;