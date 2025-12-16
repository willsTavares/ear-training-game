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
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createAudioPlayer } from 'expo-audio';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as Haptics from 'expo-haptics';

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
      return ['C', 'C#', 'D', 'D#', 'E', 'F', 'G', 'A', 'B'];
    case 9:
      return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B'];
    case 10:
      return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    default:
      return ['C', 'E'];
  }
};

export default function GameScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

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
  const [lastCorrectButton, setLastCorrectButton] = useState(null);
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const playerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnims = useRef({}).current;
  const correctButtonAnim = useRef(new Animated.Value(0)).current;
  const levelUpAnim = useRef(new Animated.Value(0)).current;
  const levelUpOpacity = useRef(new Animated.Value(0)).current;
  const [colorTransition, setColorTransition] = useState({
    from: 1,
    to: 1,
    anim: new Animated.Value(1),
  });

  // Função para inicializar animações de escala dos botões
  const getButtonScaleAnim = (note) => {
    if (!buttonScaleAnims[note]) {
      buttonScaleAnims[note] = new Animated.Value(1);
    }
    return buttonScaleAnims[note];
  };

  // Função para animar press do botão
  const animateButtonPress = (note) => {
    const scaleAnim = getButtonScaleAnim(note);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Função para animar acerto (pulse verde)
  const animateCorrectAnswer = (note) => {
    setLastCorrectButton(note);
    correctButtonAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(correctButtonAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(correctButtonAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLastCorrectButton(null);
    });
  };

  // Função para animar Level Up com feedback tátil
  const animateLevelUp = (newLevel) => {
    setLevelUpVisible(true);
    levelUpAnim.setValue(0);
    levelUpOpacity.setValue(0);

    // Feedback tátil apenas uma vez
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics não disponível:', error);
    }

    // Determinar intensidade baseada no nível
    const isHighLevel = newLevel >= 6;
    const maxScale = isHighLevel ? 1.2 : 1.15;
    const duration = isHighLevel ? 1400 : 1200;

    Animated.parallel([
      // Animação de escala (0.85 → maxScale → 1)
      Animated.sequence([
        Animated.timing(levelUpAnim, {
          toValue: 0.5,
          duration: duration * 0.35,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // easeOutCubic
          useNativeDriver: true,
        }),
        Animated.timing(levelUpAnim, {
          toValue: 1,
          duration: duration * 0.65,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),
      // Animação de opacidade (0 → 1 → 0)
      Animated.sequence([
        Animated.timing(levelUpOpacity, {
          toValue: 1,
          duration: duration * 0.4,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(levelUpOpacity, {
          toValue: 0,
          duration: duration * 0.6,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setLevelUpVisible(false);
    });
  };

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
      10: '#CC0000', // Vermelho extremo
    };
    return colors[currentLevel] || colors[1];
  };

  // Paleta de cores dos botões por nível (combinam com o fundo)
  const getButtonColorByLevel = (currentLevel) => {
  const colors = {
    1: '#6d28d9', // Roxo profundo (calmo, foco inicial)
    2: '#7c3aed', // Roxo vibrante
    3: '#9333ea', // Roxo-magenta
    4: '#a21caf', // Magenta escuro
    5: '#be123c', // Vermelho vinho
    6: '#9f1239', // Vermelho escuro intenso
    7: '#7f1d1d', // Vermelho sangue
    8: '#450a0a', // Vinho muito escuro
    9: '#1f0505', // Quase preto avermelhado
    10: '#0f0202', // Preto avermelhado total (clímax)
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
    
    if (score >= 45) {
      newLevel = 10;
    } else if (score >= 40) {
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
      animateLevelUp(newLevel);
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
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // easeOutCubic suave
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
      
      console.log('Tocando áudio:', selectedNote);
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
    if (gameOver || !correctNote || isProcessingAnswer) return;

    // Bloquear novos cliques
    setIsProcessingAnswer(true);

    // Animar o press do botão
    animateButtonPress(note);

    if (note === correctNote) {
      // Resposta correta
      setScore(score + 1);
      setFeedback('✅ Acertou!');
      
      // Animar acerto
      animateCorrectAnswer(note);
      
      // Tocar próxima nota após um delay
      setTimeout(() => {
        setIsProcessingAnswer(false);
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
        setIsProcessingAnswer(false);
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
    setIsProcessingAnswer(false);
    
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
          <Text style={[styles.errorTitle, { fontFamily: 'Inter_700Bold' }]}>❌ Erro ao carregar</Text>
          <Text style={[styles.errorMessage, { fontFamily: 'Inter_400Regular' }]}>{loadError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!fontsLoaded) {
    return null;
  }

  if (gameOver) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColorByLevel(1) }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.gameOverContainer}>
          <Text style={[styles.gameOverTitle, { fontFamily: 'Inter_700Bold' }]}>Game Over</Text>
          <Text style={[styles.finalScore, { fontFamily: 'Inter_600SemiBold' }]}>Pontuação Final: {score}</Text>
          <TouchableOpacity
            style={[styles.button, styles.restartButton]}
            onPress={restartGame}
          >
            <Image 
              source={require('./assets/Command-Reset-256.png')} 
              style={styles.restartButtonIcon}
            />
            <Text style={[styles.buttonText, { fontFamily: 'Inter_600SemiBold' }]}>Recomeçar</Text>
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
      {/* Barra de status unificada */}
      <View style={styles.unifiedStatusBar}>
        <View style={styles.statusItem}>
          <Text style={[styles.statusIcon, { fontFamily: 'Inter_400Regular' }]}>⭐</Text>
          <Text style={[styles.statusValue, { fontFamily: 'Inter_700Bold' }]}>{score}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { fontFamily: 'Inter_600SemiBold' }]}>LEVEL {level}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={[styles.statusValue, { fontFamily: 'Inter_400Regular' }]}>{'❤️'.repeat(lives)}</Text>
        </View>
      </View>

      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={[styles.subtitle, { fontFamily: 'Inter_400Regular' }]}>Qual nota está tocando?</Text>
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
          <Text style={[styles.playButtonText, { fontFamily: 'Inter_600SemiBold' }]}> Play</Text>
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
            <Text style={[styles.feedbackText, { fontFamily: 'Inter_600SemiBold' }]}>{feedback}</Text>
          </View>
        )}
      </View>

      {/* Botões das notas */}
      <View style={styles.notesContainer}>
        {getNotesByLevel(level).map((note) => {
          const scaleAnim = getButtonScaleAnim(note);
          const isCorrect = lastCorrectButton === note;
          
          return (
            <Animated.View
              key={note}
              style={{
                transform: [
                  { scale: scaleAnim },
                  {
                    scale: isCorrect
                      ? correctButtonAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 1.15, 1],
                        })
                      : 1,
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.noteButton,
                  { 
                    backgroundColor: buttonColor, 
                    shadowColor: buttonColor,
                  },
                  isCorrect && {
                    backgroundColor: '#10b981',
                    shadowColor: '#10b981',
                  },
                ]}
                onPress={() => handleAnswer(note)}
              >
                <Text style={[styles.noteButtonText, { fontFamily: 'Inter_700Bold' }]}>{note}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
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
            <Text style={[styles.modalTitle, { fontFamily: 'Inter_700Bold' }]}>Recomeçar?</Text>
            <Text style={[styles.modalMessage, { fontFamily: 'Inter_400Regular' }]}>
              Você perderá todo o progresso atual.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowRestartModal(false)}
              >
                <Text style={[styles.modalButtonText, { fontFamily: 'Inter_600SemiBold' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={restartGame}
              >
                <Text style={[styles.modalButtonText, { fontFamily: 'Inter_600SemiBold' }]}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </Animated.View>

      {/* Animação de Level Up - fora do container com shake */}
      {levelUpVisible && (
        <Animated.View
          style={[
            styles.levelUpOverlay,
            {
              opacity: levelUpOpacity,
              backgroundColor: levelUpOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(0, 0, 0, 0)', level >= 6 ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)'],
              }),
            },
          ]}
          pointerEvents="none"
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale: levelUpAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.85, level >= 6 ? 1.2 : 1.15, 1],
                  }),
                },
              ],
            }}
          >
            <Text 
              style={[
                styles.levelUpText, 
                { fontFamily: 'Inter_700Bold' },
                level >= 6 && styles.levelUpTextGlow,
              ]}
            >
              LEVEL {level}
            </Text>
          </Animated.View>
        </Animated.View>
      )}
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
  // Barra de status unificada
  unifiedStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 30,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    fontSize: 18,
    opacity: 0.7,
  },
  statusValue: {
    color: '#ffffff',
    fontSize: 20,
  },
  statusLabel: {
    color: '#f59e0b',
    fontSize: 18,
    letterSpacing: 1,
  },
  // Título
  titleContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 18,
  },
  // Botões de controle
  controlButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  button: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAgainButton: {
    backgroundColor: '#3b82f6',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#60a5fa',
    opacity: 0.5,
  },
  retryButton: {
    backgroundColor: '#374151',
    width: 60,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    tintColor: '#ffffff',
    zIndex: 1,
  },
  buttonIconPlaying: {
    tintColor: '#60a5fa',
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
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  // Feedback
  feedbackWrapper: {
    height: 70,
    justifyContent: 'center',
    marginBottom: 25,
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
  },
  // Botões de notas
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 10,
  },
  noteButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  noteButtonText: {
    color: '#ffffff',
    fontSize: 36,
  },
  // Level Up Overlay
  levelUpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  levelUpText: {
    color: '#f59e0b',
    fontSize: 56,
    textShadowColor: 'rgba(245, 158, 11, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  levelUpTextGlow: {
    textShadowColor: 'rgba(245, 158, 11, 0.8)',
    textShadowRadius: 20,
  },
  // Game Over
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverTitle: {
    color: '#ef4444',
    fontSize: 48,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 24,
    marginBottom: 15,
  },
  errorMessage: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal
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
  },
});
