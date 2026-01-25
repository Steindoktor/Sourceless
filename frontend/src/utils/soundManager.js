// Simple Sound Manager using Web Audio API and synthesized sounds
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.musicPlaying = false;
    this.musicGainNode = null;
    this.sfxGainNode = null;
    this.enabled = true;
    this.musicEnabled = true;
  }

  init() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.sfxGainNode = this.audioContext.createGain();
      this.sfxGainNode.connect(this.audioContext.destination);
      this.sfxGainNode.gain.value = 0.3;

      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.connect(this.audioContext.destination);
      this.musicGainNode.gain.value = 0.15;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
      this.enabled = false;
    }
  }

  // Placement sound - mechanical click
  playPlacement() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGainNode);

    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  // House online sound - success ping
  playHouseOnline() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGainNode);

    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  // NPC alert sound - alarm
  playNPCAlert() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGainNode);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, now);
    oscillator.frequency.setValueAtTime(440, now + 0.1);
    oscillator.frequency.setValueAtTime(220, now + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.setValueAtTime(0.2, now + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }

  // Combo sound
  playCombo() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGainNode);

    oscillator.frequency.setValueAtTime(1000, now);
    oscillator.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  // Background music - simple ambient loop
  startBackgroundMusic() {
    if (!this.musicEnabled || !this.enabled || !this.audioContext || this.musicPlaying) return;
    
    this.musicPlaying = true;
    this.playMusicLoop();
  }

  playMusicLoop() {
    if (!this.musicPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const notes = [261.63, 293.66, 329.63, 392.00]; // C, D, E, G
    const duration = 0.8;

    notes.forEach((freq, index) => {
      const startTime = now + index * duration;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.musicGainNode);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });

    // Loop
    setTimeout(() => {
      if (this.musicPlaying) {
        this.playMusicLoop();
      }
    }, notes.length * duration * 1000);
  }

  stopBackgroundMusic() {
    this.musicPlaying = false;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.musicEnabled;
  }

  setMusicVolume(volume) {
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  setSFXVolume(volume) {
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

// Singleton instance
const soundManager = new SoundManager();
export default soundManager;
