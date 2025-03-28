const { watchFiles } = require("./watcher");
const { analyzeFile } = require("./analyzer");
const { installMissingDependencies } = require("./installer");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

if (args.includes("--install")) {
    console.log("🔍 Scanning all files for dependencies...");
    
    const files = fs.readdirSync(path.resolve("./")).filter(file => file.endsWith(".js"));
    
    let dependencies = new Set();
    files.forEach(file => {
        console.log(`📄 Analyzing ${file}...`);
        const parsed = analyzeFile(file);
        parsedDependencies.forEach(dep => dependencies.add(dep));
    });

    installMissingDependencies([...dependencies]); 
} else {
    console.log("Auto-Install-Deps is now running...");
    watchFiles(); 
}
