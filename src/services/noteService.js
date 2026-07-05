import { getNotesByLevel } from '../constants/levels';

const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Sorteio por "saco de notas": em vez de sortear com reposição (o que pode
// deixar uma nota do nível sem tocar por várias rodadas), embaralha todas as
// notas do nível e vai tirando sem repetir até o saco esvaziar, quando é
// reembaralhado. Garante que toda nota do nível apareça antes de repetir.
export const drawNoteFromBag = (level, bagState, previousNote) => {
  const notes = getNotesByLevel(level);
  let bag = bagState && bagState.level === level ? bagState.notes : [];

  if (bag.length === 0) {
    bag = shuffle(notes);
    // Evita repetir a última nota tocada logo na virada do saco
    if (bag.length > 1 && bag[0] === previousNote) {
      [bag[0], bag[1]] = [bag[1], bag[0]];
    }
  }

  const [note, ...rest] = bag;
  return { note, bagState: { level, notes: rest } };
};

export const checkAnswer = (selectedNote, correctNote) => {
  return selectedNote === correctNote;
};
