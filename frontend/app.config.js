module.exports = {
  expo: {
    name: "toktokggubi",
    slug: "toktokggubi",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/favicon.png",
    scheme: "toktokggubi",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/favicon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    developmentClient: {
      silentLaunch: true,
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/favicon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.VIBRATE",
        "android.permission.WAKE_LOCK",
      ],
      versionCode: 1,
      package: "com.technologia.toktokggubi",
      googleServicesFile: "./google-services.json",

      // ✅ 추가: Google Maps API Key
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
      "expo-video",
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png",
          color: "#ffffff",
          defaultChannel: "default",
        },
      ],
      [
        "@react-native-firebase/app",
        {
          android: {
            googleServicesFile: "./google-services.json",
          },
          ios: {
            googleServicesFile: "./ios/GoogleService-Info.plist",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "7d72ba27-6998-452f-9ec7-631b1eda0015",
      },
    },
    owner: "lhyeon22",
  },
};
