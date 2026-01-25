import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GAME_CONFIG } from '@/utils/gameConstants';

const CentralSwitch = ({ position, isActive, onActivate, isVisible }) => {
  const switchRef = useRef();
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useFrame((state) => {
    if (!switchRef.current || !isVisible) return;
    
    // Pulsierender Effekt
    const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
    setGlowIntensity(pulse);
    
    // Rotiere den Schalter langsam
    switchRef.current.rotation.y += 0.01;
  });

  if (!isVisible) return null;

  return (
    <group ref={switchRef} position={position}>
      {/* Basis-Plattform */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[2, 2.5, 0.4, 32]} />
        <meshStandardMaterial 
          color="#444444"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Zentrale Säule */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 2.5, 16]} />
        <meshStandardMaterial 
          color={isActive ? '#FFD700' : '#00FF88'}
          emissive={isActive ? '#FFD700' : '#00FF88'}
          emissiveIntensity={glowIntensity}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Schalter-Button oben */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial 
          color={isActive ? '#FFD700' : '#00FF88'}
          emissive={isActive ? '#FFD700' : '#00FF88'}
          emissiveIntensity={glowIntensity * 1.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Energie-Ringe um den Schalter */}
      {[1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 1 + i * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2 + i * 0.3, 0.05, 16, 100]} />
          <meshBasicMaterial 
            color={isActive ? '#FFD700' : '#00FF88'}
            transparent
            opacity={0.6 - i * 0.15}
          />
        </mesh>
      ))}

      {/* Starkes Licht */}
      <pointLight 
        color={isActive ? '#FFD700' : '#00FF88'}
        intensity={5}
        distance={20}
        position={[0, 3, 0]}
      />

      {/* Licht-Säule nach oben */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.3, 1, 20, 32]} />
        <meshBasicMaterial 
          color={isActive ? '#FFD700' : '#00FF88'}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Boden-Glow */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 64]} />
        <meshBasicMaterial 
          color={isActive ? '#FFD700' : '#00FF88'}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

export default CentralSwitch;
