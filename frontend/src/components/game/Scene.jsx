import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import Player from './Player';
import House from './House';
import NPC from './NPC';
import CentralSwitch from './CentralSwitch';
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
        color="#2A2F34"
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
  onSceneDataUpdate,
  onLevelComplete,
}) => {
  const [houses, setHouses] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [onlineHouses, setOnlineHouses] = useState(new Set());
  const [highlightedHouse, setHighlightedHouse] = useState(null);
  const [goldenHouses, setGoldenHouses] = useState(false);
  const [switchActive, setSwitchActive] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const interactKeyPressed = useRef(false);
  const switchPosition = new THREE.Vector3(0, 0, -20); // Zentrale Position

  // Update parent with scene data for minimap
  useEffect(() => {
    if (onSceneDataUpdate) {
      onSceneDataUpdate({ houses, npcs, onlineHouses });
    }
  }, [houses, npcs, onlineHouses, onSceneDataUpdate]);

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
    setGoldenHouses(false);
    setSwitchActive(false);
    setShowSwitch(false);

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

  // Check if all houses are online to show switch
  useEffect(() => {
    const levelConfig = GAME_CONFIG.LEVELS[currentLevel];
    if (onlineHouses.size >= levelConfig.target && !showSwitch && !goldenHouses) {
      setShowSwitch(true);
      soundManager.playCombo(); // Special sound when switch appears
    }
  }, [onlineHouses, currentLevel, showSwitch, goldenHouses]);

  // Handle interaction
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if E or Space is pressed
      const isInteractKey = Array.isArray(KEYBOARD_KEYS.INTERACT) 
        ? KEYBOARD_KEYS.INTERACT.includes(e.code)
        : e.code === KEYBOARD_KEYS.INTERACT;
        
      if (isInteractKey && !interactKeyPressed.current && gameState === 'playing') {
        interactKeyPressed.current = true;
        
        // Check if near switch
        if (showSwitch && !switchActive && playerPosition) {
          const distanceToSwitch = playerPosition.distanceTo(switchPosition);
          if (distanceToSwitch < 4) {
            // Activate switch!
            setSwitchActive(true);
            setGoldenHouses(true);
            soundManager.playHouseOnline();
            soundManager.playCombo();
            
            // After 2 seconds, go to next level
            setTimeout(() => {
              if (onLevelComplete) {
                onLevelComplete();
              }
            }, 3000);
            return;
          }
        }
        
        // Normal house interaction
        if (highlightedHouse && !onlineHouses.has(highlightedHouse.id) && !goldenHouses) {
          setOnlineHouses(prev => new Set([...prev, highlightedHouse.id]));
          
          // Play sounds
          soundManager.playPlacement();
          setTimeout(() => {
            soundManager.playHouseOnline();
          }, 800);
          
          onInteract();
        }
      }
    };

    const handleKeyUp = (e) => {
      const isInteractKey = Array.isArray(KEYBOARD_KEYS.INTERACT) 
        ? KEYBOARD_KEYS.INTERACT.includes(e.code)
        : e.code === KEYBOARD_KEYS.INTERACT;
        
      if (isInteractKey) {
        interactKeyPressed.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [highlightedHouse, onInteract, gameState, onlineHouses, showSwitch, switchActive, goldenHouses, playerPosition, currentLevel, onLevelComplete]);

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
      {/* Lighting - verstärkt für bessere Sichtbarkeit */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.2}
        castShadow
      />
      <directionalLight 
        position={[-10, 15, -10]} 
        intensity={0.6}
      />
      <pointLight position={[0, 10, 0]} intensity={0.8} />
      <hemisphereLight 
        skyColor="#ffffff"
        groundColor="#444444"
        intensity={0.5}
      />

      {/* Environment - Simple background color */}
      <color attach="background" args={['#0A0F14']} />
      <SimpleStars />
      <AmbientSparkles count={30} />
      
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
