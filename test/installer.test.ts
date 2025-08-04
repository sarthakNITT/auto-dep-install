import fs from "fs";
import { execSync } from "child_process";
import * as installer from "../src/installer";

jest.mock("fs");
jest.mock("child_process");

const mockReadFileSync = fs.readFileSync as jest.Mock;
const mockExecSync = execSync as jest.Mock;

describe("installer.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getInstalledPackages", () => {
    it("should return dependencies from package.json", () => {
      mockReadFileSync.mockReturnValueOnce(
        JSON.stringify({ dependencies: { react: "^18.0.0" } })
      );

      const result = installer.getInstalledPackages();
      expect(result).toEqual({ react: "^18.0.0" });
    });

    it("should return empty object if package.json not found", () => {
      mockReadFileSync.mockImplementationOnce(() => {
        throw new Error("File not found");
      });

      const result = installer.getInstalledPackages();
      expect(result).toEqual({});
    });
  });

  describe("getLatestVersion", () => {
    it("should return latest version string", () => {
      mockExecSync.mockReturnValueOnce("2.0.0\n");
      const version = installer.getLatestVersion("lodash");
      expect(version).toBe("2.0.0");
    });

    it("should return null on error", () => {
      mockExecSync.mockImplementationOnce(() => {
        throw new Error("error");
      });
      const version = installer.getLatestVersion("badpkg");
      expect(version).toBeNull();
    });
  });

  describe("findCompatibleVersion", () => {
    it("should return null if no peer deps", () => {
      mockReadFileSync.mockReturnValueOnce(
        JSON.stringify({ dependencies: { "react": "^18.0.0" } })
      );
      mockExecSync.mockReturnValueOnce("{}");

      const result = installer.findCompatibleVersion("somepkg");
      expect(result).toBeNull();
    });

    it("should return compatible version if found", () => {
      mockReadFileSync.mockReturnValueOnce(
        JSON.stringify({ dependencies: { react: "^18.0.0" } })
      );
      mockExecSync
        .mockReturnValueOnce(JSON.stringify({ react: "^18.0.0" })) // initial peerDeps
        .mockReturnValueOnce(JSON.stringify(["1.0.0", "1.1.0"])) // available versions
        .mockReturnValueOnce(JSON.stringify({ react: "^18.0.0" })); // peerDeps for version

      const result = installer.findCompatibleVersion("somepkg");
      expect(result).toBe("1.1.0");
    });
  });

  describe("installMissingDependencies", () => {
    it("should skip install if everything is up to date", () => {
      jest.spyOn(installer, "getInstalledPackages").mockReturnValue({
        lodash: "4.17.21"
      });
      jest.spyOn(installer, "getLatestVersion").mockReturnValue("4.17.21");

      installer.installMissingDependencies(["lodash"]);
      expect(mockExecSync).not.toHaveBeenCalled();
    });

    it("should attempt install if missing or outdated", () => {
      jest.spyOn(installer, "getInstalledPackages").mockReturnValue({});
      jest.spyOn(installer, "getLatestVersion").mockReturnValue("4.17.21");

      mockExecSync.mockImplementation(() => {});
      installer.installMissingDependencies(["lodash"]);

      expect(mockExecSync).toHaveBeenCalledWith(
        "npm install lodash",
        expect.any(Object)
      );
    });
  });

  describe("uninstallUnusedDependencies", () => {
    it("should uninstall unused deps", () => {
      jest.spyOn(installer, "getInstalledPackages").mockReturnValue({
        react: "^18.0.0",
        unused: "^1.0.0",
      });

      mockExecSync.mockImplementation(() => {});
      installer.uninstallUnusedDependencies(["react"]);

      expect(mockExecSync).toHaveBeenCalledWith(
        "npm uninstall unused",
        expect.any(Object)
      );
    });

    it("should skip if no unused packages", () => {
      jest.spyOn(installer, "getInstalledPackages").mockReturnValue({
        react: "^18.0.0",
      });

      installer.uninstallUnusedDependencies(["react"]);
      expect(mockExecSync).not.toHaveBeenCalled();
    });
  });
});
