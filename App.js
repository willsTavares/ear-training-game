import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import GameScreen from './src/screens/GameScreen';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
          <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 }}>
            ❌ Erro na aplicação:
          </Text>
          <Text style={{ color: '#ff6b6b', fontSize: 12, marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
            {this.state.error?.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    // Log para verificar se App está carregando
    console.log('App iniciado');
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GameScreen />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
