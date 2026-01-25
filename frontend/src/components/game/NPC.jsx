import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { GAME_CONFIG } from '@/utils/gameConstants';
import * as THREE from 'three';
import { NPCTrailParticles } from './ParticleEffects';
import soundManager from '@/utils/soundManager';

const NPC = ({ position, playerPosition, onArrest, speedMultiplier = 1, npcId }) => {
  const npcRef = useRef();
  const [state, setState] = useState('patrol'); // patrol, alert, chase, arrest
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3());
  const [arrestTimer, setArrestTimer] = useState(0);
  const patrolPoints = useRef([]);
  const currentPatrolIndex = useRef(0);
  const hasPlayedAlertSound = useRef(false);

  // Initialize patrol points
  useEffect(() => {
    const startPos = new THREE.Vector3().copy(position);
    patrolPoints.current = [
      startPos.clone(),
      startPos.clone().add(new THREE.Vector3(10, 0, 0)),
      startPos.clone().add(new THREE.Vector3(10, 0, 10)),
      startPos.clone().add(new THREE.Vector3(0, 0, 10)),
    ];
    setTargetPosition(patrolPoints.current[0]);
  }, [position]);

  useFrame((_, delta) => {
    if (!npcRef.current || !playerPosition) return;

    const npcPos = npcRef.current.position;
    const distanceToPlayer = npcPos.distanceTo(playerPosition);

    // State machine
    if (distanceToPlayer < GAME_CONFIG.NPC.ARREST_RANGE) {
      if (state !== 'arrest') {
        setState('arrest');
        setArrestTimer(0);
      }
    } else if (distanceToPlayer < GAME_CONFIG.NPC.DETECTION_RANGE) {
      if (state !== 'chase' && state !== 'arrest') {
        setState('chase');
        hasPlayedAlertSound.current = false;
      }
      // Play alert sound once when starting chase
      if (state === 'chase' && !hasPlayedAlertSound.current) {
        soundManager.playNPCAlert();
        hasPlayedAlertSound.current = true;
      }
    } else {
      if (state === 'chase' || state === 'arrest') {
        setState('patrol');
        setArrestTimer(0);
        hasPlayedAlertSound.current = false;
      }
    }

    // Behavior based on state
    if (state === 'arrest') {
      setArrestTimer(prev => {
        const newTimer = prev + delta * 1000;
        if (newTimer >= GAME_CONFIG.NPC.ARREST_TIME) {
          onArrest();
        }
        return newTimer;
      });
    } else if (state === 'chase') {
      // Chase player
      const direction = new THREE.Vector3()
        .subVectors(playerPosition, npcPos)
        .normalize();
      
      const speed = GAME_CONFIG.NPC.CHASE_SPEED * speedMultiplier * delta;
      npcRef.current.position.add(direction.multiplyScalar(speed));
      
      // Look at player
      npcRef.current.lookAt(playerPosition.x, npcPos.y, playerPosition.z);
    } else if (state === 'patrol') {
      // Patrol between waypoints
      const direction = new THREE.Vector3()
        .subVectors(targetPosition, npcPos)
        .normalize();
      
      const distanceToTarget = npcPos.distanceTo(targetPosition);
      
      if (distanceToTarget < 0.5) {
        // Reached waypoint, go to next
        currentPatrolIndex.current = (currentPatrolIndex.current + 1) % patrolPoints.current.length;
        setTargetPosition(patrolPoints.current[currentPatrolIndex.current]);
      } else {
        const speed = GAME_CONFIG.NPC.SPEED * speedMultiplier * delta;
        npcRef.current.position.add(direction.multiplyScalar(speed));
        npcRef.current.lookAt(targetPosition.x, npcPos.y, targetPosition.z);
      }
    }
  });

  const isAlert = state === 'chase' || state === 'arrest';
  const bodyColor = isAlert ? GAME_CONFIG.COLORS.NPC_ALERT : '#444444';

  return (
    <group ref={npcRef} position={position}>
      {/* NPC Body */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 2, 16]} />
        <meshStandardMaterial 
          color={bodyColor}
          emissive={isAlert ? GAME_CONFIG.COLORS.NPC_ALERT : '#000000'}
          emissiveIntensity={isAlert ? 0.5 : 0}
        />
      </mesh>

      {/* NPC Head */}
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial 
          color={bodyColor}
          emissive={isAlert ? GAME_CONFIG.COLORS.NPC_ALERT : '#000000'}
          emissiveIntensity={isAlert ? 0.5 : 0}
        />
      </mesh>

      {/* Alert indicator */}
      {isAlert && (
        <>
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[0.3, 0.6, 8]} />
            <meshBasicMaterial color={GAME_CONFIG.COLORS.NPC_ALERT} />
          </mesh>
          <pointLight 
            color={GAME_CONFIG.COLORS.NPC_ALERT} 
            intensity={3} 
            distance={8}
          />
        </>
      )}

      {/* Arrest progress indicator */}
      {state === 'arrest' && (
        <mesh position={[0, 3.5, 0]}>
          <ringGeometry args={[0.4, 0.5, 32, 1, 0, (arrestTimer / GAME_CONFIG.NPC.ARREST_TIME) * Math.PI * 2]} />
          <meshBasicMaterial color="#FF0000" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export default NPC;
