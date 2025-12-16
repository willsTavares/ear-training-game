export const LEVEL_PROGRESSION = {
  1: 0,
  2: 5,
  3: 10,
  4: 15,
  5: 20,
  6: 25,
  7: 30,
  8: 35,
  9: 40,
  10: 45,
};

export const LEVEL_NOTES = {
  1: ['C', 'E'],
  2: ['C', 'E', 'G'],
  3: ['C', 'D', 'E', 'G'],
  4: ['C', 'D', 'E', 'F', 'G'],
  5: ['C', 'D', 'E', 'F', 'G', 'A'],
  6: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  7: ['C', 'C#', 'D', 'E', 'F', 'G', 'A', 'B'],
  8: ['C', 'C#', 'D', 'D#', 'E', 'F', 'G', 'A', 'B'],
  9: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B'],
  10: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
};

export const getNotesByLevel = (level) => {
  return LEVEL_NOTES[level] || LEVEL_NOTES[1];
};

export const getLevelFromScore = (score) => {
  let level = 1;
  
  for (const [lvl, requiredScore] of Object.entries(LEVEL_PROGRESSION)) {
    if (score >= requiredScore) {
      level = parseInt(lvl);
    }
  }
  
  return level;
};
