jest.mock('../src/scanner', () => ({
    scanProjectDependencies: jest.fn(),
}));
    
jest.mock('../src/installer', () => ({
    installMissingDependencies: jest.fn(),
    uninstallUnusedDependencies: jest.fn(),
}));
import chokidar from "chokidar";
import { watchFiles } from "../src/watcher";
import * as installer from "../src/installer";
import * as scanner from "../src/scanner";

jest.mock("chokidar", () => {
    const onMock = jest.fn();
    const watcherMock = {
        on: jest.fn(function (event, cb) {
        if (event === "ready") cb();
        return this;
        }),
    };
  return {
    watch: jest.fn(() => watcherMock),
  };
});

describe("watchFiles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should set up watcher and trigger dependency installation on ready", () => {
    (scanner.scanProjectDependencies as jest.Mock).mockReturnValue(["fs", "path"]);
    watchFiles();

    const mockWatch = chokidar.watch as jest.Mock;
    const watcherMock = mockWatch.mock.results[0]?.value as { on: jest.Mock };

    // if results[0] is undefined, throw a clear error
    if (!watcherMock) throw new Error("Watcher mock not initialized properly");

    const mockOn = watcherMock.on;

    // Simulate "ready" event
    const readyCallback = mockOn.mock.calls.find(([event]) => event === "ready")?.[1];
    expect(readyCallback).toBeDefined();
    readyCallback();

    expect(scanner.scanProjectDependencies).toHaveBeenCalled();
    expect(installer.installMissingDependencies).toHaveBeenCalledWith(["fs", "path"]);
    expect(installer.uninstallUnusedDependencies).toHaveBeenCalledWith(["fs", "path"]);
  });
});
