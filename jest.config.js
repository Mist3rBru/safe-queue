module.exports = {
  bail: true,
  clearMocks: true,
  collectCoverage: false,
  maxWorkers: 1,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  }
}
