import React from 'react';
import { Animated, StyleSheet } from 'react-native';

export const ShakeContainer = ({ shakeAnim, children }) => {
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
