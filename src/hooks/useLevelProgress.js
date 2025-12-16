import { useEffect, useCallback } from 'react';
import { getLevelFromScore } from '../constants/levels';

export const useLevelProgress = (score, level, updateLevel, onLevelUp) => {
  useEffect(() => {
    const newLevel = getLevelFromScore(score);
    
    if (newLevel !== level) {
      updateLevel(newLevel);
      if (onLevelUp) {
        onLevelUp(newLevel);
      }
    }
  }, [score, level, updateLevel, onLevelUp]);
};
