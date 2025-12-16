import React from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../theme/colors';
import { FONTS, FONT_SIZES } from '../theme/typography';

export const LevelTransition = ({ 
  visible, 
  level,
  levelUpAnim,
  levelUpOpacity,
}) => {
  if (!visible) return null;

  const isHighLevel = level >= 6;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: levelUpOpacity,
          backgroundColor: levelUpOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [
              'rgba(0, 0, 0, 0)', 
              isHighLevel ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)'
            ],
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
                outputRange: [0.85, isHighLevel ? 1.2 : 1.15, 1],
              }),
            },
          ],
        }}
      >
        <Text 
          style={[
            styles.text,
            isHighLevel && styles.textGlow,
          ]}
        >
          LEVEL {level}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.massive,
    fontFamily: FONTS.bold,
    textShadowColor: 'rgba(245, 158, 11, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  textGlow: {
    textShadowColor: 'rgba(245, 158, 11, 0.8)',
    textShadowRadius: 20,
  },
});
