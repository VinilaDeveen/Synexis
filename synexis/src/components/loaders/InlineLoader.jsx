import React from 'react';
import Spinner from './Spinner';

const InlineLoader = ({ 
  size = 6, 
  borderWidth = 2, 
  color = '#3C50E0',
  text = 'Loading...',
  showText = true
}) => {
  return (
    <div className="flex items-center gap-2">
      <Spinner 
        size={size} 
        borderWidth={borderWidth} 
        color={color}
      />
      {showText && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export default InlineLoader;