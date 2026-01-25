import { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3 } from 'three';
import { KEYBOARD_KEYS, GAME_CONFIG } from '@/utils/gameConstants';

export const usePlayerMovement = (gameState) => {
  const [position, setPosition] = useState(new Vector3(0, 0, 0));
  const [rotation, setRotation] = useState(0);
  const [velocity, setVelocity] = useState(new Vector3(0, 0, 0));
  const [isSprinting, setIsSprinting] = useState(false);
  
  const keysPressed = useRef(new Set());
  const mouseMovement = useRef({ x: 0, y: 0 });
  const isPointerLocked = useRef(false);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current.add(e.code);
      
      if (e.code === KEYBOARD_KEYS.SPRINT) {
        setIsSprinting(true);
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current.delete(e.code);
      
      if (e.code === KEYBOARD_KEYS.SPRINT) {
        setIsSprinting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse handling for camera rotation
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isPointerLocked.current) {
        mouseMovement.current.x += e.movementX;
        mouseMovement.current.y += e.movementY;
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  const requestPointerLock = useCallback(() => {
    document.body.requestPointerLock();
  }, []);

  const exitPointerLock = useCallback(() => {
    document.exitPointerLock();
  }, []);

  // Update movement
  const update = useCallback((delta) => {
    if (gameState !== 'playing') return;

    const moveSpeed = GAME_CONFIG.PLAYER.SPEED * delta * (isSprinting ? GAME_CONFIG.PLAYER.SPRINT_MULTIPLIER : 1);
    const newVelocity = new Vector3(0, 0, 0);

    // Forward/Backward
    if (KEYBOARD_KEYS.FORWARD.some(key => keysPressed.current.has(key))) {
      newVelocity.z -= moveSpeed;
    }
    if (KEYBOARD_KEYS.BACKWARD.some(key => keysPressed.current.has(key))) {
      newVelocity.z += moveSpeed;
    }

    // Left/Right
    if (KEYBOARD_KEYS.LEFT.some(key => keysPressed.current.has(key))) {
      newVelocity.x -= moveSpeed;
    }
    if (KEYBOARD_KEYS.RIGHT.some(key => keysPressed.current.has(key))) {
      newVelocity.x += moveSpeed;
    }

    // Apply rotation to velocity
    const rotatedVelocity = newVelocity.clone();
    rotatedVelocity.applyAxisAngle(new Vector3(0, 1, 0), rotation);

    setVelocity(rotatedVelocity);
    setPosition(prev => prev.clone().add(rotatedVelocity));

    // Update rotation from mouse
    if (mouseMovement.current.x !== 0) {
      setRotation(prev => prev - mouseMovement.current.x * GAME_CONFIG.PLAYER.ROTATION_SPEED);
      mouseMovement.current.x = 0;
    }
  }, [gameState, rotation, isSprinting]);

  return {
    position,
    rotation,
    velocity,
    isSprinting,
    update,
    requestPointerLock,
    exitPointerLock,
    setPosition,
    setRotation,
  };
};
