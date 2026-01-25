import React, { useEffect, useRef } from 'react';
import { GAME_CONFIG } from '@/utils/gameConstants';

const Minimap = ({ playerPosition, houses, npcs, onlineHouses, levelName, isMobile }) => {
  const canvasRef = useRef(null);
  
  const canvasSize = isMobile ? 100 : 150;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = 'rgba(10, 15, 20, 0.9)';
    ctx.fillRect(0, 0, width, height);
    
    // Border
    ctx.strokeStyle = '#00FF88';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
    
    // Scale: map game world to minimap
    const scale = 2;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const toMinimapX = (x) => centerX + x * scale;
    const toMinimapY = (z) => centerY + z * scale;
    
    // Draw houses
    houses.forEach(house => {
      const x = toMinimapX(house.position.x);
      const y = toMinimapY(house.position.z);
      
      const isOnline = onlineHouses.has(house.id);
      ctx.fillStyle = isOnline ? '#00FF88' : '#444444';
      ctx.fillRect(x - 2, y - 2, 4, 4);
    });
    
    // Draw NPCs
    npcs.forEach(npc => {
      const x = toMinimapX(npc.position.x);
      const y = toMinimapY(npc.position.z);
      
      ctx.fillStyle = '#FF3333';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw player (on top)
    if (playerPosition) {
      const x = toMinimapX(playerPosition.x);
      const y = toMinimapY(playerPosition.z);
      
      // Player dot
      ctx.fillStyle = '#00FF88';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Player direction indicator
      ctx.strokeStyle = '#00FF88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 8);
      ctx.stroke();
    }
    
  }, [playerPosition, houses, npcs, onlineHouses]);
  
  return (
    <div className={`absolute ${isMobile ? 'top-3 right-3' : 'top-6 right-6'} pointer-events-none z-10`}>
      {/* Level display above minimap */}
      <div className={`bg-black/80 backdrop-blur-sm border-2 border-[#00FF88] rounded-lg ${isMobile ? 'px-2 py-1 mb-1' : 'px-4 py-2 mb-2'}`}>
        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-400 font-medium text-center`}>Level</div>
        <div className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold text-[#00FF88] text-center`}>{levelName}</div>
      </div>
      
      <div className={`bg-black/80 backdrop-blur-sm border-2 border-[#00FF88] rounded-lg ${isMobile ? 'p-1' : 'p-2'}`}>
        <canvas 
          ref={canvasRef} 
          width={canvasSize} 
          height={canvasSize}
          className="block"
        />
        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-[#00FF88] text-center mt-1 font-mono`}>
          Minimap
        </div>
      </div>
      
      {/* Legend */}
      {!isMobile && (
        <div className="mt-2 bg-black/80 backdrop-blur-sm border border-[#00FF88] rounded-lg p-2 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[#00FF88]"></div>
            <span className="text-white">Du</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-[#00FF88]"></div>
            <span className="text-white">Online</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-[#444444]"></div>
            <span className="text-white">Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF3333]"></div>
            <span className="text-white">Beamte</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Minimap;
