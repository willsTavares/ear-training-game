import { useRef, useCallback, useState } from 'react';
import { Animated, Easing } from 'react-native';

export const useAnimations = () => {
  // Shake animation
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Level up animations
  const levelUpAnim = useRef(new Animated.Value(0)).current;
  const levelUpOpacity = useRef(new Animated.Value(0)).current;
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  
  // Button animations
  const buttonScaleAnims = useRef({}).current;
  const correctButtonAnim = useRef(new Animated.Value(0)).current;
  const [lastCorrectButton, setLastCorrectButton] = useState(null);
  
  // Background color transition
  const [colorTransition, setColorTransition] = useState({
    from: 1,
    to: 1,
    anim: new Animated.Value(1),
  });

  const getButtonScaleAnim = useCallback((note) => {
    if (!buttonScaleAnims[note]) {
      buttonScaleAnims[note] = new Animated.Value(1);
    }
    return buttonScaleAnims[note];
  }, [buttonScaleAnims]);

  const animateButtonPress = useCallback((note) => {
    const scaleAnim = getButtonScaleAnim(note);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [getButtonScaleAnim]);

  const animateCorrectAnswer = useCallback((note) => {
    setLastCorrectButton(note);
    correctButtonAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(correctButtonAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(correctButtonAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLastCorrectButton(null);
    });
  }, [correctButtonAnim]);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: -15,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 15,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -15,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 15,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 75,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  const animateLevelUp = useCallback((newLevel) => {
    setLevelUpVisible(true);
    levelUpAnim.setValue(0);
    levelUpOpacity.setValue(0);

    const isHighLevel = newLevel >= 6;
    const duration = isHighLevel ? 1400 : 1200;

    Animated.parallel([
      Animated.sequence([
        Animated.timing(levelUpAnim, {
          toValue: 0.5,
          duration: duration * 0.35,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(levelUpAnim, {
          toValue: 1,
          duration: duration * 0.65,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(levelUpOpacity, {
          toValue: 1,
          duration: duration * 0.4,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(levelUpOpacity, {
          toValue: 0,
          duration: duration * 0.6,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setLevelUpVisible(false);
    });
  }, [levelUpAnim, levelUpOpacity]);

  const animateColorTransition = useCallback((fromLevel, toLevel) => {
    setColorTransition((current) => {
      if (toLevel === current.to) {
        return current;
      }

      if (toLevel === 1 && current.to > 1) {
        return {
          from: 1,
          to: 1,
          anim: new Animated.Value(1),
        };
      }

      const newAnim = new Animated.Value(0);
      Animated.timing(newAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start();

      return {
        from: current.to,
        to: toLevel,
        anim: newAnim,
      };
    });
  }, []);

  const resetColorTransition = useCallback(() => {
    setColorTransition({
      from: 1,
      to: 1,
      anim: new Animated.Value(1),
    });
  }, []);

  return {
    shakeAnim,
    levelUpAnim,
    levelUpOpacity,
    levelUpVisible,
    correctButtonAnim,
    lastCorrectButton,
    colorTransition,
    getButtonScaleAnim,
    animateButtonPress,
    animateCorrectAnswer,
    triggerShake,
    animateLevelUp,
    animateColorTransition,
    resetColorTransition,
  };
};
