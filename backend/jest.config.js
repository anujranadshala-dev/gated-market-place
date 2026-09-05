export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['controllers/**/*.ts', 'models/**/*.ts', 'utils/**/*.ts'],
  coverageDirectory: 'coverage',
  verbose: true,
};
