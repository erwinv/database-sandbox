module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  globalSetup: "<rootDir>/test/globalSetup.js",
  globalTeardown: "<rootDir>/test/globalTeardown.js",
  rootDir: "out",
  setupFiles: [
    "<rootDir>/test/setup.js"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/test/setupAfterEnv.js"
  ],
  testEnvironment: "jest-environment-node",
  verbose: true
};
