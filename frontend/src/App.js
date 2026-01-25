import React, { useState } from 'react';
import '@/App.css';
import MainMenu from '@/components/screens/MainMenu';
import GameScreen from '@/components/screens/GameScreen';

function App() {
  const [screen, setScreen] = useState('menu'); // menu, game

  const handleStartGame = () => {
    setScreen('game');
  };

  const handleQuitToMenu = () => {
    setScreen('menu');
  };

  return (
    <div className="App">
      {screen === 'menu' && (
        <MainMenu onStart={handleStartGame} />
      )}
      {screen === 'game' && (
        <GameScreen onQuit={handleQuitToMenu} />
      )}
    </div>
  );
}

export default App;
