import React, { useState, useRef, useEffect } from 'react';

interface TooltipIconProps {
  text: string;
}

const TooltipIcon: React.FC<TooltipIconProps> = ({ text }) => {
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
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
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onClick={showTooltip}
      role="button"
      tabIndex={0}
    >
      <span
        className="
          inline-flex items-center justify-center 
          w-5 h-5 rounded-full 
          bg-gray-600 text-white text-xs 
          ml-2 cursor-pointer
        "
      >
        ?
      </span>

      {/* Tooltip box */}
      <div
        className={`
          absolute w-48 bg-black text-white text-sm
          px-2 py-1 rounded-md
          transition-opacity duration-300
          left-1/2 -translate-x-1/2 mt-1 z-50
          ${active ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
      >
        {text}
      </div>
    </div>
  );
};

export default TooltipIcon;