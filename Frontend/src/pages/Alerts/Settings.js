// Use the TSX source as the canonical implementation.
// The repository contains both .tsx and compiled .js copies; prefer the TSX module to avoid
// possible stale/incorrect transpiled artifacts that can cause runtime errors.
export { default } from "./Settings.tsx";
