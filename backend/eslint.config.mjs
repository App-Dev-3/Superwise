// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import nestjsPlugin from '@darraghor/eslint-plugin-nestjs-typed';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**', 'coverage/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  nestjsPlugin.configs.flatRecommended,
  {
    rules: {
      // Error Prevention
      '@typescript-eslint/no-explicit-any': 'warn', // Allow any but warn about it
      '@typescript-eslint/no-floating-promises': 'warn', // Important for async code
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',

      // Code Style & Quality
      'max-len': ['warn', { code: 100, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'warn',
      'no-duplicate-imports': 'error',

      // NestJS specific
      'no-useless-constructor': 'off', // NestJS uses empty constructors for DI
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  // Testing specific rules
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/test/**/*.ts'],
    rules: {
      // Relax rules that make testing difficult
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'max-len': 'off',
      '@darraghor/nestjs-typed/api-property-matches-property-optionality': 'off',
      '@darraghor/nestjs-typed/api-property-returning-array-should-set-array': 'off',
      'no-console': 'off'
    },
  },
);