import { useState, useCallback } from 'react';

export const useGameState = () => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

  const incrementScore = useCallback(() => {
    setScore((prev) => prev + 1);
  }, []);

  const decrementLives = useCallback(() => {
    setLives((prev) => prev - 1);
  }, []);

  const updateLevel = useCallback((newLevel) => {
    setLevel(newLevel);
  }, []);

  const setGameOverState = useCallback((state) => {
    setGameOver(state);
  }, []);

  const updateFeedback = useCallback((message) => {
    setFeedback(message);
  }, []);

  const setProcessing = useCallback((state) => {
    setIsProcessingAnswer(state);
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setFeedback('');
    setIsProcessingAnswer(false);
  }, []);

  return {
    score,
    lives,
    level,
    gameOver,
    feedback,
    isProcessingAnswer,
    incrementScore,
    decrementLives,
    updateLevel,
    setGameOverState,
    updateFeedback,
    setProcessing,
    resetGame,
  };
};
