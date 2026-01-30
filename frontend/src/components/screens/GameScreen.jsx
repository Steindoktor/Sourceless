import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene from '../game/Scene';
import HUD from '../hud/HUD';
import Minimap from '../hud/Minimap';
import PauseMenu from './PauseMenu';
import GameOver from './GameOver';
import VirtualJoystick from '../mobile/VirtualJoystick';
import MobileControls from '../mobile/MobileControls';
import { usePlayerMovement } from '@/hooks/usePlayerMovement';
import { useGameState } from '@/hooks/useGameState';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { GAME_CONFIG, KEYBOARD_KEYS } from '@/utils/gameConstants';
import soundManager from '@/utils/soundManager';

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
    completeLevel,
  } = useGameState();

  const playerMovement = usePlayerMovement(gameState);
  const [highlightedHouse, setHighlightedHouse] = useState(null);
  const [sceneData, setSceneData] = useState({ houses: [], npcs: [], onlineHouses: new Set() });
  const [mobileSprintActive, setMobileSprintActive] = useState(false);
  const [mobileVelocity, setMobileVelocity] = useState({ x: 0, y: 0, magnitude: 0 });
  const requestAnimationFrameId = useRef(null);
  const lastTime = useRef(performance.now());
  const isMobile = useMobileDetection();

  // Initialize sound manager
  useEffect(() => {
    soundManager.init();
    // Musik ist jetzt deaktiviert - nur Sound-Effekte
    // soundManager.startBackgroundMusic(); // Auskommentiert
    
    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, []);

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
        // Speichere alte Position für Kollisionserkennung
        const oldPosition = playerMovement.position.clone();
        
        // Desktop movement
        if (!isMobile) {
          playerMovement.update(delta);
        } else {
          // Mobile movement - kontinuierlich von mobileVelocity
          if (mobileVelocity.magnitude > 0) {
            const moveSpeed = GAME_CONFIG.PLAYER.SPEED * delta * (mobileSprintActive ? GAME_CONFIG.PLAYER.SPRINT_MULTIPLIER : 1);
            
            const velocity = new THREE.Vector3(
              mobileVelocity.x * moveSpeed * mobileVelocity.magnitude,
              0,
              mobileVelocity.y * moveSpeed * mobileVelocity.magnitude
            );
            
            const rotatedVelocity = velocity.clone();
            rotatedVelocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerMovement.rotation);
            
            playerMovement.setPosition(prev => prev.clone().add(rotatedVelocity));
          }
        }

        // Kollisionserkennung mit Häusern
        const newPosition = playerMovement.position;
        let hasCollision = false;

        sceneData.houses?.forEach(house => {
          const distance = newPosition.distanceTo(house.position);
          const minDistance = GAME_CONFIG.HOUSE.COLLISION_RADIUS + GAME_CONFIG.PLAYER.RADIUS;
          
          if (distance < minDistance) {
            hasCollision = true;
            
            // Schiebe Spieler zurück
            const direction = new THREE.Vector3()
              .subVectors(newPosition, house.position)
              .normalize();
            
            const correctedPosition = house.position.clone()
              .add(direction.multiplyScalar(minDistance));
            
            playerMovement.setPosition(correctedPosition);
          }
        });
      }

      requestAnimationFrameId.current = requestAnimationFrame(gameLoop);
    };

    requestAnimationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestAnimationFrameId.current) {
        cancelAnimationFrame(requestAnimationFrameId.current);
      }
    };
  }, [gameState, playerMovement, isMobile, mobileVelocity, mobileSprintActive, sceneData.houses]);

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

  const handleLevelComplete = () => {
    // Level completed! Move to next level
    completeLevel();
  };

  // Mobile joystick handler
  const handleJoystickMove = (joystickData) => {
    if (gameState !== 'playing') return;
    
    // Store velocity state for continuous update in game loop
    setMobileVelocity({
      x: joystickData.x,
      y: joystickData.y,
      magnitude: joystickData.magnitude
    });
  };

  // Mobile interact handler - FIXED: Trigger keyboard event
  const handleMobileInteract = () => {
    if (gameState !== 'playing') return;
    
    // Simulate E key press
    const keyDownEvent = new KeyboardEvent('keydown', {
      code: 'KeyE',
      key: 'e',
      bubbles: true
    });
    window.dispatchEvent(keyDownEvent);
    
    // Simulate E key release after short delay
    setTimeout(() => {
      const keyUpEvent = new KeyboardEvent('keyup', {
        code: 'KeyE',
        key: 'e',
        bubbles: true
      });
      window.dispatchEvent(keyUpEvent);
    }, 100);
  };

  // Mobile sprint toggle
  const handleMobileSprint = () => {
    setMobileSprintActive(prev => !prev);
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
          onSceneDataUpdate={setSceneData}
          onLevelComplete={handleLevelComplete}
        />
      </Canvas>

      {gameState === 'playing' && (
        <>
          <HUD
            score={score}
            levelName={levelName}
            progress={progress}
            isPlacing={isPlacing}
            highlightedHouse={highlightedHouse}
            showSwitchHint={sceneData.showSwitch}
            isMobile={isMobile}
          />
          <Minimap
            playerPosition={playerMovement.position}
            houses={sceneData.houses}
            npcs={sceneData.npcs}
            onlineHouses={sceneData.onlineHouses}
            levelName={levelName}
            isMobile={isMobile}
          />
        </>
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
      {gameState === 'playing' && !document.pointerLockElement && !isMobile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-sm border-2 border-[#00FF88] rounded-lg px-8 py-4 pointer-events-auto">
            <p className="text-white text-xl font-bold">Klicke um zu spielen</p>
            <p className="text-gray-400 text-sm mt-2">Verwende Maus zum Umsehen</p>
          </div>
        </div>
      )}

      {/* Mobile Controls */}
      {isMobile && gameState === 'playing' && (
        <>
          <VirtualJoystick 
            onMove={handleJoystickMove}
            enabled={true}
          />
          <MobileControls
            onSprint={handleMobileSprint}
            enabled={true}
          />
        </>
      )}
    </div>
  );
};

export default GameScreen;
