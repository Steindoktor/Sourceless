import React from 'react';
import { Button } from '@/components/ui/button';

const MainMenu = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F14] via-[#1A1F24] to-[#0A0F14] flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00DD77] animate-pulse">
            Connect The World
          </h1>
          <div className="text-xl text-gray-300 max-w-2xl mx-auto space-y-2">
            <p className="font-bold text-[#00FF88]">Ein neues Internet entsteht.</p>
            <p>Dezentral. Sicher. Ohne Kontrolle von oben.</p>
            <p className="text-base mt-3">Deine Aufgabe: Infrastruktur schaffen, Gebäude vernetzen, Reichweite aufbauen.</p>
            <p className="text-yellow-500 text-sm">Störfaktor: staatliche Kontrolle.</p>
          </div>
        </div>

        {/* Glowing box effect */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-[#00FF88] rounded-lg opacity-20 blur-xl animate-pulse" />
          <div className="absolute inset-4 bg-gradient-to-br from-[#00FF88] to-[#00DD77] rounded-lg" />
          <div className="absolute inset-6 bg-[#0A0F14] rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-16 bg-gradient-to-b from-[#00FF88] to-[#00DD77] rounded-md" />
          </div>
        </div>

        {/* Start button */}
        <div className="space-y-4">
          <Button
            data-testid="start-game-btn"
            onClick={onStart}
            className="bg-gradient-to-r from-[#00FF88] to-[#00DD77] hover:from-[#00DD77] hover:to-[#00FF88] text-black font-bold text-xl px-12 py-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Spiel Starten
          </Button>
        </div>

        {/* Level info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8">
          {[
            { name: 'Straße', houses: 20 },
            { name: 'Stadt', houses: 200 },
            { name: 'Land', houses: 2000 },
            { name: 'Welt', houses: 20000 },
          ].map((level, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-sm border border-[#00FF88]/30 rounded-lg p-4">
              <div className="text-[#00FF88] font-bold text-lg">{level.name}</div>
              <div className="text-gray-400 text-sm">{level.houses} Häuser</div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-sm border border-[#00FF88]/30 rounded-lg p-6 text-left">
          <h3 className="text-[#00FF88] font-bold text-lg mb-4">Anleitung</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>• Laufe mit <span className="text-[#00FF88] font-bold">WASD</span> durch die Stadt</p>
            <p>• Drücke <span className="text-[#00FF88] font-bold">E oder Leertaste</span> in der Nähe eines Hauses, um einen Internet-Kasten anzubringen</p>
            <p>• Vermeide die Regierungsbeamten (rote Figuren)</p>
            <p>• Erreiche das Ziel jedes Levels, um aufzusteigen</p>
            <p>• <span className="text-[#00FF88] font-bold">Shift</span> für Sprint verwenden</p>
          </div>
        </div>

        <div className="text-gray-500 text-sm pt-4">
          Ein 3D-Browserspiel powered by Three.js
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
