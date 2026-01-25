import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import Player from './Player';
import House from './House';
import NPC from './NPC';
import { GAME_CONFIG, KEYBOARD_KEYS } from '@/utils/gameConstants';

const CameraController = ({ playerPosition, playerRotation }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (!playerPosition) return;

    const offset = new THREE.Vector3(
      Math.sin(playerRotation) * GAME_CONFIG.CAMERA.DISTANCE,
      GAME_CONFIG.CAMERA.HEIGHT,
      Math.cos(playerRotation) * GAME_CONFIG.CAMERA.DISTANCE
    );

    const targetPosition = playerPosition.clone().add(offset);
    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(playerPosition.x, playerPosition.y + 1, playerPosition.z);
  });

  return null;
};

const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200, 50, 50]} />
      <meshStandardMaterial 
        color={GAME_CONFIG.COLORS.SECONDARY_DARK}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

const Street = () => {
  return (
    <>
      {/* Main street */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 100]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.9}
        />
      </mesh>
      
      {/* Street markings */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh 
          key={i}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0.02, -40 + i * 4]}
        >
          <planeGeometry args={[0.3, 1.5]} />
          <meshBasicMaterial color="#FFFF00" />
        </mesh>
      ))}
    </>
  );
};

const Scene = ({ 
  playerPosition, 
  playerRotation, 
  gameState,
  onInteract,
  currentLevel,
  highlightedHouse,
  onGameOver,
  setHighlightedHouse,
}) => {
  const [houses, setHouses] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [onlineHouses, setOnlineHouses] = useState(new Set());
  const interactKeyPressed = useRef(false);

  // Generate houses based on level
  useEffect(() => {
    const levelConfig = GAME_CONFIG.LEVELS[currentLevel];
    const housesPerSide = Math.ceil(Math.sqrt(levelConfig.target));
    const newHouses = [];

    for (let i = 0; i < housesPerSide; i++) {
      // Left side
      newHouses.push({
        id: `house-left-${i}`,
        position: new THREE.Vector3(
          -10,
          0,
          -40 + i * GAME_CONFIG.HOUSE.SPACING
        ),
        type: Math.floor(Math.random() * 3),
      });

      // Right side
      newHouses.push({
        id: `house-right-${i}`,
        position: new THREE.Vector3(
          10,
          0,
          -40 + i * GAME_CONFIG.HOUSE.SPACING
        ),
        type: Math.floor(Math.random() * 3),
      });
    }

    setHouses(newHouses);

    // Generate NPCs
    const newNpcs = [];
    for (let i = 0; i < levelConfig.npcCount; i++) {
      newNpcs.push({
        id: `npc-${i}`,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          0,
          (Math.random() - 0.5) * 80
        ),
        speedMultiplier: levelConfig.npcSpeed,
      });
    }

    setNpcs(newNpcs);
  }, [currentLevel]);

  // Handle interaction
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === KEYBOARD_KEYS.INTERACT && !interactKeyPressed.current && gameState === 'playing') {
        interactKeyPressed.current = true;
        
        if (highlightedHouse && !onlineHouses.has(highlightedHouse.id)) {
          setOnlineHouses(prev => new Set([...prev, highlightedHouse.id]));
          onInteract();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === KEYBOARD_KEYS.INTERACT) {
        interactKeyPressed.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [highlightedHouse, onInteract, gameState, onlineHouses]);

  // Check for nearby houses (highlight detection)
  useFrame(() => {
    if (!playerPosition || gameState !== 'playing') return;

    let closestHouse = null;
    let minDistance = GAME_CONFIG.PLAYER.INTERACTION_RANGE;

    houses.forEach(house => {
      if (onlineHouses.has(house.id)) return;
      
      const distance = playerPosition.distanceTo(house.position);
      if (distance < minDistance) {
        closestHouse = house;
        minDistance = distance;
      }
    });

    if (closestHouse !== highlightedHouse) {
      if (setHighlightedHouse) {
        setHighlightedHouse(closestHouse);
      }
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={0.8}
        castShadow
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      {/* Environment - Simple background color */}
      <color attach="background" args={['#0A0F14']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Ground />
      <Street />

      {/* Player */}
      <Player position={playerPosition} rotation={playerRotation} gameState={gameState} />

      {/* Camera */}
      <CameraController playerPosition={playerPosition} playerRotation={playerRotation} />

      {/* Houses */}
      {houses.map((house) => (
        <House
          key={house.id}
          houseId={house.id}
          position={house.position}
          type={house.type}
          isOnline={onlineHouses.has(house.id)}
          isHighlighted={highlightedHouse?.id === house.id}
          onInteract={() => {
            if (!onlineHouses.has(house.id)) {
              setOnlineHouses(prev => new Set([...prev, house.id]));
              onInteract();
            }
          }}
        />
      ))}

      {/* NPCs */}
      {npcs.map((npc) => (
        <NPC
          key={npc.id}
          npcId={npc.id}
          position={npc.position}
          playerPosition={playerPosition}
          speedMultiplier={npc.speedMultiplier}
          onArrest={onGameOver}
        />
      ))}
    </>
  );
};

export default Scene;
