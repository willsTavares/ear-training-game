import React from 'react';
import { View, Text, Image, ActivityIndicator, ImageBackground, StyleSheet } from 'react-native';

/**
 * Tela exibida enquanto fontes e recursos carregam.
 * Não usa fontes customizadas (ainda não estão disponíveis nesse momento).
 */
export const LoadingScreen = () => {
  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image source={require('../../assets/icon.png')} style={styles.icon} />
        <Text style={styles.title}>Ear Training Game</Text>
        <ActivityIndicator size="large" color="#fbbf24" style={styles.spinner} />
        <Text style={styles.hint}>Carregando…</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 25, 0.45)',
    paddingHorizontal: 32,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  spinner: {
    marginTop: 32,
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 12,
  },
});
