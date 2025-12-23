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
      <View style={styles.centerItem}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingVertical: SPACING.md + 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    minHeight: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    opacity: 0.75,
  },
  centerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 18,
    height: 18,
    opacity: 0.85,
  },
  heartIcon: {
    width: 18,
    height: 18,
    tintColor: '#ff4757',
    opacity: 0.85,
    marginHorizontal: 1,
  },
  value: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'PressStart2P_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: 20,
  },
  label: {
    color: '#fbbf24',
    fontSize: 17,
    fontFamily: 'PressStart2P_400Regular',
    fontWeight: '700',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(251, 191, 36, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    lineHeight: 24,
  },
});
