import React, { useState, useRef, useEffect } from 'react';

interface SplitLayoutProps {
  leftTop: React.ReactNode;
  leftBottom: React.ReactNode;
  right: React.ReactNode;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ leftTop, leftBottom, right }) => {
  const [isFixed, setIsFixed] = useState(false);
  const [initialOffset, setInitialOffset] = useState(0);
  const [bottomHeight, setBottomHeight] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      const rect = bottomRef.current.getBoundingClientRect();
      const offset = window.scrollY + rect.top;
      setInitialOffset(offset);
      setBottomHeight(bottomRef.current.offsetHeight);
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY >= initialOffset) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialOffset]);

  return (
    <div className="block lg:flex lg:h-screen lg:overflow-hidden">
      {/* Mobile: block layout */}
      {/* Desktop (min-w-[1024px]): flex layout */}
      {/* Left panel: On desktop, fixed width 50%, no scroll. */}
      <div className="w-full lg:w-1/2 lg:flex-shrink-0 lg:overflow-hidden flex flex-col">
        {/* Top portion */}
        <div className="p-4 border-b border-gray-300">
          {leftTop}
        </div>

        {/* Placeholder below bottom. On mobile, used for sticky simulation. */}
        <div style={{ height: isFixed ? bottomHeight : 0 }} />

        {/* Bottom portion pinned or static on mobile. On desktop, no special pin needed. */}
        <div
          ref={bottomRef}
          className={`p-4 border-b border-gray-300
            ${isFixed ? 'fixed top-0 left-0 right-0 bg-white z-50' : 'static'}
            lg:static lg:border-none
          `}
        >
          {leftBottom}
        </div>
      </div>

      {/* Right panel: on desktop, scrollable. On mobile, normal flow. */}
      <div className="w-full lg:flex-1 lg:overflow-y-auto p-4 lg:p-8 border-l border-gray-300">
        {right}
      </div>
    </div>
  );
};

export default SplitLayout;