import React from 'react';

const Spinner = ({ size = 16, borderWidth = 4, color = '#3C50E0' }) => {
  // Convert size to string with 'rem' if it's a number
  const sizeValue = typeof size === 'number' ? `${size/4}rem` : size;
  const borderWidthValue = typeof borderWidth === 'number' ? `${borderWidth}px` : borderWidth;
  
  return (
    <div 
      className="animate-spin rounded-full border-solid border-t-transparent"
      style={{ 
        height: sizeValue, 
        width: sizeValue, 
        borderWidth: borderWidthValue,
        borderColor: color,
        borderTopColor: 'transparent'
      }}
    ></div>
  );
};

export default Spinner;