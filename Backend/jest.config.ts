import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: { "^.+\\.tsx?$": ["ts-jest", { useESM: true }] },
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  collectCoverageFrom: ["src/**/*.ts"]
};
export default config;
