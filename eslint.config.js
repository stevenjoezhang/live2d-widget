// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      quotes: ['error', 'single'],
      indent: ['error', 2],
    }
  },
  {
    ignores: [
      'src/CubismSdkForWeb-*/**',
      'dist/**',
      'build/**',
      'node_modules/**'
    ]
  }
);
