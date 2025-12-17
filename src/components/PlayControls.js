import React from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { PressableButton } from './PressableButton';
import { COLORS } from '../theme/colors';
import { SPACING, BORDER_RADIUS } from '../theme/spacing';
import { FONTS, FONT_SIZES } from '../theme/typography';

export const PlayControls = ({ 
  onPlay, 
  onRestart, 
  isPlaying, 
  progressAnim, 
  buttonWidth,
  onLayout,
}) => {
  return (
    <View style={styles.container}>
      <PressableButton
        style={styles.playButton}
        shadowColor="#1e40af"
        shadowOffset={6}
        onPress={onPlay}
        disabled={isPlaying}
        onLayout={onLayout}
      >
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
          source={require('../../assets/Media-Play-256.png')} 
          style={[styles.playIcon, isPlaying && styles.playIconActive]}
        />
        <Text style={styles.playText}>
          {isPlaying ? 'Tocando...' : 'Ouvir nota'}
        </Text>
      </PressableButton>

      <PressableButton
        style={styles.restartButton}
        shadowColor="#000000"
        shadowOffset={5}
        onPress={onRestart}
      >
        <Image 
          source={require('../../assets/Command-Reset-256.png')} 
          style={styles.restartIcon}
        />
      </PressableButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  playButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.lg + 70,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#60a5fa',
    opacity: 0.5,
  },
  playIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.text.primary,
    zIndex: 1,
  },
  playIconActive: {
    tintColor: '#60a5fa',
  },
  playText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  restartButton: {
    backgroundColor: '#374151',
    width: 60,
    padding: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  restartIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.text.primary,
  },
});
