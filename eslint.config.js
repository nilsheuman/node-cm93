import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        process: "readonly",
      }
    },
    overrides: [
      {
        files:  ["tests/**/*"],
        env: {
          jest: true
        }
      }
    ]
  },
  pluginJs.configs.recommended,
];
