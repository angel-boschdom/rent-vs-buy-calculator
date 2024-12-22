// file: /src/components/TooltipIcon.tsx
import React, { useState, useRef } from 'react';

interface TooltipIconProps {
  text: string;
}

const TooltipIcon: React.FC<TooltipIconProps> = ({ text }) => {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const toggleTooltip = () => {
    setActive(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    // Hide again after 2.5 seconds
    timeoutRef.current = window.setTimeout(() => {
      setActive(false);
    }, 2500);
  };

  return (
    <>
      <span className="tooltip-icon" onClick={toggleTooltip} onTouchStart={(e) => { e.preventDefault(); toggleTooltip(); }}>
        ?
      </span>
      <div className={`tooltip-text ${active ? 'active' : ''}`}>
        {text}
      </div>
    </>
  );
};

export default TooltipIcon;