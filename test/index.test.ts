import * as scanner from "../src/scanner";
import * as installer from "../src/installer";
import * as watcher from "../src/watcher";
import { runCLI } from "../src/index";

jest.mock("../src/scanner");
jest.mock("../src/installer");
jest.mock("../src/watcher");

const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

describe("runCLI", () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.argv = originalArgv;
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("should call install logic when --install is passed", () => {
    (scanner.scanProjectDependencies as jest.Mock).mockReturnValue(["react", "lodash"]);
    process.argv = ["node", "index.js", "--install"];

    runCLI();

    expect(scanner.scanProjectDependencies).toHaveBeenCalled();
    expect(installer.installMissingDependencies).toHaveBeenCalledWith(["react", "lodash"]);
    expect(installer.uninstallUnusedDependencies).toHaveBeenCalledWith(["react", "lodash"]);
  });

  it("should show help when --help is passed", () => {
    process.argv = ["node", "index.js", "--help"];

    runCLI();

    expect(logSpy).toHaveBeenCalledWith("Usage:");
  });

  it("should start watcher by default", () => {
    process.argv = ["node", "index.js"];

    runCLI();

    expect(watcher.watchFiles).toHaveBeenCalled();
  });
});
