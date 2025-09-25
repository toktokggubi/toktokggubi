module.exports = {
  expo: {
    name: "toktokggubi",
    slug: "toktokggubi",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/favicon.png",
    scheme: "toktokggubi",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/app-intro.png",
      resizeMode: "contain",
      backgroundColor: "#288CFF",
    },
    newArchEnabled: true,
    developmentClient: {
      silentLaunch: false,
    },
    ios: {
      supportsTablet: true,
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
      ],
      versionCode: 1,
      package: "com.technologia.toktokggubi",
      googleServicesFile: "./google-services.json",
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
    },
  },
};
