module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./src", // src 루트
            "~ui": "./src/shared/ui", // UI 컴포넌트
            "~features": "./src/features", // 도메인 기능
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
