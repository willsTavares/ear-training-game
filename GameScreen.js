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
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [colorTransition, setColorTransition] = useState({
    from: 1,
    to: 1,
    anim: new Animated.Value(1),
  });

  const onButtonLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setButtonWidth(width);
  };

  // Paleta de cores por nível
  const getBackgroundColorByLevel = (currentLevel) => {
    const colors = {
      1: '#0A1E3F',  // Azul escuro
      2: '#2C1B3C',  // Azul arroxeado
      3: '#4A1833',  // Roxo escuro / vinho
      4: '#6B1A1A',  // Vermelho escuro
      5: '#7B1A1A',  // Vermelho escuro +
      6: '#8B1A1A',  // Vermelho escuro ++
      7: '#9B0A0A',  // Vermelho intenso
      8: '#AB0000',  // Vermelho muito intenso
      9: '#BB0000',  // Vermelho máximo
    };
    return colors[currentLevel] || colors[1];
  };

  // Paleta de cores dos botões por nível (combinam com o fundo)
  const getButtonColorByLevel = (currentLevel) => {
    const colors = {
      1: '#7c3aed',  // Roxo vibrant
      2: '#a855f7',  // Roxo mais claro
      3: '#d946ef',  // Pink/Magenta
      4: '#ec4899',  // Pink intenso
      5: '#f43f5e',  // Rose
      6: '#fb7185',  // Rose claro
      7: '#fca5a5',  // Rose mais claro
      8: '#fda4af',  // Rose pálido
      9: '#fbcfe8',  // Pink muito claro
    };
    return colors[currentLevel] || colors[1];
  };

  // Função para disparar animação de shake
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: -15,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 15,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -15,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 15,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 75,
        useNativeDriver: true,
      }),
    ]).start();
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

  // Transição suave de cor ao subir de nível
  useEffect(() => {
    setColorTransition((current) => {
      // Se já estamos no nível correto, não fazer nada
      if (level === current.to) {
        return current;
      }

      // Se voltamos para o nível 1 (restart), resetar imediatamente sem animação
      if (level === 1 && current.to > 1) {
        return {
          from: 1,
          to: 1,
          anim: new Animated.Value(1),
        };
      }

      // Caso contrário, animar a transição normalmente
      const newAnim = new Animated.Value(0);
      Animated.timing(newAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();

      return {
        from: current.to,
        to: level,
        anim: newAnim,
      };
    });
  }, [level]);

  const playRandomNote = async () => {
    try {
      console.log('playRandomNote iniciado');
      // Limpar feedback anterior
      setFeedback('');

      // Liberar player anterior se existir
      if (playerRef.current) {
        try {
          playerRef.current.release();
        } catch (e) {
          console.warn('Erro ao liberar player anterior:', e);
        }
        playerRef.current = null;
      }

      // Escolher nota aleatória baseada no nível
      const notes = getNotesByLevel(level);
      if (!notes || notes.length === 0) {
        throw new Error('Nenhuma nota disponível para este nível');
      }

      const randomIndex = Math.floor(Math.random() * notes.length);
      const selectedNote = notes[randomIndex];
      console.log('Nota selecionada:', selectedNote);
      
      setCorrectNote(selectedNote);

      // Verificar se o arquivo de áudio existe
      const audioFile = AUDIO_FILES[selectedNote];
      if (!audioFile) {
        throw new Error(`Arquivo de áudio não encontrado para nota: ${selectedNote}`);
      }

      // Criar novo player com a nota selecionada
      const player = createAudioPlayer(audioFile);
      
      if (!player) {
        throw new Error('Falha ao criar player de áudio');
      }

      playerRef.current = player;
      
      // Listener para quando terminar de tocar
      const unsubscribe = player.addListener('playbackStatusUpdate', (status) => {
        try {
          if (status.didJustFinish) {
            console.log('Áudio terminou de tocar');
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
        } catch (e) {
          console.error('Erro no listener de status:', e);
        }
      });

      setIsPlaying(true);
      
      // Iniciar animação de progresso (1 segundo = duração dos áudios)
      progressAnim.setValue(0);
      
      if (animationRef.current) {
        animationRef.current.stop();
      }

      animationRef.current = Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      });
      
      animationRef.current.start();
      
      console.log('Tocando áudio');
      await player.play();
      console.log('Áudio iniciou com sucesso');
    } catch (error) {
      console.error('Erro ao tocar nota:', error);
      setFeedback(`❌ Erro: ${error.message}`);
      setLoadError(error.message);
    }
  };

  const playAgain = async () => {
    if (!correctNote || isPlaying) return;

    try {
      if (playerRef.current) {
        console.log('Tocando novamente');
        await playerRef.current.seekTo(0);
        await playerRef.current.play();
        setIsPlaying(true);
        
        // Iniciar animação de progresso (1 segundo = duração dos áudios)
        progressAnim.setValue(0);
        
        if (animationRef.current) {
          animationRef.current.stop();
        }

        animationRef.current = Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        });
        animationRef.current.start();
      }
    } catch (error) {
      console.error('Erro ao tocar novamente:', error);
      setFeedback('❌ Erro ao reproduzir áudio');
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
      
      // Disparar animação de shake
      triggerShake();
      
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
    setGameOver(false);
    setFeedback('');
    
    // Reset background color transition FIRST
    setColorTransition({
      from: 1,
      to: 1,
      anim: new Animated.Value(1),
    });
    
    // Then reset game state
    setScore(0);
    setLives(3);
    setLevel(1);
    
    playRandomNote();
  };

  const handleRestartPress = () => {
    setShowRestartModal(true);
  };

  if (loadError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColorByLevel(level) }]}>
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
      <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColorByLevel(level) }]}>
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

  const previousBgColor = getBackgroundColorByLevel(colorTransition.from);
  const currentBgColor = getBackgroundColorByLevel(colorTransition.to);
  const bgColorStyle = {
    backgroundColor: colorTransition.anim.interpolate({
      inputRange: [0, 1],
      outputRange: [previousBgColor, currentBgColor],
    }),
  };

  const buttonColor = getButtonColorByLevel(level);

  return (
    <SafeAreaView style={[styles.container, bgColorStyle]}>
      <StatusBar barStyle="light-content" />
      
      {/* Game container com animação de shake */}
      <Animated.View
        style={[
          styles.gameContainer,
          {
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
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
            style={[styles.noteButton, { backgroundColor: buttonColor, shadowColor: buttonColor }]}
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
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1E3F',
    paddingHorizontal: 20,
  },
  gameContainer: {
    flex: 1,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
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
