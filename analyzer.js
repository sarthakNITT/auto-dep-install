const acorn = require("acorn");
const fs = require("fs");

function analyzeFile(filePath) {
    try {
        const code = fs.readFileSync(filePath, "utf-8");

        const parsed = acorn.parse(code, { 
            ecmaVersion: "latest", 
            sourceType: "module" // Change to 'module' for ES6 support
        });

        const dependencies = [];

        parsed.body.forEach((node) => {
            // Detect CommonJS require()
            if (node.type === "VariableDeclaration") {
                node.declarations.forEach((declaration) => {
                    if (
                        declaration.init &&
                        declaration.init.type === "CallExpression" &&
                        declaration.init.callee.name === "require"
                    ) {
                        dependencies.push(declaration.init.arguments[0].value);
                    }
                });
            }

            // Detect ES6 import statements
            if (node.type === "ImportDeclaration") {
                dependencies.push(node.source.value);
            }
        });

        console.log("Dependencies found:", dependencies);
        return dependencies;
    } catch (error) {
        console.error("Parsing error:", error.message);
        return [];
    }
}

module.exports = { analyzeFile };
