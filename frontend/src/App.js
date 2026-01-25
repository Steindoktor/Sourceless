import React, { useState } from 'react';
import '@/App.css';
import MainMenu from '@/components/screens/MainMenu';
import GameScreen from '@/components/screens/GameScreen';
import ErrorBoundary from '@/components/ErrorBoundary';
import DevToolsSuppressor from '@/components/DevToolsSuppressor';

function App() {
  const [screen, setScreen] = useState('menu'); // menu, game

  const handleStartGame = () => {
    setScreen('game');
  };

  const handleQuitToMenu = () => {
    setScreen('menu');
  };

  return (
    <DevToolsSuppressor>
      <ErrorBoundary>
        <div className="App">
          {screen === 'menu' && (
            <MainMenu onStart={handleStartGame} />
          )}
          {screen === 'game' && (
            <GameScreen onQuit={handleQuitToMenu} />
          )}
        </div>
      </ErrorBoundary>
    </DevToolsSuppressor>
  );
}

export default App;
