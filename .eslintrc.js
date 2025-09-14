module.exports = {
  root: true,
  extends: ['expo', '@react-native', '@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-native/no-inline-styles': 'warn',
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/'],
};
