module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  transformIgnorePatterns: ['node_modules/(?!(uuid|@prisma)/)'],
  collectCoverageFrom: ['src/modules/**/*.service.ts', 'src/common/**/*.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
  },
};
