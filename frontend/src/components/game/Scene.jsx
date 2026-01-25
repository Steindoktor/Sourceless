import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import Player from './Player';
import House from './House';
import NPC from './NPC';
import { GAME_CONFIG, KEYBOARD_KEYS } from '@/utils/gameConstants';
import { AmbientSparkles } from './ParticleEffects';
import soundManager from '@/utils/soundManager';

// Extend THREE to fix x-line-number issue
extend(THREE);

// Filter out React DevTools props
const filterProps = (props) => {
  const filtered = { ...props };
  Object.keys(filtered).forEach(key => {
    if (key.startsWith('x-') || key.includes('line-number')) {
      delete filtered[key];
    }
  });
  return filtered;
};

const SimpleStars = () => {
  const starsRef = useRef();
  
  const starPositions = useMemo(() => {
    const positions = new Float32Array(3000);
    for (let i = 0; i < 1000; i++) {
      const i3 = i * 3;
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.cos(phi);
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return positions;
  }, []);

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
      />
    </points>
  );
};

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
  onGameOver,
  onHighlightChange,
}) => {
  const [houses, setHouses] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [onlineHouses, setOnlineHouses] = useState(new Set());
  const [highlightedHouse, setHighlightedHouse] = useState(null);
  const interactKeyPressed = useRef(false);

  // Generate houses based on level
  useEffect(() => {
    const levelConfig = GAME_CONFIG.LEVELS[currentLevel];
    // For 20 houses, we want 10 per side (not sqrt)
    const housesPerSide = Math.ceil(levelConfig.target / 2);
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
    // Reset online houses when level changes
    setOnlineHouses(new Set());

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
      setHighlightedHouse(closestHouse);
      if (onHighlightChange) {
        onHighlightChange(closestHouse);
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
      <SimpleStars />
      
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
