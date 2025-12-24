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
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#1a1a2e"
      },
      package: "com.WillsTavares.eartraininggame"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-audio"
    ],
    extra: {
      eas: {
        projectId: "b375cc78-eadc-434c-9fb0-5c6b6153577c"
      }
    }
  }
};
