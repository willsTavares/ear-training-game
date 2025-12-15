import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createAudioPlayer } from 'expo-audio';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(0);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const playerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  const onButtonLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setButtonWidth(width);
  };

  useEffect(() => {
    // Tocar primeira nota ao montar
    try {
      const timer = setTimeout(() => {
        console.log('Iniciando primeira nota');
        playRandomNote();
      }, 500);
      
      return () => {
        clearTimeout(timer);
        // Cleanup do player
        if (playerRef.current) {
          try {
            playerRef.current.release();
          } catch (e) {
            console.error('Erro ao liberar player:', e);
          }
        }
      };
    } catch (error) {
      console.error('Erro no useEffect inicial:', error);
      setLoadError(error.message);
    }
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
    } else if (score >= 40) {
      newLevel = 8;
    } else if (score >= 35) {
      newLevel = 7;
    } else if (score >= 30) {
      newLevel = 6;
    } else if (score >= 25) {
      newLevel = 5;
    } else if (score >= 20) {
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

  const playRandomNote = async () => {
    try {
      // Limpar feedback anterior
      setFeedback('');

      // Liberar player anterior se existir
      if (playerRef.current) {
        playerRef.current.release();
        playerRef.current = null;
      }

      // Escolher nota aleatória baseada no nível
      const notes = getNotesByLevel(level);
      const randomIndex = Math.floor(Math.random() * notes.length);
      const selectedNote = notes[randomIndex];
      setCorrectNote(selectedNote);

      // Criar novo player com a nota selecionada
      const player = createAudioPlayer(AUDIO_FILES[selectedNote]);
      playerRef.current = player;
      
      // Listener para quando terminar de tocar
      player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          // Parar animação e resetar
          if (animationRef.current) {
            animationRef.current.stop();
          }
          // Garantir que a barra chegue ao fim e depois resete
          progressAnim.setValue(1);
          setTimeout(() => {
            progressAnim.setValue(0);
          }, 150);
        }
      });

      setIsPlaying(true);
      
      // Iniciar animação de progresso (1 segundo = duração dos áudios)
      progressAnim.setValue(0);
      animationRef.current = Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      });
      animationRef.current.start();
      
      player.play();
    } catch (error) {
      console.error('Erro ao tocar nota:', error);
      setFeedback('❌ Erro ao carregar áudio');
    }
  };

  const playAgain = async () => {
    if (!correctNote || isPlaying) return;

    try {
      if (playerRef.current) {
        playerRef.current.seekTo(0);
        playerRef.current.play();
        setIsPlaying(true);
        
        // Iniciar animação de progresso (1 segundo = duração dos áudios)
        progressAnim.setValue(0);
        animationRef.current = Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        });
        animationRef.current.start();
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
    setShowRestartModal(false);
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setFeedback('');
    playRandomNote();
  };

  const handleRestartPress = () => {
    setShowRestartModal(true);
  };

  if (loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Erro ao carregar</Text>
          <Text style={styles.errorMessage}>{loadError}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Image 
              source={require('./assets/Command-Reset-256.png')} 
              style={styles.restartButtonIcon}
            />
            <Text style={styles.buttonText}>Recomeçar</Text>
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

      {/* Botões de controle */}
      <View style={styles.controlButtonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.playAgainButton]}
          onPress={playAgain}
          disabled={isPlaying}
          onLayout={onButtonLayout}
        >
          {/* Barra de progresso */}
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: buttonWidth,
                transform: [{
                  translateX: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-buttonWidth, 0],
                  })
                }],
              }
            ]} 
          />
          <Image 
            source={require('./assets/Media-Play-256.png')} 
            style={[styles.buttonIcon, isPlaying && styles.buttonIconPlaying]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={handleRestartPress}
        >
          <Image 
            source={require('./assets/Command-Reset-256.png')} 
            style={styles.buttonIconSmall}
          />
        </TouchableOpacity>
      </View>

      {/* Feedback - espaço fixo */}
      <View style={styles.feedbackWrapper}>
        {feedback !== '' && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}
      </View>

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

      {/* Modal de confirmação de restart */}
      <Modal
        visible={showRestartModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRestartModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Recomeçar?</Text>
            <Text style={styles.modalMessage}>
              Você perderá todo o progresso atual.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowRestartModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={restartGame}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
  },
  adContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
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
  feedbackWrapper: {
    height: 70,
    justifyContent: 'center',
    marginBottom: 10,
  },
  feedbackContainer: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  playAgainButton: {
    backgroundColor: '#252542',
    flex: 0.75,
    borderWidth: 1,
    borderColor: '#3a3a5c',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#3b82f6',
    opacity: 0.4,
  },
  playAgainButtonText: {
    fontSize: 24,
  },
  retryButton: {
    backgroundColor: '#252542',
    flex: 0.25,
    borderWidth: 1,
    borderColor: '#3a3a5c',
  },
  retryButtonText: {
    fontSize: 20,
  },
  buttonIcon: {
    width: 32,
    height: 32,
    tintColor: '#ffffff',
    zIndex: 1,
  },
  buttonIconPlaying: {
    tintColor: '#3b82f6',
  },
  buttonIconSmall: {
    width: 24,
    height: 24,
    tintColor: '#ffffff',
  },
  restartButtonIcon: {
    width: 32,
    height: 32,
    tintColor: '#ffffff',
    marginRight: 10,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  errorMessage: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  restartButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a5c',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#374151',
  },
  modalButtonConfirm: {
    backgroundColor: '#ef4444',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
