import path from "path";
import fs from "fs";
import { execSync } from "child_process";

// *****----->>>>>OLD CODE<<<<<-----*****
// const getInstalledPackages = () => {
//     try {
//         const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
//         console.log("Installed dependencies from package.json:", packageJson.dependencies);
//         // return Object.keys(packageJson.dependencies || {}); // Convert to array
//         return packageJson.dependencies || {};
//     } catch (err) {
//         console.error("package.json not found. Run 'npm init -y' first.");
//         return [];
//     }
// };
export const getInstalledPackages = (): Record<string, string> => {
    try {
        const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
        console.log("Installed dependencies from package.json:", packageJson.dependencies);
        // *****----->>>>>OLD CODE<<<<<-----*****
        // return Object.keys(packageJson.dependencies || {}); // Convert dependencies object to an array
        return packageJson.dependencies || {};
    } catch (err) {
        console.error("package.json not found. Run 'npm init -y' first.");
        return {};
    }
};

export const getLatestVersion = (pkg: string): string | null => {
    try {
        return execSync(`npm show ${pkg} version`).toString().trim();
    } catch (error: any) {
        console.error(`Error fetching latest version for ${pkg}:`, error.message);
        return null;
    }
};

export const findCompatibleVersion = (pkg: string): string | null => {
    try {
        const installedPackages = JSON.parse(fs.readFileSync("package.json", "utf-8")).dependencies;
        // *****----->>>>>OLD CODE<<<<<-----*****
        // const peerDependency = execSync(`npm show ${pkg} peerDependencies --json`).toString().trim();
        const peerDependencyOutput = execSync(`npm show ${pkg} peerDependencies --json`).toString().trim();

        if (!peerDependencyOutput || peerDependencyOutput === "{}") {
            console.log(`No peer dependencies found for ${pkg}.`);
            return null;
        }

        if (!peerDependencyOutput) {
            console.log(`No peer dependencies found for ${pkg}.`);
            return null;
        }

        const peerDepName = Object.keys(JSON.parse(peerDependencyOutput))[0] || "";  
        const installedPeerVersion = installedPackages[peerDepName];

        if (!installedPeerVersion) {
            console.log(`Required peer dependency ${peerDepName} is not installed.`);
            return null;
        }

        console.log(`Searching for a version of ${pkg} that works with ${peerDepName}@${installedPeerVersion}`);

        const availableVersions = JSON.parse(execSync(`npm show ${pkg} versions --json`).toString().trim());

        for (let version of availableVersions.reverse()) {
            // *****----->>>>>OLD CODE<<<<<-----*****
            // const peerDepsForVersion = execSync(`npm show ${pkg}@${version} peerDependencies --json`).toString().trim();
            try {
                const peerDepsForVersionOutput = execSync(`npm show ${pkg}@${version} peerDependencies --json`).toString().trim();
                if (peerDepsForVersionOutput && peerDepsForVersionOutput !== "{}") {
                    const parsedPeerDeps = JSON.parse(peerDepsForVersionOutput);
                    if (parsedPeerDeps[peerDepName] && parsedPeerDeps[peerDepName].includes(installedPeerVersion)) {
                        return version;
                    }
                }
            } catch (error) {
                console.warn(`Skipping ${pkg}@${version} due to an error fetching peer dependencies.`);
            }
                        
            // if (peerDepsForVersion) {
            //     const parsedPeerDeps = JSON.parse(peerDepsForVersion);
            //     if (parsedPeerDeps[peerDepName] && parsedPeerDeps[peerDepName].includes(installedPeerVersion)) {
            //         return version;
            //     }
            // }
        }

        return null;
    } catch (error) {
        console.error(`Error fetching compatible versions for ${pkg}:`, error);
        return null;
    }
};

export const installMissingDependencies = (dependencies: string[], isTs: boolean = false): void => {
    const installedPackages: Record<string, string> = getInstalledPackages();
    const validPackages = dependencies.filter(pkg => !pkg.startsWith(".") && !pkg.startsWith("/"));
    // *****----->>>>>OLD CODE<<<<<-----*****
    // const missingPackages = validPackages.filter(pkg => !installedPackages.includes(pkg));
    const missingPackages = validPackages.filter(pkg => !Object.keys(installedPackages).includes(pkg));
    
    // *****----->>>>>OLD CODE<<<<<-----*****
    // const outdatedPackages = validPackages.filter(pkg => {
    //     if (installedPackages.includes(pkg)) {
    //         const latestVersion = getLatestVersion(pkg);
    //         return latestVersion && latestVersion !== installedPackages[pkg];
    //     }
    //     return false;
    // });
    const outdatedPackages = validPackages.filter(pkg => {
        if (installedPackages[pkg]) {  // Check version properly
            const latestVersion = getLatestVersion(pkg);
            return latestVersion && latestVersion !== installedPackages[pkg];
        }
        return false;
    });    

    if (missingPackages.length === 0 && outdatedPackages.length === 0) {
        console.log("All dependencies are already installed and up to date.");
    } else {
        // *****----->>>>>OLD CODE<<<<<-----*****
        // if (missingPackages.length > 0) {
        //     console.log(`Installing missing packages: ${missingPackages.join(", ")}`);
        //     try {
        //         execSync(`npm install ${missingPackages.join(" ")}`, { stdio: "inherit" });
        //         console.log("Installation complete.");
        //     } catch (error) {
        //         console.error("Error installing dependencies:", error);
        //     }
        // }

        // collect @types/... for TS context
        const devDeps: string[] = [];
        if (isTs) {
          for (let pkg of missingPackages) {
            const typesPkg = `@types/${pkg}`;
            try {
              execSync(`npm show ${typesPkg} version`, { stdio: "ignore" });
              devDeps.push(typesPkg);
            } catch { /* skip if not found */ }
          }
        }
        if (missingPackages.length > 0) {
            console.log(`Installing missing packages: ${missingPackages.join(", ")}`);
            missingPackages.forEach(pkg => {
                try {
                    execSync(`npm install ${pkg}`, { stdio: "inherit" });
                    console.log(`Successfully installed ${pkg}`);
                } catch (error: any) {
                    if (error.message.includes("could not resolve dependency")) {
                        console.warn(`Peer dependency conflict detected for ${pkg}. Finding a compatible version...`);
                        const compatibleVersion = findCompatibleVersion(pkg);
                        if (compatibleVersion) {
                            console.log(`Installing compatible version: ${pkg}@${compatibleVersion}`);
                            try {
                                execSync(`npm install ${pkg}@${compatibleVersion}`, { stdio: "inherit" });
                                console.log(`Successfully installed compatible version: ${pkg}@${compatibleVersion}`);
                            } catch (error) {
                                console.error(`Failed to install ${pkg}@${compatibleVersion}. Skipping.`);
                            }
                        } else {
                            console.error(`No compatible version found for ${pkg}. Skipping installation.`);
                        }
                    } else {
                        console.warn(`Installation of ${pkg} failed. Retrying with --legacy-peer-deps...`);
                        try {
                            execSync(`npm install ${pkg} --legacy-peer-deps`, { stdio: "inherit" });
                            console.log(`Successfully installed ${pkg} with --legacy-peer-deps`);
                        } catch (error) {
                            console.error(`Installation failed for ${pkg} even with --legacy-peer-deps.`, error);
                        }
                    }
                }                
            })
            // now install any collected types
            if (devDeps.length) {
                console.log(`Installing types: ${devDeps.join(", ")}`);
                execSync(`npm install --save-dev ${devDeps.join(" ")}`, { stdio: "inherit" });
            }
        }        

        if (outdatedPackages.length > 0) {
            console.log(`Updating outdated packages: ${outdatedPackages.join(", ")}`);
            try {
                execSync(`npm install ${outdatedPackages.map(pkg => `${pkg}@latest`).join(" ")}`, { stdio: "inherit" });
                console.log("Update complete.");
            } catch (error) {
                console.error("Error updating dependencies:", error);
            }
        }
    }
};

export const uninstallUnusedDependencies = (projectDependencies: string[]): void => {
    // *****----->>>>>OLD CODE<<<<<-----*****
    // const installedPackages = getInstalledPackages();
    // const unusedPackages = installedPackages.filter(pkg => !projectDependencies.includes(pkg));
    const installedPackages = Object.keys(getInstalledPackages()); 
    const unusedPackages = installedPackages.filter(pkg => !projectDependencies.includes(pkg));


    if (unusedPackages.length === 0) {
        console.log("No unused packages to uninstall.");
    } else {
        console.log(`Uninstalling unused packages: ${unusedPackages.join(", ")}`);
        try {
            execSync(`npm uninstall ${unusedPackages.join(" ")}`, { stdio: "inherit" });
            console.log("Uninstallation complete.");
        } catch (error) {
            console.error("Error uninstalling packages:", error);
        }
    }
};