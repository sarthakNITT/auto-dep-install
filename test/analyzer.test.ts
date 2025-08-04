import fs from "fs";
import path from "path";
import { analyzeFile, shouldIgnore } from "../src/analyzer";

describe("shouldIgnore", () => {
  it("should ignore files explicitly listed", () => {
    const ignored = [
      "node_modules", "dist", ".git", "App.test.tsx", ".DS_Store"
    ];
    ignored.forEach(file => {
      const filePath = path.resolve(file);
      expect(shouldIgnore(filePath)).toBe(true);
    });
  });

  it("should ignore files inside ignored directories", () => {
    const filePath = path.join(process.cwd(), "node_modules", "react", "index.js");
    expect(shouldIgnore(filePath)).toBe(true);
  });

  it("should not ignore valid source files", () => {
    const filePath = path.join(process.cwd(), "src", "components", "Button.tsx");
    expect(shouldIgnore(filePath)).toBe(false);
  });
});

describe("analyzeFile", () => {
  const tempDir = path.join(__dirname, "temp");

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const createTempFile = (fileName: string, content: string): string => {
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, content, "utf-8");
    return filePath;
  };

  it("should return external import dependencies", () => {
    const content = `
      import React from "react";
      import { View } from "react-native";
      import moment from "moment";
      import localUtil from "./utils/local";
    `;
    const filePath = createTempFile("externalImports.tsx", content);
    const result = analyzeFile(filePath);
    expect(result.sort()).toEqual(["react", "react-native", "moment"].sort());
  });

  it("should return dependencies from require calls", () => {
    const content = `
      const lodash = require("lodash");
      const fs = require("fs"); // built-in but still parsed
      const localModule = require("./localModule");
    `;
    const filePath = createTempFile("requireDeps.ts", content);
    const result = analyzeFile(filePath);
    expect(result).toEqual(expect.arrayContaining(["lodash", "fs"]));
    expect(result).not.toContain("./localModule");
  });

  it("should handle scoped packages correctly", () => {
    const content = `
      import something from "@babel/core";
      const plugin = require("@babel/plugin-transform-runtime");
    `;
    const filePath = createTempFile("scopedPackages.ts", content);
    const result = analyzeFile(filePath);
    expect(result).toEqual(expect.arrayContaining([
      "@babel/core",
      "@babel/plugin-transform-runtime"
    ]));
  });

  it("should return an empty array for ignored files", () => {
    const ignoredFile = path.join(tempDir, "node_modules", "ignored.ts");
    fs.mkdirSync(path.dirname(ignoredFile), { recursive: true });
    fs.writeFileSync(ignoredFile, `import x from "some-lib";`);
    const result = analyzeFile(ignoredFile);
    expect(result).toEqual([]);
  });

  it("should not throw on invalid code", () => {
    const content = `
      import from broken
    `;
    const filePath = createTempFile("invalidCode.ts", content);
    const result = analyzeFile(filePath);
    expect(result).toEqual([]);
  });
});
