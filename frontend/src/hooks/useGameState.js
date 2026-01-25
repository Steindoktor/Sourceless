import { useState, useCallback, useEffect } from 'react';
import { GAME_CONFIG } from '@/utils/gameConstants';

export const useGameState = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [totalHouses, setTotalHouses] = useState(GAME_CONFIG.LEVELS[0].target);
  const [isPlacing, setIsPlacing] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCurrentLevel(0);
    setTotalHouses(GAME_CONFIG.LEVELS[0].target);
    setGameOverReason('');
  }, []);

  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    }
  }, [gameState]);

  const resumeGame = useCallback(() => {
    if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  const endGame = useCallback((reason) => {
    setGameState('gameOver');
    setGameOverReason(reason);
  }, []);

  const incrementScore = useCallback(() => {
    setScore(prev => {
      const newScore = prev + 1;
      // Level-Up wurde entfernt - passiert nur über Schalter
      return newScore;
    });
  }, [currentLevel, endGame]);

  const completeLevel = useCallback(() => {
    const levelConfig = GAME_CONFIG.LEVELS[currentLevel];
    
    if (score >= levelConfig.target && currentLevel < GAME_CONFIG.LEVELS.length - 1) {
      // Go to next level
      setCurrentLevel(currentLevel + 1);
      setTotalHouses(GAME_CONFIG.LEVELS[currentLevel + 1].target);
      setScore(0); // Reset score for new level
    } else if (score >= levelConfig.target && currentLevel === GAME_CONFIG.LEVELS.length - 1) {
      // Won the game!
      setTimeout(() => endGame('You connected the world!'), 500);
    }
  }, [currentLevel, score, endGame]);

  const progress = (score / GAME_CONFIG.LEVELS[currentLevel].target) * 100;
  const levelName = GAME_CONFIG.LEVELS[currentLevel].name;

  return {
    gameState,
    score,
    currentLevel,
    totalHouses,
    progress,
    levelName,
    isPlacing,
    setIsPlacing,
    gameOverReason,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    incrementScore,
    completeLevel,
  };
};
