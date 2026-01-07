import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astroEslint from "eslint-plugin-astro";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["*.astro"],
    ...astroEslint.configs.recommended,
  },
  {
    ignores: ["dist/", ".astro/", "node_modules/", "public/", "worker-configuration.d.ts"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
];
