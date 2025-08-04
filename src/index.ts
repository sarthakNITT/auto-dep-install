#!/usr/bin/env node

import { watchFiles } from "./watcher.js"
import { installMissingDependencies, uninstallUnusedDependencies } from "./installer.js"
import { scanProjectDependencies } from "./scanner.js"

export function runCLI() {
    const args = process.argv.slice(2);

    if (args.includes("--install")) {
        const projectDependencies = scanProjectDependencies() as string[];
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