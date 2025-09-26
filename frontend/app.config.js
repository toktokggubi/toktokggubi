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
    developmentClient: { silentLaunch: true },
    ios: { supportsTablet: true },
    android: {
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: false,
          category: ["BROWSABLE", "DEFAULT"],
          data: [{ scheme: "toktokggubi", host: "oauth", pathPrefix: "/kakao" }],
        },
        {
          action: "VIEW",
          autoVerify: false,
          category: ["BROWSABLE", "DEFAULT"],
          data: [{ scheme: "toktokggubi" }],
        },
      ],
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
          android: { googleServicesFile: "./google-services.json" },
          ios: { googleServicesFile: "./ios/GoogleService-Info.plist" },
        },
      ],
      // Dev Client 빌드
      "expo-dev-client",
    ],
    experiments: { typedRoutes: true },
    extra: {
      router: {},
      eas: {
        projectId: "7d72ba27-6998-452f-9ec7-631b1eda0015", // ← 이 줄 추가
      },
    },
  },
};
