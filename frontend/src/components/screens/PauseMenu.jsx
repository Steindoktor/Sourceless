import React from 'react';
import { Button } from '@/components/ui/button';

const PauseMenu = ({ onResume, onQuit }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-[#1A1F24] border-2 border-[#00FF88] rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-4xl font-bold text-[#00FF88] text-center mb-8">Pause</h2>
        
        <div className="space-y-4">
          <Button
            data-testid="resume-game-btn"
            onClick={onResume}
            className="w-full bg-[#00FF88] hover:bg-[#00DD77] text-black font-bold py-4 text-lg rounded-lg transition-all"
          >
            Fortsetzen
          </Button>
          
          <Button
            data-testid="quit-to-menu-btn"
            onClick={onQuit}
            variant="outline"
            className="w-full border-2 border-[#00FF88] text-[#00FF88] hover:bg-[#00FF88] hover:text-black font-bold py-4 text-lg rounded-lg transition-all"
          >
            Zum Hauptmenü
          </Button>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Drücke ESC um fortzusetzen</p>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
