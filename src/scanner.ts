import fs from "fs";
import path from "path";
import { analyzeFile } from "./analyzer"

export function getAllFiles(dir: string, fileList: string[] = []): string[] {
    // *****----->>>>>OLD CODE<<<<<-----*****
    // const files = fs.readdirSync(dir);
    const files = fs.readdirSync(dir) || []; 
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== "node_modules") {
                getAllFiles(fullPath, fileList);
            }
        } else {
            if (fullPath.match(/\.(js|jsx|ts|tsx)$/)) {
                fileList.push(fullPath);
            }
        }
    });
    return fileList;
}

export function scanProjectDependencies() {
    console.log("Scanning all files for dependencies...");
    const projectFiles = getAllFiles(path.resolve("./"));
    const dependenciesSet = new Set();

    projectFiles.forEach(file => {
        console.log(`Analyzing ${file}...`);
        const deps = analyzeFile(file);
        console.log(`Dependencies found in ${file}:`, deps);
        deps.forEach(dep => dependenciesSet.add(dep));
    });
    console.log("Final dependencies:", [...dependenciesSet]); 
    return [...dependenciesSet];
}