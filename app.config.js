require('dotenv').config();

export default {
  expo: {
    name: "Ear Training Game",
    slug: "ear-training-game",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    owner: "willstavares13-organization",
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
      package: "com.WillsTavares.eartraininggame",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-audio"
    ],
    extra: {
      eas: {
        projectId: "4f307409-435d-483b-8821-a2b800d89d99",
        owner: "willstavares13-organization"
      }
    }
  }
};
