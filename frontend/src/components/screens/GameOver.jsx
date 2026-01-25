import React from 'react';
import { Button } from '@/components/ui/button';
import { GAME_CONFIG } from '@/utils/gameConstants';

const GameOver = ({ score, levelName, reason, onRestart, onQuit }) => {
  const isWin = reason.includes('connected the world');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#1A1F24] to-[#0A0F14] border-2 border-[#00FF88] rounded-lg p-8 max-w-lg w-full mx-4">
        {/* Title */}
        <div className="text-center mb-8">
          {isWin ? (
            <>
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00DD77] mb-4 animate-pulse">
                Gratulation!
              </h2>
              <p className="text-xl text-[#00FF88]">{reason}</p>
            </>
          ) : (
            <>
              <h2 className="text-5xl font-bold text-red-500 mb-4">Verhaftet!</h2>
              <p className="text-xl text-gray-300">{reason}</p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="bg-black/50 rounded-lg p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <span className="text-gray-400">Angeschlossene Häuser:</span>
            <span className="text-3xl font-bold text-[#00FF88] font-mono">{score}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <span className="text-gray-400">Erreichtes Level:</span>
            <span className="text-xl font-bold text-[#00FF88]">{levelName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Fortschritt:</span>
            <span className="text-xl font-bold text-[#00FF88]">
              {((score / GAME_CONFIG.LEVELS.find(l => l.name === levelName)?.target) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Button
            data-testid="restart-game-btn"
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-[#00FF88] to-[#00DD77] hover:from-[#00DD77] hover:to-[#00FF88] text-black font-bold py-4 text-lg rounded-lg transition-all transform hover:scale-105"
          >
            Nochmal Spielen
          </Button>
          
          <Button
            data-testid="game-over-quit-btn"
            onClick={onQuit}
            variant="outline"
            className="w-full border-2 border-[#00FF88] text-[#00FF88] hover:bg-[#00FF88] hover:text-black font-bold py-4 text-lg rounded-lg transition-all"
          >
            Zum Hauptmenü
          </Button>
        </div>

        {isWin && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">Du hast die Welt vernetzt! 🌍</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameOver;
