import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.svelte-kit/**",
      "**/coverage/**",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...svelte.configs["flat/recommended"],

  {
    files: ["**/*.{ts,tsx,svelte}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      semi: ["error", "always"],
    },
  },
];
