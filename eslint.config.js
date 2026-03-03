import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsdoc': jsdoc,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // --- Code Quality Rules (Per CODE_QUALITY_STANDARDS.md) ---
      'complexity': ['error', 15],
      'max-lines-per-function': ['error', { "max": 500, "skipBlankLines": true, "skipComments": true }],
      'max-depth': ['error', 4],
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }], // Allow info for now as DebugLogger uses it, but in general code should use DebugLogger
      
      // --- JSDoc Rules ---
      'jsdoc/require-jsdoc': ['error', {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: true
        }
      }]
    },
  },
);
