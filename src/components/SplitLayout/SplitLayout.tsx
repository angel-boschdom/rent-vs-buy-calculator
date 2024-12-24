import React, { useState, useRef, useEffect } from 'react';
import './SplitLayout.css';

interface SplitLayoutProps {
  /** 
   * The “upper” portion of the left panel.
   * On mobile, this scrolls normally in flow.
   * On desktop, this is shown in the fixed (non-scrollable) left panel (top area). 
   */
  leftTop: React.ReactNode;

  /** 
   * The “bottom” portion of the left panel. 
   * On mobile, we want this to behave like “sticky” (stay visible at top 
   * after the user scrolls). We simulate it with position: fixed.
   * On desktop, it's in the fixed (non-scrollable) left panel (bottom area). 
   */
  leftBottom: React.ReactNode;

  /**
   * The right panel’s content.
   * On mobile, simply appears below the left portion (with one page scroll).
   * On desktop, in its own scrollable column on the right.
   */
  right: React.ReactNode;
}

/**
 * This component implements a “sticky” simulation on mobile using
 * position: fixed once the user scrolls past the bottom panel's initial offset.
 * On desktop, we revert to a split layout with no special scrolling logic for the left panel.
 */
const SplitLayout: React.FC<SplitLayoutProps> = ({ leftTop, leftBottom, right }) => {
  // We'll track whether the bottom panel should be “fixed” at the top.
  const [isFixed, setIsFixed] = useState(false);

  // We also need to store the original top offset of the .left-panel-bottom
  const [initialOffset, setInitialOffset] = useState(0);

  // We'll measure the bottom panel’s height for a placeholder.
  const [bottomHeight, setBottomHeight] = useState(0);

  // Ref to the actual bottom panel element
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Measure after first render
    if (bottomRef.current) {
      // The distance from the top of the document to the element’s top
      const rect = bottomRef.current.getBoundingClientRect();
      const offset = window.scrollY + rect.top;
      setInitialOffset(offset);
      setBottomHeight(bottomRef.current.offsetHeight);
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // If we've scrolled past the bottom panel's initial top, fix it.
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
    <div className="split-layout">
      {/* Left panel */}
      <div className="left-panel">
        <div className="left-panel-top">
          {leftTop}
        </div>

        {/* 
          Placeholder takes up space when the panel is fixed so layout doesn't jump.
          Only on mobile is this relevant, but it's harmless on desktop. 
        */}
        <div 
          className="placeholder-below-bottom"
          style={{ height: isFixed ? bottomHeight : 0 }}
        />

        {/* The bottom panel itself, toggling a .fixed class if isFixed is true */}
        <div 
          ref={bottomRef}
          className={`left-panel-bottom ${isFixed ? 'fixed' : ''}`}
        >
          {leftBottom}
        </div>
      </div>

      {/* Right panel */}
      <div className="right-panel">
        {right}
      </div>
    </div>
  );
};

export default SplitLayout;