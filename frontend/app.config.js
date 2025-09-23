// app.config.js
module.exports = {
  expo: {
    name: "toktokggubi",
    slug: "toktokggubi",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/favicon.png",
    scheme: "frontend",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    developmentClient: { silentLaunch: true },

    ios: { supportsTablet: true },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/favicon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      versionCode: 1,
      package: "com.technologia.toktokggubi",
      googleServicesFile: "./google-services.json",

      // ✅ Google Maps API 키를 Manifest에 주입
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY,
        },
      },
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      "expo-font",
      "expo-location",
      "expo-video",              // ⬅️ 여기에 쉼표 필수!
      [
        "@react-native-firebase/app",
        {
          android: { googleServicesFile: "./google-services.json" },
          ios: { googleServicesFile: "./ios/GoogleService-Info.plist" },
        },
      ],
    ],

    experiments: { typedRoutes: true },

    extra: {
      router: {},
      eas: { projectId: "7d72ba27-6998-452f-9ec7-631b1eda0015" },
    },

    owner: "lhyeon22",
  },
};
