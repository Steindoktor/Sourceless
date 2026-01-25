import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene from '../game/Scene';
import HUD from '../hud/HUD';
import PauseMenu from './PauseMenu';
import GameOver from './GameOver';
import { usePlayerMovement } from '@/hooks/usePlayerMovement';
import { useGameState } from '@/hooks/useGameState';
import { GAME_CONFIG, KEYBOARD_KEYS } from '@/utils/gameConstants';
import * as THREE from 'three';

const GameScreen = ({ onQuit }) => {
  const {
    gameState,
    score,
    currentLevel,
    progress,
    levelName,
    isPlacing,
    setIsPlacing,
    gameOverReason,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    incrementScore,
  } = useGameState();

  const playerMovement = usePlayerMovement(gameState);
  const [highlightedHouse, setHighlightedHouse] = useState(null);
  const requestAnimationFrameId = useRef(null);
  const lastTime = useRef(performance.now());

  // Start game on mount
  useEffect(() => {
    startGame();
  }, [startGame]);

  // Handle pause key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === KEYBOARD_KEYS.PAUSE) {
        if (gameState === 'playing') {
          pauseGame();
          playerMovement.exitPointerLock();
        } else if (gameState === 'paused') {
          resumeGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, pauseGame, resumeGame, playerMovement]);

  // Game loop
  useEffect(() => {
    const gameLoop = (currentTime) => {
      const delta = (currentTime - lastTime.current) / 1000;
      lastTime.current = currentTime;

      if (gameState === 'playing') {
        playerMovement.update(delta);
      }

      requestAnimationFrameId.current = requestAnimationFrame(gameLoop);
    };

    requestAnimationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestAnimationFrameId.current) {
        cancelAnimationFrame(requestAnimationFrameId.current);
      }
    };
  }, [gameState, playerMovement]);

  // Check for nearby houses to highlight
  useEffect(() => {
    // This would ideally use Three.js raycasting
    // For now, simplified distance check will be in Scene
  }, [playerMovement.position]);

  const handleInteract = () => {
    setIsPlacing(true);
    setTimeout(() => {
      setIsPlacing(false);
      incrementScore();
    }, GAME_CONFIG.PLACEMENT_DURATION);
  };

  const handleGameOver = () => {
    playerMovement.exitPointerLock();
    endGame('Du wurdest von einem Regierungsbeamten verhaftet!');
  };

  const handleRestart = () => {
    playerMovement.exitPointerLock();
    playerMovement.setPosition(new THREE.Vector3(0, 0, 0));
    playerMovement.setRotation(0);
    startGame();
  };

  // Request pointer lock on canvas click
  const handleCanvasClick = () => {
    if (gameState === 'playing') {
      playerMovement.requestPointerLock();
    }
  };

  return (
    <div className="w-full h-screen bg-[#0A0F14]" onClick={handleCanvasClick}>
      <Canvas
        camera={{ 
          position: [0, GAME_CONFIG.CAMERA.HEIGHT, GAME_CONFIG.CAMERA.DISTANCE],
          fov: GAME_CONFIG.CAMERA.FOV,
        }}
        shadows
      >
        <Scene
          playerPosition={playerMovement.position}
          playerRotation={playerMovement.rotation}
          gameState={gameState}
          currentLevel={currentLevel}
          onHighlightChange={setHighlightedHouse}
          onInteract={handleInteract}
          onGameOver={handleGameOver}
        />
      </Canvas>

      {gameState === 'playing' && (
        <HUD
          score={score}
          levelName={levelName}
          progress={progress}
          isPlacing={isPlacing}
          highlightedHouse={highlightedHouse}
        />
      )}

      {gameState === 'paused' && (
        <PauseMenu
          onResume={resumeGame}
          onQuit={onQuit}
        />
      )}

      {gameState === 'gameOver' && (
        <GameOver
          score={score}
          levelName={levelName}
          reason={gameOverReason}
          onRestart={handleRestart}
          onQuit={onQuit}
        />
      )}

      {/* Click to start hint */}
      {gameState === 'playing' && !document.pointerLockElement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-sm border-2 border-[#00FF88] rounded-lg px-8 py-4 pointer-events-auto">
            <p className="text-white text-xl font-bold">Klicke um zu spielen</p>
            <p className="text-gray-400 text-sm mt-2">Verwende Maus zum Umsehen</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
