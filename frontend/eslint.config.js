// eslint.config.js
// 필요 패키지: npm i -D eslint-plugin-import eslint-import-resolver-typescript
const { defineConfig } = require("eslint/config");
const expo = require("eslint-config-expo/flat");

module.exports = defineConfig([
  // Expo 기본 설정(React/TS/RN 권장 규칙 포함)
  ...expo,

  // 공통 옵션/규칙 추가
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "android/**",
      "ios/**",
      ".expo/**",
    ],

    // 플러그인 로드
    plugins: {
      import: require("eslint-plugin-import"),
    },

    // TS 경로 alias(@, ~ui, ~features 등) 해석
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },

    rules: {
      // import 정렬/그룹
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // alias 경로 못 찾으면 에러
      "import/no-unresolved": "error",

      // Hooks 규칙(Expo 설정에도 있지만 명시적으로 유지)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);
