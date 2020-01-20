// jest.config.js
module.exports = {
    verbose: true,
    collectCoverage: true,
    coverageReporters: ["json", "html"],
    testEnvironment: "node",
    preset: 'ts-jest',
    collectCoverageFrom: [
      "src/**/*.ts"
    ]
};