require('dotenv').config();

export default {
  expo: {
    name: "Ear Training Game",
    slug: "ear-training-game",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1a1a2e"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1a1a2e"
      },
      package: "com.WillsTavares.eartraininggame",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-audio",
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: process.env.GOOGLE_ADMOB_APP_ID,
          iosAppId: process.env.GOOGLE_ADMOB_APP_ID
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "b375cc78-eadc-434c-9fb0-5c6b6153577c"
      }
    },
    "react-native-google-mobile-ads": {
      android_app_id: process.env.GOOGLE_ADMOB_APP_ID,
      ios_app_id: process.env.GOOGLE_ADMOB_APP_ID
    }
  }
};
