import React from 'react';

const MobileControls = ({ onSprint, enabled }) => {
  if (!enabled) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3">
      {/* Sprint Button (Shift) - Toggle */}
      <button
        data-testid="mobile-sprint-btn"
        onTouchStart={(e) => {
          e.preventDefault();
          onSprint && onSprint();
        }}
        className="w-20 h-20 bg-yellow-500/80 backdrop-blur-sm border-2 border-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50 active:scale-95 transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-black">⚡</div>
          <div className="text-[10px] text-black/80">Sprint</div>
        </div>
      </button>
    </div>
  );
};

export default MobileControls;
