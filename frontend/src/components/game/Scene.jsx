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

const Ground = ({ level }) => {
  const size = level === 0 ? 200 : (level === 1 ? 100 : (level === 2 ? 150 : 200));
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size, 50, 50]} />
      <meshStandardMaterial 
        color="#2A2F34"
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

const Street = ({ level }) => {
  // Level 1 (STRASSE): Einfache gerade Straße
  // Level 2+ (STADT, LAND, WELT): Straßennetz mit Kreuzungen
  
  if (level === 0) {
    // Einfache Straße für Level 1
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
  }
  
  // Stadt-Level: Straßennetz
  const gridSize = level === 1 ? 3 : (level === 2 ? 5 : 7); // STADT: 3x3, LAND: 5x5, WELT: 7x7
  const streetWidth = 10;
  const blockSize = 20;
  const totalSize = gridSize * blockSize;
  
  return (
    <group>
      {/* Horizontale Straßen */}
      {Array.from({ length: gridSize + 1 }).map((_, i) => {
        const zPos = -totalSize / 2 + i * blockSize;
        return (
          <React.Fragment key={`h-${i}`}>
            {/* Straße */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, zPos]} receiveShadow>
              <planeGeometry args={[totalSize, streetWidth]} />
              <meshStandardMaterial 
                color="#1a1a1a"
                roughness={0.9}
              />
            </mesh>
            
            {/* Mittelstreifen */}
            {Array.from({ length: Math.floor(totalSize / 4) }).map((_, j) => (
              <mesh 
                key={`hm-${i}-${j}`}
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[-totalSize / 2 + j * 4 + 2, 0.02, zPos]}
              >
                <planeGeometry args={[0.3, 1.5]} />
                <meshBasicMaterial color="#FFFF00" />
              </mesh>
            ))}
          </React.Fragment>
        );
      })}
      
      {/* Vertikale Straßen */}
      {Array.from({ length: gridSize + 1 }).map((_, i) => {
        const xPos = -totalSize / 2 + i * blockSize;
        return (
          <React.Fragment key={`v-${i}`}>
            {/* Straße */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[xPos, 0.01, 0]} receiveShadow>
              <planeGeometry args={[streetWidth, totalSize]} />
              <meshStandardMaterial 
                color="#1a1a1a"
                roughness={0.9}
              />
            </mesh>
            
            {/* Mittelstreifen */}
            {Array.from({ length: Math.floor(totalSize / 4) }).map((_, j) => (
              <mesh 
                key={`vm-${i}-${j}`}
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[xPos, 0.02, -totalSize / 2 + j * 4 + 2]}
              >
                <planeGeometry args={[1.5, 0.3]} />
                <meshBasicMaterial color="#FFFF00" />
              </mesh>
            ))}
          </React.Fragment>
        );
      })}
      
      {/* Kreuzungen - etwas heller */}
      {Array.from({ length: gridSize + 1 }).map((_, i) => 
        Array.from({ length: gridSize + 1 }).map((_, j) => {
          const xPos = -totalSize / 2 + i * blockSize;
          const zPos = -totalSize / 2 + j * blockSize;
          return (
            <mesh 
              key={`cross-${i}-${j}`}
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[xPos, 0.015, zPos]}
            >
              <planeGeometry args={[streetWidth, streetWidth]} />
              <meshStandardMaterial 
                color="#2a2a2a"
                roughness={0.8}
              />
            </mesh>
          );
        })
      )}
    </group>
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
  
  // Schalter-Position abhängig vom Level
  const switchPosition = useMemo(() => {
    if (currentLevel === 0) {
      return new THREE.Vector3(0, 0, -20); // Zentral für Level 1
    } else {
      return new THREE.Vector3(0, 0, 0); // Stadtmitte für Level 2+
    }
  }, [currentLevel]);

  // Update parent with scene data for minimap
  useEffect(() => {
    if (onSceneDataUpdate) {
      onSceneDataUpdate({ houses, npcs, onlineHouses, showSwitch, goldenHouses });
    }
  }, [houses, npcs, onlineHouses, onSceneDataUpdate, showSwitch, goldenHouses]);

  // Generate houses based on level
  useEffect(() => {
    const levelConfig = GAME_CONFIG.LEVELS[currentLevel];
    const newHouses = [];

    if (currentLevel === 0) {
      // Level 1 (STRASSE): Einfache Reihen links und rechts
      const housesPerSide = Math.ceil(levelConfig.target / 2);
      
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
    } else {
      // Stadt-Level: Häuser in Blöcken um Straßennetz
      const gridSize = currentLevel === 1 ? 3 : (currentLevel === 2 ? 5 : 7);
      const blockSize = 20;
      const totalSize = gridSize * blockSize;
      const housesPerBlock = Math.ceil(levelConfig.target / (gridSize * gridSize));
      
      let houseId = 0;
      
      // Für jeden Block im Gitter
      for (let blockX = 0; blockX < gridSize; blockX++) {
        for (let blockZ = 0; blockZ < gridSize; blockZ++) {
          const blockCenterX = -totalSize / 2 + blockX * blockSize + blockSize / 2;
          const blockCenterZ = -totalSize / 2 + blockZ * blockSize + blockSize / 2;
          
          // Häuser um den Block herum platzieren
          const housesInThisBlock = Math.min(housesPerBlock, levelConfig.target - houseId);
          
          for (let h = 0; h < housesInThisBlock; h++) {
            const side = h % 4; // 0=oben, 1=rechts, 2=unten, 3=links
            const offset = (h / 4) * 6; // Abstand entlang der Seite
            
            let posX, posZ;
            
            switch(side) {
              case 0: // Oben
                posX = blockCenterX - 8 + offset;
                posZ = blockCenterZ - 8;
                break;
              case 1: // Rechts
                posX = blockCenterX + 8;
                posZ = blockCenterZ - 8 + offset;
                break;
              case 2: // Unten
                posX = blockCenterX + 8 - offset;
                posZ = blockCenterZ + 8;
                break;
              case 3: // Links
                posX = blockCenterX - 8;
                posZ = blockCenterZ + 8 - offset;
                break;
            }
            
            newHouses.push({
              id: `house-${blockX}-${blockZ}-${h}`,
              position: new THREE.Vector3(posX, 0, posZ),
              type: Math.floor(Math.random() * 3),
            });
            
            houseId++;
            if (houseId >= levelConfig.target) break;
          }
          
          if (houseId >= levelConfig.target) break;
        }
        if (houseId >= levelConfig.target) break;
      }
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

  // Handle switch interaction (nur noch Schalter, keine Häuser mehr)
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
          }
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

  // Check for collision and auto-interact
  useFrame(() => {
    if (!playerPosition || gameState !== 'playing' || goldenHouses) return;

    // Check collision with houses
    houses.forEach(house => {
      const distance = playerPosition.distanceTo(house.position);
      
      // WICHTIG: Erst Auto-Interact prüfen (größerer Radius)
      // Dann erst Kollision (kleinerer Radius)
      
      // Automatische Interaktion beim Nahkommen
      if (distance < GAME_CONFIG.HOUSE.INTERACT_RADIUS && !onlineHouses.has(house.id)) {
        setOnlineHouses(prev => {
          if (prev.has(house.id)) return prev; // Bereits online
          const newSet = new Set([...prev, house.id]);
          
          // Play sounds
          soundManager.playPlacement();
          setTimeout(() => {
            soundManager.playHouseOnline();
          }, 800);
          
          onInteract();
          return newSet;
        });
      }
    });

    // Highlight closest house (für visuelles Feedback)
    let closestHouse = null;
    let minDistance = GAME_CONFIG.HOUSE.INTERACT_RADIUS;

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
      
      <Ground level={currentLevel} />
      <Street level={currentLevel} />

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
          isGolden={goldenHouses}
          isHighlighted={highlightedHouse?.id === house.id && !goldenHouses}
          onInteract={() => {
            if (!onlineHouses.has(house.id) && !goldenHouses) {
              setOnlineHouses(prev => new Set([...prev, house.id]));
              onInteract();
            }
          }}
        />
      ))}

      {/* Central Switch */}
      <CentralSwitch 
        position={switchPosition}
        isActive={switchActive}
        isVisible={showSwitch}
      />

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
