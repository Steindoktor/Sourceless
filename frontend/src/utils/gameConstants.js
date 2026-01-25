// Game constants and configuration
export const GAME_CONFIG = {
  // Player settings
  PLAYER: {
    SPEED: 5,
    SPRINT_MULTIPLIER: 1.8,
    ROTATION_SPEED: 0.002,
    HEIGHT: 1.8,
    RADIUS: 0.5,
    INTERACTION_RANGE: 3,
  },
  
  // Camera settings
  CAMERA: {
    DISTANCE: 8,
    HEIGHT: 4,
    FOV: 60,
    MIN_POLAR: Math.PI / 6,
    MAX_POLAR: Math.PI / 2.5,
  },
  
  // House settings
  HOUSE: {
    WIDTH: 4,
    HEIGHT: 5,
    DEPTH: 4,
    SPACING: 8,
    ROWS_PER_SIDE: 10,
  },
  
  // NPC/Beamte settings
  NPC: {
    SPEED: 3,
    CHASE_SPEED: 4.5,
    DETECTION_RANGE: 15,
    ARREST_RANGE: 1.5,
    ARREST_TIME: 1000, // ms
    PATROL_RADIUS: 20,
  },
  
  // Level progression
  LEVELS: [
    { name: 'STRASSE', target: 20, npcCount: 1, npcSpeed: 1 },
    { name: 'STADT', target: 200, npcCount: 3, npcSpeed: 1.2 },
    { name: 'LAND', target: 2000, npcCount: 8, npcSpeed: 1.5 },
    { name: 'WELT', target: 20000, npcCount: 15, npcSpeed: 1.8 },
  ],
  
  // Placement animation
  PLACEMENT_DURATION: 800, // ms
  
  // Colors (inspired by sourceless.net)
  COLORS: {
    PRIMARY_GREEN: '#00FF88',
    DARK_BG: '#0A0F14',
    SECONDARY_DARK: '#1A1F24',
    ACCENT_GREEN: '#00DD77',
    OFFLINE_GRAY: '#333333',
    ONLINE_GLOW: '#00FF88',
    NPC_ALERT: '#FF3333',
  },
};

export const KEYBOARD_KEYS = {
  FORWARD: ['KeyW', 'ArrowUp'],
  BACKWARD: ['KeyS', 'ArrowDown'],
  LEFT: ['KeyA', 'ArrowLeft'],
  RIGHT: ['KeyD', 'ArrowRight'],
  SPRINT: 'ShiftLeft',
  INTERACT: ['KeyE', 'Space'], // E oder Leertaste
  PAUSE: 'Escape',
};
