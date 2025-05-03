import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

// Custom styled tooltip component
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: '#1C2333',
    color: 'white',
    fontSize: '0.875rem',
    padding: '8px 12px',
    borderRadius: '4px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
    maxWidth: '200px'
  },
}));

/**
 * Custom hook to create and manage tooltips
 * @param {string|JSX.Element} content - The tooltip content (text or JSX)
 * @param {string} placement - Tooltip placement ('top', 'right', 'bottom', 'left', etc.)
 * @param {Object} additionalProps - Any additional props to pass to the Tooltip component
 * @returns {Object} - The tooltip props to be spread on the element that should have the tooltip
 */
const useTooltip = (content, placement = 'right', additionalProps = {}) => {
  // Optional state for managing tooltip open/close if needed
  const [open, setOpen] = useState(false);

  // Create a component that renders the tooltip content
  const TooltipContent = typeof content === 'function' 
    ? content 
    : () => <div>{content}</div>;

  // Props to be spread onto the element that should have the tooltip
  const tooltipProps = {
    title: <TooltipContent />,
    placement,
    open: additionalProps.controlled ? open : undefined,
    onOpen: additionalProps.controlled ? () => setOpen(true) : undefined,
    onClose: additionalProps.controlled ? () => setOpen(false) : undefined,
    ...additionalProps
  };

  return {
    Tooltip: CustomTooltip,
    tooltipProps,
    isOpen: open,
    setOpen
  };
};

export default useTooltip;