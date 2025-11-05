module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
  rules: {
    // Allow only barrels for features (both aliases: @ and @features)
    'import/no-internal-modules': [
      'error',
      {
        allow: ['@/features/*', '@/features/*/index', '@features/*', '@features/*/index'],
      },
    ],
    // Extra safety net to catch any deep path
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/features/*/**', '@features/*/**'],
            message: 'Import from the feature barrel (index.ts) instead of deep paths.',
          },
        ],
      },
    ],
  },
};
