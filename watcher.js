const chokidar = require("chokidar");
const path = require("path");
const { analyzeFile } = require("./analyzer");
const { installMissingDependencies } = require("./installer");

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
        console.log("Watching the following files:");
        console.log(watcher.getWatched());
    });

    watcher.on("change", (filePath) => {
        if (!filePath.endsWith(".js") && !filePath.endsWith(".jsx") && !filePath.endsWith(".tsx")) {
            return;
        }

        console.log(`File changed: ${filePath}`);
        const dependencies = analyzeFile(filePath);

        if (dependencies.length > 0) {
            installMissingDependencies(dependencies);
        }
    });

    watcher.on("error", (error) => {
        console.error("Chokidar Error:", error);
    });
};

module.exports = { watchFiles };
