/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  clearMocks: true,
  coverageProvider: "v8",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  testPathIgnorePatterns: ["/node_modules/", ".d.ts", ".js"],
};
