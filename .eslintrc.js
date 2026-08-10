module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'prettier', 'plugin:prettier/recommended'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    // required for the type-aware rules below (no-floating-promises / no-misused-promises)
    project: ['./tsconfig.json', './tsconfig.test.json'],
    tsconfigRootDir: __dirname,
  },
  env: {
    jest: true,
  },
  globals: {
    browser: true,
    page: true,
  },
  plugins: ['jest'],
  rules: {
    // --- real bug protection only; formatting is left to Prettier and correctness to tsc ---
    curly: ['error', 'multi-line'],
    eqeqeq: 'error',
    'default-case': 'error',
    'guard-for-in': 'error',
    'no-case-declarations': 'error',
    'no-console': 'error',
    'no-constant-condition': 'error',
    'no-empty-pattern': 'error',
    'no-loop-func': 'error',
    'require-yield': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    // the headline reason to keep ESLint: tsc cannot catch these
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
  },
  overrides: [
    {
      // tests legitimately assert on values they have set up
      files: ['test/**/*.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
}
