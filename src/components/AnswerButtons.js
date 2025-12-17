import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { PressableButton } from './PressableButton';
import { getNotesByLevel } from '../constants/levels';
import { getButtonColorByLevel, COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONTS, FONT_SIZES } from '../theme/typography';

// Helper para criar cor de sombra mais escura
const getDarkenedColor = (color) => {
  // Converte hex para RGB e escurece 30%
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) * 0.7);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) * 0.7);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) * 0.7);
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
};

export const AnswerButtons = ({ 
  level,
  onAnswer,
  getButtonScaleAnim,
  correctButtonAnim,
  lastCorrectButton,
}) => {
  const notes = getNotesByLevel(level);
  const buttonColor = getButtonColorByLevel(level);

  return (
    <View style={styles.container}>
      {notes.map((note) => {
        const scaleAnim = getButtonScaleAnim(note);
        const isCorrect = lastCorrectButton === note;
        
        const currentButtonColor = isCorrect ? COLORS.success : buttonColor;
        const darkenedShadow = isCorrect ? '#059669' : getDarkenedColor(buttonColor);
        
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
            <PressableButton
              style={[
                styles.button,
                { 
                  backgroundColor: currentButtonColor, 
                },
              ]}
              shadowColor={darkenedShadow}
              shadowOffset={6}
              onPress={() => onAnswer(note)}
            >
              <Text style={styles.buttonText}>{note}</Text>
            </PressableButton>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 10,
  },
  button: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
  },
});
