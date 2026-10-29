import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import pluginReact from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

/**
 * ESLint plugin packages expose some configs through index signatures, so
 * their values are typed as possibly `undefined`. Fail fast with a useful
 * message instead of silently extending an invalid config.
 */
function requireConfig<T>(config: T | undefined, name: string): T {
  if (config === undefined) {
    throw new Error(`ESLint configuration "${name}" is not available.`);
  }

  return config;
}

const reactHooksRecommended = requireConfig(
  reactHooks.configs['recommended-latest'],
  'react-hooks/recommended-latest',
);
const reactRefreshVite = requireConfig(
  reactRefresh.configs.vite,
  'react-refresh/vite',
);
const reactRecommended = requireConfig(
  pluginReact.configs.flat['recommended'],
  'react/recommended',
);

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooksRecommended,
      reactRefreshVite,
      reactRecommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]' },
      ],
      // TypeScript already validates props; prop-types would duplicate it.
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      semi: ['error', 'always'],
    },
  },
]);
