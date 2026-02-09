module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/preload.js',
    '!node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/(?!(dateformat)/)'
  ]
};
