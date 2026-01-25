import React, { useEffect, useRef, useState } from 'react';

const VirtualJoystick = ({ onMove, enabled }) => {
  const joystickRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const touchId = useRef(null);
  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || !joystickRef.current) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchId.current = touch.identifier;
      
      const rect = joystickRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      
      setIsActive(true);
      updatePosition(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!isActive) return;
      
      const touch = Array.from(e.touches).find(t => t.identifier === touchId.current);
      if (!touch) return;
      
      updatePosition(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      if (!isActive) return;
      
      setIsActive(false);
      setPosition({ x: 0, y: 0 });
      touchId.current = null;
      
      if (onMove) {
        onMove({ x: 0, y: 0, magnitude: 0 });
      }
    };

    const updatePosition = (clientX, clientY) => {
      const dx = clientX - centerRef.current.x;
      const dy = clientY - centerRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 50;
      
      let x = dx;
      let y = dy;
      
      if (distance > maxDistance) {
        x = (dx / distance) * maxDistance;
        y = (dy / distance) * maxDistance;
      }
      
      setPosition({ x, y });
      
      if (onMove) {
        const magnitude = Math.min(distance / maxDistance, 1);
        const normalizedX = x / maxDistance;
        const normalizedY = y / maxDistance;
        
        onMove({ x: normalizedX, y: normalizedY, magnitude });
      }
    };

    const element = joystickRef.current;
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isActive, onMove]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-24 left-6 z-50">
      <div
        ref={joystickRef}
        className="relative w-32 h-32 bg-black/50 backdrop-blur-sm border-2 border-[#00FF88] rounded-full flex items-center justify-center"
        style={{ touchAction: 'none' }}
      >
        {/* Outer circle */}
        <div className="absolute inset-4 border border-[#00FF88]/30 rounded-full" />
        
        {/* Center dot */}
        <div className="w-3 h-3 bg-[#00FF88]/50 rounded-full" />
        
        {/* Joystick knob */}
        <div
          className="absolute w-16 h-16 bg-[#00FF88]/70 border-2 border-[#00FF88] rounded-full transition-all shadow-lg shadow-[#00FF88]/50"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            opacity: isActive ? 1 : 0.6,
          }}
        >
          <div className="absolute inset-2 bg-[#00FF88] rounded-full opacity-50" />
        </div>
      </div>
      
      {/* Label */}
      <div className="text-center mt-2 text-xs text-[#00FF88] font-bold">
        Bewegung
      </div>
    </div>
  );
};

export default VirtualJoystick;
