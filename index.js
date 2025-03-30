#!/usr/bin/env node
const { watchFiles } = require("./watcher");
const { installMissingDependencies, uninstallUnusedDependencies } = require("./installer");
const { scanProjectDependencies } = require("./scanner");

function runCLI() {
    const args = process.argv.slice(2);

    if (args.includes("--install")) {
        const projectDependencies = scanProjectDependencies();
        console.log("Scanned project dependencies:", projectDependencies);
        installMissingDependencies(projectDependencies);
        uninstallUnusedDependencies(projectDependencies);
    } else if (args.includes("--help")) {
        console.log("Usage:");
        console.log("  auto-install # Starts watching for file changes");
        console.log("  auto-install --install # Installs missing dependencies and removes unused ones");
    } else {
        console.log("Auto-Install-Deps is now running...");
        watchFiles();
    }
}

if (require.main === module) {
    runCLI();
}

module.exports = { runCLI };
