import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, getBackgroundColorByLevel } from '../theme/colors';
import { SPACING, BORDER_RADIUS } from '../theme/spacing';
import { FONTS, FONT_SIZES } from '../theme/typography';

export const GameHeader = ({ score, level, lives }) => {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.value}>{score}</Text>
        <Image 
          source={require('../../assets/Shape-Star2-256.png')} 
          style={styles.iconImage}
        />
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>LEVEL {level}</Text>
      </View>
      <View style={styles.item}>
        {Array.from({ length: lives }).map((_, index) => (
          <Image
            key={index}
            source={require('../../assets/Heart-256.png')}
            style={styles.heartIcon}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.ui.container,
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    minHeight: 56,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  iconImage: {
    width: 18,
    height: 18,
    opacity: 0.9,
    marginBottom: 2,
  },
  heartIcon: {
    width: 18,
    height: 18,
    tintColor: '#ef4444',
    opacity: 0.95,
  },
  value: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontFamily: 'PressStart2P_400Regular',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    lineHeight: 20,
  },
  label: {
    color: COLORS.warning,
    fontSize: 13,
    fontFamily: 'PressStart2P_400Regular',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(245, 158, 11, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    lineHeight: 18,
  },
});
