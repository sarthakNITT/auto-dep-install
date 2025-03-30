const fs = require("fs");
const path = require("path");
const { analyzeFile } = require("./analyzer");

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
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

function scanProjectDependencies() {
    console.log("Scanning all files for dependencies...");
    const projectFiles = getAllFiles(path.resolve("./"));
    const dependenciesSet = new Set();

    projectFiles.forEach(file => {
        console.log(`Analyzing ${file}...`);
        const deps = analyzeFile(file);
        deps.forEach(dep => dependenciesSet.add(dep));
    });

    return [...dependenciesSet];
}

module.exports = { scanProjectDependencies };
