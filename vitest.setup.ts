import "@testing-library/jest-dom/vitest";

// jsdom may not ship URL.createObjectURL; polyfill no-ops if absent.
type GlobalUrl = typeof URL & {
  createObjectURL: (b: unknown) => string;
  revokeObjectURL: (u: string) => void;
};
const G = URL as GlobalUrl;
if (typeof G.createObjectURL !== "function") {
  G.createObjectURL = () => "blob:mock";
}
if (typeof G.revokeObjectURL !== "function") {
  G.revokeObjectURL = () => undefined;
}
