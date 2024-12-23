import React, { useState, useRef, useEffect } from 'react';
import './TooltipIcon.css';

interface TooltipIconProps {
  text: string;
}

const TooltipIcon: React.FC<TooltipIconProps> = ({ text }) => {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTooltip = () => {
    setActive(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setActive(false);
    }, 2500);
  };

  return (
    <div className="tooltip-container">
      <span 
        className="tooltip-icon"
        onClick={showTooltip}
        onMouseEnter={showTooltip}
        role="button"
        tabIndex={0}
      >
        ?
      </span>
      <div className={`tooltip-text ${active ? 'active' : ''}`}>
        {text}
      </div>
    </div>
  );
};

export default TooltipIcon;