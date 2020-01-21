module.exports = {
  semi: true,
  useTabs: false,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  bracketSpacing: true,
  jsxBracketSameLine: true,
  parser: 'babel',
  overrides: [
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
  ],
};
