import React from 'react';
import Spinner from './Spinner';

const ContentLoader = ({ 
  size = 10, 
  borderWidth = 3, 
  color = '#3C50E0',
  height = 'h-40',
  text = 'Loading content...',
  showText = true
}) => {
  return (
    <div className={`flex ${height} w-full items-center justify-center rounded-md`}>
      <div className="flex flex-col items-center gap-2">
        <Spinner 
          size={size} 
          borderWidth={borderWidth} 
          color={color}
        />
        {showText && <span className="text-sm text-gray-600">{text}</span>}
      </div>
    </div>
  );
};

export default ContentLoader;