import baseConfig from "../../.eslintrc";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...baseConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      // Backend-specific rules can be added here
      "no-console": "off", // Allow console in backend
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "**/*.js"],
  }
);
