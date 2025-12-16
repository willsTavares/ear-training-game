import { getNotesByLevel } from '../constants/levels';

export const getRandomNote = (level) => {
  const notes = getNotesByLevel(level);
  const randomIndex = Math.floor(Math.random() * notes.length);
  return notes[randomIndex];
};

export const checkAnswer = (selectedNote, correctNote) => {
  return selectedNote === correctNote;
};
