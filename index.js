#!/usr/bin/env node
const { watchFiles } = require("./watcher");
const { installMissingDependencies, uninstallUnusedDependencies } = require("./installer");
const { scanProjectDependencies } = require("./scanner");

const args = process.argv.slice(2);

if (args.includes("--install")) {
    const projectDependencies = scanProjectDependencies();
    installMissingDependencies(projectDependencies);
    uninstallUnusedDependencies(projectDependencies);
} else {
    console.log("Auto-Install-Deps is now running...");
    watchFiles();
}
