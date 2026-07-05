import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, Image, Modal, ImageBackground, Linking, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

// Hooks
import { useGameState } from '../hooks/useGameState';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useLevelProgress } from '../hooks/useLevelProgress';
import { useHaptics } from '../hooks/useHaptics';
import { useAnimations } from '../hooks/useAnimations';

// Components
import { GameHeader } from '../components/GameHeader';
import { PlayControls } from '../components/PlayControls';
import { AnswerButtons } from '../components/AnswerButtons';
import { LevelTransition } from '../components/LevelTransition';
import { ShakeContainer } from '../components/ShakeContainer';
import { LoadingScreen } from '../components/LoadingScreen';

// Services & Theme
import { checkAnswer } from '../services/noteService';
import { getBackgroundColorByLevel, COLORS } from '../theme/colors';
import { SPACING, BORDER_RADIUS } from '../theme/spacing';
import { FONTS, FONT_SIZES } from '../theme/typography';
import { getNotesByLevel } from '../constants/levels';

export default function GameScreen() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    PressStart2P_400Regular,
  });

  const [showRestartModal, setShowRestartModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const gameOverRef = useRef();

  // Game State
  const {
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
  } = useGameState();

  // Audio
  const {
    correctNote,
    isPlaying,
    loadError,
    buttonWidth,
    progressAnim,
    playRandomNote,
    playAgain,
    onButtonLayout,
  } = useAudioPlayer(level);

  // Animations
  const {
    shakeAnim,
    levelUpAnim,
    levelUpOpacity,
    levelUpVisible,
    correctButtonAnim,
    lastCorrectButton,
    colorTransition,
    getButtonScaleAnim,
    animateButtonPress,
    animateCorrectAnswer,
    triggerShake,
    animateLevelUp,
    animateColorTransition,
    resetColorTransition,
  } = useAnimations();

  // Haptics
  const { triggerImpact } = useHaptics();

  // Level progression
  useLevelProgress(score, level, updateLevel, (newLevel) => {
    animateLevelUp(newLevel);
    triggerImpact('Medium');
    updateFeedback(`🔥 Level ${newLevel} desbloqueado!`);
    setTimeout(() => {
      updateFeedback('');
    }, 2000);
  });

  // Game over check
  useEffect(() => {
    if (lives <= 0) {
      setGameOverState(true);
    }
  }, [lives, setGameOverState]);

  // Color transition
  useEffect(() => {
    animateColorTransition(colorTransition.from, level);
  }, [level]);

  // Initial note
  useEffect(() => {
    const timer = setTimeout(() => {
      playRandomNote();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle answer
  const handleAnswer = (note) => {
    if (gameOver || !correctNote || isProcessingAnswer) return;

    // Validar se a correctNote está no nível atual (prevenir bug de sincronização)
    const currentLevelNotes = getNotesByLevel(level);
    if (!currentLevelNotes.includes(correctNote)) {
      console.warn('Nota correta não está no nível atual, ignorando resposta');
      return;
    }

    setProcessing(true);
    animateButtonPress(note);

    if (checkAnswer(note, correctNote)) {
      incrementScore();
      updateFeedback('✅ Acertou!');
      animateCorrectAnswer(note);
      
      setTimeout(() => {
        setProcessing(false);
        updateFeedback('');
        playRandomNote();
      }, 1500);
    } else {
      decrementLives();
      updateFeedback(`❌ Errou, era: ${correctNote}`);
      triggerShake();
      
      setTimeout(() => {
        setProcessing(false);
        updateFeedback('');
        if (lives - 1 > 0) {
          playRandomNote();
        }
      }, 2000);
    }
  };

  // Restart game
  const handleRestart = () => {
    setShowRestartModal(false);
    resetGame();
    resetColorTransition();
    // Nível explícito: o estado ainda não re-renderizou neste ponto
    playRandomNote(1);
  };

  // Loading state (se a fonte falhar, segue com a fonte do sistema)
  if (!fontsLoaded && !fontError) {
    return <LoadingScreen />;
  }

  // Error state
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

  // Share functionality
  const handleShare = async () => {
    try {
      setIsCapturing(true);
      
      // Wait for UI to update (hide buttons)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const uri = await captureRef(gameOverRef, {
        format: 'png',
        quality: 1,
      });
      
      setIsCapturing(false);
      
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Compartilhar resultado',
        });
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
      }
    } catch (error) {
      setIsCapturing(false);
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar');
    }
  };

  // Game over state
  if (gameOver) {
    return (
      <ImageBackground 
        source={require('../../assets/background-gameover.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.gameOverSafeArea}>
          <StatusBar barStyle="light-content" />
          
          <View 
            ref={gameOverRef} 
            style={styles.gameOverCapture}
            collapsable={false}
          >
            <ImageBackground 
              source={require('../../assets/background-gameover.png')} 
              style={styles.captureBackground}
              resizeMode="cover"
            >
              <View style={styles.gameOverContent}>
                <View style={styles.gameOverHeader}>
                  <Image 
                    source={require('../../assets/icon.png')} 
                    style={styles.gameOverIcon}
                  />
                  <Text style={styles.gameOverTitle}>GAME OVER</Text>
                </View>
                
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreLabel}>PONTUAÇÃO</Text>
                  <Text style={styles.scoreValue}>{score}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statEmoji}>🏆</Text>
                      <Text style={styles.statText}>Level {level}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.brandingContainer}>
                  <Text style={styles.brandingText}> Ear Training Game</Text>
                  <Text style={styles.brandingSubtext}>Treine seu ouvido musical!</Text>
                </View>
              </View>
            </ImageBackground>
          </View>
          
          {!isCapturing && (
            <View style={styles.gameOverActions}>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={styles.shareButtonSingle} onPress={() => handleShare()}>
                  <Image 
                    source={require('../../assets/Share-06-WF-256.png')} 
                    style={styles.shareIconImage}
                  />
                  <Text style={styles.shareButtonSingleText}>Compartilhar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.restartButtonGameOver} onPress={handleRestart}>
                  <Image 
                    source={require('../../assets/Command-Reset-256.png')} 
                    style={styles.restartButtonIcon}
                  />
                  <Text style={styles.buttonText}>Jogar Novamente</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // Background color animation
  const previousBgColor = getBackgroundColorByLevel(colorTransition.from);
  const currentBgColor = getBackgroundColorByLevel(colorTransition.to);
  
  // Se from === to, usar cor direta sem interpolação
  const bgColorStyle = colorTransition.from === colorTransition.to 
    ? { backgroundColor: currentBgColor }
    : {
        backgroundColor: colorTransition.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [previousBgColor, currentBgColor],
        }),
      };

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <ShakeContainer shakeAnim={shakeAnim}>
        <GameHeader score={score} level={level} lives={lives} />

        <View style={styles.titleContainer}>
          <Text style={styles.subtitle}>Qual nota está tocando?</Text>
        </View>

        <PlayControls
          onPlay={playAgain}
          onRestart={() => setShowRestartModal(true)}
          isPlaying={isPlaying}
          progressAnim={progressAnim}
          buttonWidth={buttonWidth}
          onLayout={onButtonLayout}
        />

        <View style={styles.feedbackWrapper}>
          {feedback !== '' && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}
        </View>

        <AnswerButtons
          level={level}
          onAnswer={handleAnswer}
          getButtonScaleAnim={getButtonScaleAnim}
          correctButtonAnim={correctButtonAnim}
          lastCorrectButton={lastCorrectButton}
        />

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
                  onPress={handleRestart}
                >
                  <Text style={styles.modalButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ShakeContainer>

        <LevelTransition
          visible={levelUpVisible}
          level={level}
          levelUpAnim={levelUpAnim}
          levelUpOpacity={levelUpOpacity}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    marginTop: SPACING.xs,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  feedbackWrapper: {
    height: 70,
    justifyContent: 'center',
    marginBottom: 25,
  },
  feedbackContainer: {
    backgroundColor: COLORS.ui.container,
    padding: SPACING.md - 1,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  feedbackText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md - 1,
  },
  errorMessage: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  gameOverSafeArea: {
    flex: 1,
  },
  gameOverCapture: {
    flex: 1,
    maxHeight: '65%',
  },
  captureBackground: {
    flex: 1,
    width: '100%',
  },
  gameOverContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  gameOverHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  gameOverIcon: {
    width: 80,
    height: 80,
    marginBottom: SPACING.sm,
    borderRadius: 16,
  },
  gameOverTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'PressStart2P_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  scoreCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xxl + 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: SPACING.xl,
  },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    letterSpacing: 3,
    marginBottom: SPACING.xs,
  },
  scoreValue: {
    color: '#FFD700',
    fontSize: 72,
    fontFamily: FONTS.bold,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statEmoji: {
    fontSize: 20,
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  brandingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontFamily: 'PressStart2P_400Regular',
  },
  brandingSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    marginTop: SPACING.xs,
  },
  gameOverActions: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
  },
  shareButtonSingle: {
    backgroundColor: '#6366F1',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  shareIconImage: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  shareButtonSingleText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  restartButtonGameOver: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finalScore: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xl - 4,
    fontFamily: FONTS.semiBold,
    marginBottom: SPACING.xxl,
  },
  restartButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  restartButtonIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.text.primary,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.ui.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: BORDER_RADIUS.lg,
    padding: 25,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.ui.border,
  },
  modalTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xl - 4,
    fontFamily: FONTS.bold,
    marginBottom: 10,
  },
  modalMessage: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md - 1,
  },
  modalButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: 25,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 110,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#374151',
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.error,
  },
  modalButtonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
});
