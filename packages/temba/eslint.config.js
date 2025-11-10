import fs from 'node:fs'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier'

const gitignorePatterns = fs
  .readFileSync('.gitignore', 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))

export default [
  {
    ignores: gitignorePatterns,
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },

  eslintConfigPrettier,
]
