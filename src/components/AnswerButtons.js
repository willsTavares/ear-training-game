import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { getNotesByLevel } from '../constants/levels';
import { getButtonColorByLevel, COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONTS, FONT_SIZES } from '../theme/typography';

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
                styles.button,
                { 
                  backgroundColor: buttonColor, 
                  shadowColor: buttonColor,
                },
                isCorrect && {
                  backgroundColor: COLORS.success,
                  shadowColor: COLORS.success,
                },
              ]}
              onPress={() => onAnswer(note)}
            >
              <Text style={styles.buttonText}>{note}</Text>
            </TouchableOpacity>
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
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
  },
});
