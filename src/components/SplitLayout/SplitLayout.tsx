import React from 'react';
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
   * On mobile, this part is sticky (stays visible) as the user scrolls down.
   * On desktop, also in the fixed (non-scrollable) left panel (bottom area). 
   */
  leftBottom: React.ReactNode;

  /**
   * The right panel’s content.
   * On mobile, this simply appears below the left portion (with one scroll).
   * On desktop, it appears in its own scrollable column on the right.
   */
  right: React.ReactNode;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ leftTop, leftBottom, right }) => {
  return (
    <div className="split-layout">
      {/* Left panel */}
      <div className="left-panel">
        <div className="left-panel-top">
          {leftTop}
        </div>
        <div className="left-panel-bottom">
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