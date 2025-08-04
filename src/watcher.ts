import chokidar from "chokidar"
import path from "path"
import { scanProjectDependencies } from "./scanner.js"
import { installMissingDependencies, uninstallUnusedDependencies } from "./installer.js"

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>; 
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    }
}

let hasStarted = false;

export const watchFiles = () => {

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
    //         initialRun = false;  
    //         const deps = scanProjectDependencies();
    //         installMissingDependencies(deps);  // Only install missing dependencies, NOT update existing ones
    //     }
    // });
    watcher.on("ready", () => {
        console.log("Initial scan complete. Watching for file changes...");
        
        if (!hasStarted) {
            hasStarted = true;  
            const deps = scanProjectDependencies() as string[];
            installMissingDependencies(deps);
            uninstallUnusedDependencies(deps);
        }
    });    

    const updateDependencies = debounce((filePath: string) => {
        const deps = scanProjectDependencies() as string[];
        // if it’s a .ts or .tsx file, pass true so installer can add @types/…
        const isTs = /\.tsx?$/.test(filePath);
        installMissingDependencies(deps, isTs);
        uninstallUnusedDependencies(deps);
    }, 500);

    watcher.on("add", (filePath) => {
        if (!filePath.match(/\.(js|jsx|ts|tsx)$/)) return;
        console.log(`File added: ${filePath}`);
        updateDependencies(filePath);
    });

    watcher.on("change", (filePath) => {
        if (!filePath.match(/\.(js|jsx|ts|tsx)$/)) return;
        console.log(`File changed: ${filePath}`);
        updateDependencies(filePath);
    });

    watcher.on("unlink", (filePath) => {
        console.log(`File removed: ${filePath}`);
        updateDependencies(filePath);
    });

    watcher.on("error", (error) => {
        console.error("Chokidar error:", error);
    });
};