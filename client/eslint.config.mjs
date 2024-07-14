import globals from "globals";

// Define an empty configuration to disable all rules for JS files
const disableAllRulesJS = {
  files: ["**/*.{js,mjs,cjs,jsx}"],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
    sourceType: "module", // Corrected to use ES modules for modern JavaScript
    globals: { ...globals.browser, ...globals.node },
  },
};

// Configuration for TypeScript files
const disableAllRulesTS = {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2018, // Adjust based on your project's needs
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    plugins: ["@typescript-eslint"],
    rules: {}, // Empty rules object to disable all TypeScript rules
  },
};

// Combine all configurations
export default [disableAllRulesJS, disableAllRulesTS];
