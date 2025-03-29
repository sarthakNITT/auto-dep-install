const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const getInstalledPackages = () => {
    try {
        const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
        console.log("🔍 Installed dependencies from package.json:", packageJson.dependencies);
        return Object.keys(packageJson.dependencies || {}); // Convert to array
    } catch (err) {
        console.error("⚠️ package.json not found. Run 'npm init -y' first.");
        return [];
    }
};



const getLatestVersion = (pkg) => {
    try {
        return execSync(`npm show ${pkg} version`).toString().trim();
    } catch (error) {
        console.error(`Error fetching latest version for ${pkg}:`, error.message);
        return null;
    }
};

const installMissingDependencies = (dependencies) => {
    const installedPackages = getInstalledPackages();
    const validPackages = dependencies.filter(pkg => !pkg.startsWith(".") && !pkg.startsWith("/"));
    const missingPackages = validPackages.filter(pkg => !installedPackages.includes(pkg));
    const outdatedPackages = validPackages.filter(pkg => {
        if (installedPackages.includes(pkg)) {
            const latestVersion = getLatestVersion(pkg);
            return latestVersion && latestVersion !== installedPackages[pkg];
        }
        return false;
    });

    if (missingPackages.length === 0 && outdatedPackages.length === 0) {
        console.log("All dependencies are already installed and up to date.");
    } else {
        if (missingPackages.length > 0) {
            console.log(`📦 Installing missing packages: ${missingPackages.join(", ")}`);
            try {
                execSync(`npm install ${missingPackages.join(" ")}`, { stdio: "inherit" });
                console.log("Installation complete.");
            } catch (error) {
                console.error("Error installing dependencies:", error);
            }
        }

        if (outdatedPackages.length > 0) {
            console.log(`🔄 Updating outdated packages: ${outdatedPackages.join(", ")}`);
            try {
                execSync(`npm install ${outdatedPackages.map(pkg => `${pkg}@latest`).join(" ")}`, { stdio: "inherit" });
                console.log("Update complete.");
            } catch (error) {
                console.error("Error updating dependencies:", error);
            }
        }
    }
};

const uninstallUnusedDependencies = (projectDependencies) => {
    const installedPackages = getInstalledPackages();
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
