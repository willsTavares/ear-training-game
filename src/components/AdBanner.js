import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { GOOGLE_ADMOB_BANNER_ID } from '@env';

export const AdBanner = () => {
  // Use test ID em desenvolvimento, production ID em produção
  const adUnitId = __DEV__ 
    ? TestIds.BANNER 
    : GOOGLE_ADMOB_BANNER_ID || TestIds.BANNER;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});
