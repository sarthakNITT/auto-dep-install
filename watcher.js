const chokidar = require("chokidar");
const path = require("path");
const { scanProjectDependencies } = require("./scanner");
const { installMissingDependencies, uninstallUnusedDependencies } = require("./installer");

// Debounce helper to prevent too frequent executions
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const watchFiles = () => {
    console.log("Auto-Install-Deps is now running...");

    const watchPath = path.resolve("./");
    console.log(`Watching directory: ${watchPath}`);

    const watcher = chokidar.watch(watchPath, {
        ignored: /node_modules|package\.json|package-lock\.json/,
        ignoreInitial: false,
        persistent: true,
    });

    watcher.on("ready", () => {
        console.log("Initial scan complete. Watching for file changes...");
    });

    // Debounced update function that re-scans all files and installs/uninstalls dependencies.
    const updateDependencies = debounce(() => {
        const deps = scanProjectDependencies();
        installMissingDependencies(deps);
        uninstallUnusedDependencies(deps);
    }, 500);

    // Trigger update on file addition
    watcher.on("add", (filePath) => {
        if (!filePath.match(/\.(js|jsx|ts|tsx)$/)) return;
        console.log(`File added: ${filePath}`);
        updateDependencies();
    });

    // Trigger update on file change
    watcher.on("change", (filePath) => {
        if (!filePath.match(/\.(js|jsx|ts|tsx)$/)) return;
        console.log(`File changed: ${filePath}`);
        updateDependencies();
    });

    // Trigger update on file removal
    watcher.on("unlink", (filePath) => {
        console.log(`File removed: ${filePath}`);
        updateDependencies();
    });

    watcher.on("error", (error) => {
        console.error("Chokidar error:", error);
    });
};

module.exports = { watchFiles };
