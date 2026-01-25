import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { GAME_CONFIG } from '@/utils/gameConstants';
import * as THREE from 'three';

const Player = ({ position, rotation, gameState }) => {
  const playerRef = useRef();

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.copy(position);
      playerRef.current.rotation.y = rotation;
    }
  }, [position, rotation]);

  return (
    <group ref={playerRef}>
      {/* Player body - simple capsule */}
      <mesh position={[0, GAME_CONFIG.PLAYER.HEIGHT / 2, 0]}>
        <capsuleGeometry args={[GAME_CONFIG.PLAYER.RADIUS, GAME_CONFIG.PLAYER.HEIGHT - GAME_CONFIG.PLAYER.RADIUS * 2, 8, 16]} />
        <meshStandardMaterial 
          color="#00FF88" 
          emissive="#00DD77"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Player head indicator */}
      <mesh position={[0, GAME_CONFIG.PLAYER.HEIGHT + 0.3, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#00FF88"
          emissive="#00FF88"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Direction indicator */}
      <mesh position={[0, GAME_CONFIG.PLAYER.HEIGHT / 2, -GAME_CONFIG.PLAYER.RADIUS - 0.2]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

export default Player;
