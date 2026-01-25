import React from 'react';
import { Progress } from '@/components/ui/progress';
import { GAME_CONFIG } from '@/utils/gameConstants';

const HUD = ({ score, levelName, progress, isPlacing, highlightedHouse, showSwitchHint, isMobile }) => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top Left - Score */}
      <div className={`absolute ${isMobile ? 'top-3 left-3' : 'top-6 left-6'} pointer-events-auto`}>
        <div className={`bg-black/80 backdrop-blur-sm border-2 border-[#00FF88] rounded-lg ${isMobile ? 'px-3 py-2' : 'px-6 py-3'}`}>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 font-medium`}>Häuser</div>
          <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-[#00FF88] font-mono`}>{score}</div>
        </div>
      </div>

      {/* Top Right is now used by Minimap - removed Level display from here */}

      {/* Center - Crosshair & Interaction */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Crosshair */}
        <div className="relative w-8 h-8">
          <div className="absolute top-1/2 left-0 w-2 h-0.5 bg-white/60 transform -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-2 h-0.5 bg-white/60 transform -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-white/60 transform -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-white/60 transform -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        {/* Interaction hint */}
        {highlightedHouse && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <div className="bg-black/90 backdrop-blur-sm border border-[#00FF88] rounded-lg px-4 py-2">
              <span className="text-[#00FF88] font-bold">[E / Leertaste]</span>
              <span className="text-white ml-2">Internet-Kasten anbringen</span>
            </div>
          </div>
        )}

        {isPlacing && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/90 backdrop-blur-sm border border-yellow-500 rounded-lg px-4 py-2">
              <span className="text-yellow-500 animate-pulse">Wird installiert...</span>
            </div>
          </div>
        )}

        {showSwitchHint && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/90 backdrop-blur-sm border-2 border-[#FFD700] rounded-lg px-6 py-3 animate-pulse">
              <div className="text-[#FFD700] font-bold text-xl text-center">🎉 Alle Häuser angeschlossen!</div>
              <div className="text-white text-center mt-2">Gehe zum zentralen Schalter und aktiviere das Netzwerk!</div>
              <div className="text-[#FFD700] text-center mt-1">⚡ Folge dem leuchtenden Pfad ⚡</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom - Progress Bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-6">
        <div className="bg-black/80 backdrop-blur-sm border-2 border-[#00FF88] rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Fortschritt: {levelName}</span>
            <span className="text-[#00FF88] font-mono font-bold">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="text-xs text-gray-400 mt-2 text-center">
            Ziel: {GAME_CONFIG.LEVELS.find(l => l.name === levelName)?.target} Häuser
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
