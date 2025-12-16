import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
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
      <TouchableOpacity
        style={styles.playButton}
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
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.restartButton}
        onPress={onRestart}
      >
        <Image 
          source={require('../../assets/Command-Reset-256.png')} 
          style={styles.restartIcon}
        />
      </TouchableOpacity>
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
    padding: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.primary,
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
