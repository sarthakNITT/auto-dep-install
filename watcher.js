const chokidar = require("chokidar");
const path = require("path");
const { scanProjectDependencies } = require("./scanner");
const { installMissingDependencies, uninstallUnusedDependencies } = require("./installer");

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

let hasStarted = false;

const watchFiles = () => {

    if (hasStarted) return;
    hasStarted = true;  

    console.log("Auto-Install-Deps is now running...");

    const watchPath = path.resolve("./");
    console.log(`Watching directory: ${watchPath}`);

    const watcher = chokidar.watch(watchPath, {
        ignored: /node_modules|package\.json|package-lock\.json/,
        ignoreInitial: false,
        persistent: true,
    });

    let initialRun = true;

    // *****----->>>>>OLD CODE<<<<<-----*****
    // watcher.on("ready", () => {
    //     console.log("Initial scan complete. Watching for file changes...");
    //     if (initialRun) {
    //         initialRun = false;  // 👈 Mark that the first run is done
    //         const deps = scanProjectDependencies();
    //         installMissingDependencies(deps);  // Only install missing dependencies, NOT update existing ones
    //     }
    // });
    watcher.on("ready", () => {
        console.log("Initial scan complete. Watching for file changes...");
        
        if (!hasStarted) {
            hasStarted = true;  // Ensure it runs only once
            const deps = scanProjectDependencies();
            installMissingDependencies(deps);
            uninstallUnusedDependencies(deps);
        }
    });    

    const updateDependencies = debounce(() => {
        const deps = scanProjectDependencies();
        installMissingDependencies(deps);
        uninstallUnusedDependencies(deps);
    }, 500);

    watcher.on("add", (filePath) => {
        if (!filePath.match(/\.(js|jsx|ts|tsx)$/)) return;
        console.log(`File added: ${filePath}`);
        updateDependencies();
    });

    watcher.on("change", (filePath) => {
        if (!filePath.match(/\.(js|jsx|ts|tsx)$/)) return;
        console.log(`File changed: ${filePath}`);
        updateDependencies();
    });

    watcher.on("unlink", (filePath) => {
        console.log(`File removed: ${filePath}`);
        updateDependencies();
    });

    watcher.on("error", (error) => {
        console.error("Chokidar error:", error);
    });
};

module.exports = { watchFiles };
