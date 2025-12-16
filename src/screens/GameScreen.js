import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Services & Theme
import { checkAnswer } from '../services/noteService';
import { getBackgroundColorByLevel, COLORS } from '../theme/colors';
import { SPACING, BORDER_RADIUS } from '../theme/spacing';
import { FONTS, FONT_SIZES } from '../theme/typography';

export default function GameScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    PressStart2P_400Regular,
  });

  const [showRestartModal, setShowRestartModal] = useState(false);

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
      console.log('Iniciando primeira nota');
      playRandomNote();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle answer
  const handleAnswer = (note) => {
    if (gameOver || !correctNote || isProcessingAnswer) return;

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
    playRandomNote();
  };

  // Loading state
  if (!fontsLoaded) {
    return null;
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

  // Game over state
  if (gameOver) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColorByLevel(1) }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>Game Over</Text>
          <Text style={styles.finalScore}>Pontuação Final: {score}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
            <Image 
              source={require('../../assets/Command-Reset-256.png')} 
              style={styles.restartButtonIcon}
            />
            <Text style={styles.buttonText}>Recomeçar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    <SafeAreaView style={[styles.container, bgColorStyle]}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl + 5,
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
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
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.huge,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.lg,
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
    width: 32,
    height: 32,
    tintColor: COLORS.text.primary,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
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
