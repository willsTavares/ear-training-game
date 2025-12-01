import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Audio } from 'expo-av';

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const AUDIO_FILES = {
  C: require('./assets/sound/c1.wav'),
  'C#': require('./assets/sound/c1s.wav'),
  D: require('./assets/sound/d1.wav'),
  'D#': require('./assets/sound/d1s.wav'),
  E: require('./assets/sound/e1.wav'),
  F: require('./assets/sound/f1.wav'),
  'F#': require('./assets/sound/f1s.wav'),
  G: require('./assets/sound/g1.wav'),
  'G#': require('./assets/sound/g1s.wav'),
  A: require('./assets/sound/a1.wav'),
  'A#': require('./assets/sound/a1s.wav'),
  B: require('./assets/sound/b1.wav'),
};

const getNotesByLevel = (level) => {
  switch (level) {
    case 1:
      return ['C', 'E'];
    case 2:
      return ['C', 'E', 'G'];
    case 3:
      return ['C', 'D', 'E', 'G'];
    case 4:
      return ['C', 'D', 'E', 'F', 'G'];
    case 5:
      return ['C', 'D', 'E', 'F', 'G', 'A'];
    case 6:
      return ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    case 7:
      return ['C', 'C#', 'D', 'E', 'F', 'G', 'A', 'B'];
    case 8:
      return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'A', 'B'];
    case 9:
      return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    default:
      return ['C', 'E'];
  }
};

export default function GameScreen() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [correctNote, setCorrectNote] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Configurar o áudio ao montar o componente
    configureAudio();
    playRandomNote();

    // Cleanup ao desmontar
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    // Verificar game over
    if (lives <= 0) {
      setGameOver(true);
    }
  }, [lives]);

  useEffect(() => {
    // Progressão automática de nível
    let newLevel = 1;
    
    if (score >= 40) {
      newLevel = 9;
    } else if (score >= 35) {
      newLevel = 8;
    } else if (score >= 30) {
      newLevel = 7;
    } else if (score >= 25) {
      newLevel = 6;
    } else if (score >= 20) {
      newLevel = 5;
    } else if (score >= 15) {
      newLevel = 4;
    } else if (score >= 10) {
      newLevel = 3;
    } else if (score >= 5) {
      newLevel = 2;
    }
    
    if (newLevel !== level) {
      setLevel(newLevel);
      setFeedback(`🔥 Level ${newLevel} desbloqueado!`);
      setTimeout(() => {
        setFeedback('');
      }, 2000);
    }
  }, [score, level]);

  const configureAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Erro ao configurar áudio:', error);
    }
  };

  const playRandomNote = async () => {
    try {
      // Limpar feedback anterior
      setFeedback('');

      // Descarregar som anterior se existir
      if (sound) {
        await sound.unloadAsync();
      }

      // Escolher nota aleatória baseada no nível
      const notes = getNotesByLevel(level);
      const randomIndex = Math.floor(Math.random() * notes.length);
      const selectedNote = notes[randomIndex];
      setCorrectNote(selectedNote);

      // Carregar e tocar o áudio
      const { sound: newSound } = await Audio.Sound.createAsync(
        AUDIO_FILES[selectedNote],
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Callback quando o som terminar
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Erro ao tocar nota:', error);
      setFeedback('❌ Erro ao carregar áudio');
    }
  };

  const playAgain = async () => {
    if (!correctNote || isPlaying) return;

    try {
      if (sound) {
        await sound.replayAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erro ao tocar novamente:', error);
    }
  };

  const handleAnswer = (note) => {
    if (gameOver || !correctNote) return;

    if (note === correctNote) {
      // Resposta correta
      setScore(score + 1);
      setFeedback('✅ Acertou!');
      
      // Tocar próxima nota após um delay
      setTimeout(() => {
        playRandomNote();
      }, 1500);
    } else {
      // Resposta incorreta
      setLives(lives - 1);
      setFeedback(`❌ Errou, era: ${correctNote}`);
      
      // Tocar próxima nota após um delay (se ainda tiver vidas)
      setTimeout(() => {
        if (lives - 1 > 0) {
          playRandomNote();
        }
      }, 2000);
    }
  };

  const restartGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setFeedback('');
    playRandomNote();
  };

  if (gameOver) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>Game Over</Text>
          <Text style={styles.finalScore}>Pontuação Final: {score}</Text>
          <TouchableOpacity
            style={[styles.button, styles.restartButton]}
            onPress={restartGame}
          >
            <Text style={styles.buttonText}>🔄 Recomeçar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header com pontuação e vidas */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.label}>Pontuação</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
        <View style={styles.livesContainer}>
          <Text style={styles.label}>Vidas</Text>
          <Text style={styles.livesText}>
            {'❤️'.repeat(lives)}
          </Text>
        </View>
      </View>

      {/* Level */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Level: {level}</Text>
      </View>

      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>🎵 Treino de Ouvido</Text>
        <Text style={styles.subtitle}>Qual nota está tocando?</Text>
      </View>

      {/* Feedback */}
      {feedback !== '' && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* Botão ouvir novamente */}
      <TouchableOpacity
        style={[styles.button, styles.playAgainButton]}
        onPress={playAgain}
        disabled={isPlaying}
      >
        <Text style={styles.buttonText}>
          {isPlaying ? '🔊 Tocando...' : '🔊 Ouvir Novamente'}
        </Text>
      </TouchableOpacity>

      {/* Botões das notas */}
      <View style={styles.notesContainer}>
        {getNotesByLevel(level).map((note) => (
          <TouchableOpacity
            key={note}
            style={[styles.noteButton]}
            onPress={() => handleAnswer(note)}
          >
            <Text style={styles.noteButtonText}>{note}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  scoreContainer: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 15,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  livesContainer: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 15,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 5,
  },
  scoreText: {
    color: '#4ade80',
    fontSize: 32,
    fontWeight: 'bold',
  },
  livesText: {
    fontSize: 24,
  },
  levelContainer: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  levelText: {
    color: '#f59e0b',
    fontSize: 22,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 16,
  },
  feedbackContainer: {
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  button: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  playAgainButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  noteButton: {
    backgroundColor: '#8b5cf6',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  noteButtonText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverTitle: {
    color: '#ef4444',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  finalScore: {
    color: '#ffffff',
    fontSize: 24,
    marginBottom: 40,
  },
  restartButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 40,
  },
});
