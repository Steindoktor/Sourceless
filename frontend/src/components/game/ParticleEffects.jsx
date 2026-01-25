import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Particle system for house connection effect
export const HouseConnectionParticles = ({ position, active }) => {
  const particlesRef = useRef();
  const particleCount = 30;
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Start near the house
      positions[i3] = position.x + (Math.random() - 0.5) * 2;
      positions[i3 + 1] = position.y + Math.random() * 3;
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;
      
      // Random velocity
      velocities.push({
        x: (Math.random() - 0.5) * 0.1,
        y: Math.random() * 0.2 + 0.1,
        z: (Math.random() - 0.5) * 0.1,
        life: 1.0,
      });
    }
    
    return { positions, velocities };
  }, [position]);

  useFrame((_, delta) => {
    if (!particlesRef.current || !active) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const velocity = particles.velocities[i];
      
      if (velocity.life > 0) {
        positions[i3] += velocity.x;
        positions[i3 + 1] += velocity.y;
        positions[i3 + 2] += velocity.z;
        
        velocity.y -= 0.003; // Gravity
        velocity.life -= delta * 0.5;
        
        // Reset if dead
        if (velocity.life <= 0) {
          positions[i3] = position.x + (Math.random() - 0.5) * 2;
          positions[i3 + 1] = position.y + Math.random() * 3;
          positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;
          velocity.life = 1.0;
        }
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#00FF88"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Trail particles for NPCs
export const NPCTrailParticles = ({ position, isChasing }) => {
  const particlesRef = useRef();
  const particleCount = 20;
  const positions = useRef(new Float32Array(particleCount * 3));
  const ages = useRef(new Array(particleCount).fill(0));

  useFrame((_, delta) => {
    if (!particlesRef.current || !isChasing) return;
    
    const posArray = positions.current;
    const ageArray = ages.current;
    
    // Update ages and fade out
    for (let i = 0; i < particleCount; i++) {
      ageArray[i] += delta;
      
      // Reset old particles
      if (ageArray[i] > 0.5) {
        const i3 = i * 3;
        posArray[i3] = position.x + (Math.random() - 0.5);
        posArray[i3 + 1] = position.y + Math.random() * 2;
        posArray[i3 + 2] = position.z + (Math.random() - 0.5);
        ageArray[i] = 0;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!isChasing) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#FF3333"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Ambient sparkles
export const AmbientSparkles = ({ count = 50 }) => {
  const particlesRef = useRef();
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = [];
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = Math.random() * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;
      phases.push(Math.random() * Math.PI * 2);
    }
    
    return { positions, phases };
  }, [count]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const material = particlesRef.current.material;
    material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00FF88"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
