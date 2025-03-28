const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const getInstalledPackages = () => {
    try {
        const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
        return Object.keys(packageJson.dependencies || {});
    } catch (err) {
        console.error("⚠️ package.json not found. Run 'npm init -y' first.");
        return [];
    }
};

const installMissingDependencies = (dependencies) => {
    const installedPackages = getInstalledPackages();
    // Exclude local files (relative paths)
    const validPackages = dependencies.filter(pkg => !pkg.startsWith(".") && !pkg.startsWith("/"));
    const missingPackages = validPackages.filter(pkg => !installedPackages.includes(pkg));

    if (missingPackages.length === 0) {
        console.log("All dependencies are already installed.");
    } else {
        console.log(`📦 Installing missing packages: ${missingPackages.join(", ")}`);
        try {
            execSync(`npm install ${missingPackages.join(" ")}`, { stdio: "inherit" });
            console.log("Installation complete.");
        } catch (error) {
            console.error("Error installing dependencies:", error);
        }
    }
};

const uninstallUnusedDependencies = (projectDependencies) => {
    const installedPackages = getInstalledPackages();
    console.log("DEBUG: Installed packages (from package.json):", installedPackages);
    console.log("DEBUG: Project dependencies (scanned):", projectDependencies);
    // Any installed package that is not in the scanned project dependencies is considered unused.
    const unusedPackages = installedPackages.filter(pkg => !projectDependencies.includes(pkg));

    if (unusedPackages.length === 0) {
        console.log("No unused packages to uninstall.");
    } else {
        console.log(`🗑️ Uninstalling unused packages: ${unusedPackages.join(", ")}`);
        try {
            execSync(`npm uninstall ${unusedPackages.join(" ")}`, { stdio: "inherit" });
            console.log("Uninstallation complete.");
        } catch (error) {
            console.error("Error uninstalling packages:", error);
        }
    }
};

module.exports = { installMissingDependencies, uninstallUnusedDependencies };
