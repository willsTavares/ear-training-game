import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export const useHaptics = () => {
  const triggerImpact = useCallback((intensity = 'Medium') => {
    try {
      const style = Haptics.ImpactFeedbackStyle[intensity];
      Haptics.impactAsync(style);
    } catch (error) {
      console.log('Haptics não disponível:', error);
    }
  }, []);

  const triggerNotification = useCallback((type = 'Success') => {
    try {
      const notifType = Haptics.NotificationFeedbackType[type];
      Haptics.notificationAsync(notifType);
    } catch (error) {
      console.log('Haptics não disponível:', error);
    }
  }, []);

  return {
    triggerImpact,
    triggerNotification,
  };
};
