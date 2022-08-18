/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  clearMocks: true,
  coverageProvider: "v8",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  preset: "ts-jest",
  setupFiles: ["dotenv/config"],
  globalSetup: "<rootDir>/__tests__/setup.ts",
  globalTeardown: "<rootDir>/__tests__/teardown.ts",
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).ts"],
  testPathIgnorePatterns: ["/node_modules/", ".d.ts", ".js"],
};
