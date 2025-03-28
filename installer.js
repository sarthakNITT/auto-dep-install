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
    const missingPackages = dependencies.filter((pkg) => !installedPackages.includes(pkg));

    if (missingPackages.length === 0) {
        console.log("✅ All dependencies are already installed.");
        return;
    }

    console.log(`📦 Installing missing packages: ${missingPackages.join(", ")}`);
    try {
        execSync(`npm install ${missingPackages.join(" ")}`, { stdio: "inherit" });
        console.log("✅ Installation complete.");
    } catch (error) {
        console.error("❌ Error installing dependencies:", error);
    }
};

module.exports = { installMissingDependencies };
