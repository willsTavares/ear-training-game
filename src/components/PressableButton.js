import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';

/**
 * Botão com efeito 3D tátil - simula uma sensação física ao pressionar
 */
export const PressableButton = ({ 
  children, 
  style, 
  onPress, 
  disabled,
  shadowColor,
  shadowOffset = 4,
  onLayout,
  ...props 
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const shadowOpacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: shadowOffset,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  // Extrair borderRadius do estilo (pode ser array ou objeto)
  const getBorderRadius = () => {
    if (!style) return 0;
    if (Array.isArray(style)) {
      // Procurar borderRadius em todos os objetos do array
      for (let i = style.length - 1; i >= 0; i--) {
        if (style[i]?.borderRadius !== undefined) {
          return style[i].borderRadius;
        }
      }
      return 0;
    }
    return style.borderRadius || 0;
  };

  // Criar estilo da sombra animada
  const shadowStyle = {
    position: 'absolute',
    top: shadowOffset,
    left: 0,
    right: 0,
    bottom: -shadowOffset,
    backgroundColor: shadowColor || '#000',
    borderRadius: getBorderRadius(),
    opacity: shadowOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
    }),
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
      onLayout={onLayout}
    >
      {/* Sombra do botão */}
      <Animated.View style={shadowStyle} />
      
      {/* Botão principal */}
      <TouchableOpacity
        style={[styles.button, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.9}
        disabled={disabled}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    position: 'relative',
    zIndex: 1,
  },
});
