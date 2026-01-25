import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { GAME_CONFIG } from '@/utils/gameConstants';
import * as THREE from 'three';

const House = ({ position, type, isOnline, isHighlighted, onInteract, houseId }) => {
  const houseRef = useRef();
  const boxRef = useRef();
  const [glowIntensity, setGlowIntensity] = useState(0);

  useFrame((state) => {
    if (isHighlighted && !isOnline) {
      setGlowIntensity(0.5 + Math.sin(state.clock.elapsedTime * 5) * 0.3);
    } else {
      setGlowIntensity(0);
    }

    // Animate box appearance
    if (boxRef.current && isOnline) {
      const targetScale = 1;
      boxRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const houseColor = isOnline ? GAME_CONFIG.COLORS.PRIMARY_GREEN : GAME_CONFIG.COLORS.OFFLINE_GRAY;
  const emissiveIntensity = isOnline ? 0.4 : 0;

  // House variants
  const variants = [
    { width: 4, height: 5, depth: 4 },
    { width: 3.5, height: 6, depth: 3.5 },
    { width: 4.5, height: 4.5, depth: 4 },
  ];
  const variant = variants[type % variants.length];

  return (
    <group ref={houseRef} position={position}>
      {/* Main house body */}
      <mesh position={[0, variant.height / 2, 0]}>
        <boxGeometry args={[variant.width, variant.height, variant.depth]} />
        <meshStandardMaterial 
          color={houseColor}
          emissive={houseColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, variant.height + 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[variant.width * 0.8, 1.5, 4]} />
        <meshStandardMaterial 
          color={isOnline ? '#00DD77' : '#222222'}
          emissive={isOnline ? '#00DD77' : '#000000'}
          emissiveIntensity={emissiveIntensity * 0.5}
        />
      </mesh>

      {/* Windows */}
      {[0.7, -0.7].map((xOffset, i) => (
        <React.Fragment key={i}>
          <mesh position={[xOffset, variant.height * 0.6, variant.depth / 2 + 0.01]}>
            <boxGeometry args={[0.5, 0.6, 0.1]} />
            <meshStandardMaterial 
              color={isOnline ? '#FFFF88' : '#111111'}
              emissive={isOnline ? '#FFFF88' : '#000000'}
              emissiveIntensity={isOnline ? 0.8 : 0}
            />
          </mesh>
        </React.Fragment>
      ))}

      {/* Door */}
      <mesh position={[0, variant.height * 0.25, variant.depth / 2 + 0.01]}>
        <boxGeometry args={[0.7, 1.2, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Internet box (when online) */}
      {isOnline && (
        <group position={[variant.width / 2 - 0.2, variant.height * 0.5, variant.depth / 2 + 0.1]}>
          <mesh ref={boxRef} scale={0}>
            <boxGeometry args={[0.3, 0.4, 0.15]} />
            <meshStandardMaterial 
              color={GAME_CONFIG.COLORS.PRIMARY_GREEN}
              emissive={GAME_CONFIG.COLORS.PRIMARY_GREEN}
              emissiveIntensity={0.8}
            />
          </mesh>
          {/* Glowing light */}
          <pointLight 
            color={GAME_CONFIG.COLORS.PRIMARY_GREEN} 
            intensity={2} 
            distance={5}
          />
        </group>
      )}

      {/* Highlight effect */}
      {isHighlighted && !isOnline && (
        <mesh position={[0, variant.height / 2, 0]}>
          <boxGeometry args={[variant.width + 0.2, variant.height + 0.2, variant.depth + 0.2]} />
          <meshBasicMaterial 
            color={GAME_CONFIG.COLORS.PRIMARY_GREEN}
            transparent
            opacity={glowIntensity}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};

export default House;
