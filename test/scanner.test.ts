import { scanProjectDependencies } from "../src/scanner";

jest.mock("../src/analyzer", () => ({
  analyzeFile: jest.fn(() => ["fs", "path"]),
}));

describe("scanProjectDependencies", () => {
  it("should return dependencies from files", () => {
    const deps = scanProjectDependencies();
    expect(deps).toContain("fs");
    expect(deps).toContain("path");
  });
});
