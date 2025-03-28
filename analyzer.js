const acorn = require("acorn");
const walk = require("acorn-walk");
const fs = require("fs");

function analyzeFile(filePath) {
    try {
        const code = fs.readFileSync(filePath, "utf-8");
        const ast = acorn.parse(code, {
            ecmaVersion: "latest",
            sourceType: "module",
        });

        const dependencies = new Set();

        // Traverse AST using acorn-walk
        walk.simple(ast, {
            ImportDeclaration(node) {
                // Filter out relative imports (starting with '.' or '/')
                if (node.source.value[0] !== "." && node.source.value[0] !== "/") {
                    dependencies.add(node.source.value);
                }
            },
            CallExpression(node) {
                if (
                    node.callee &&
                    node.callee.name === "require" &&
                    node.arguments &&
                    node.arguments.length === 1 &&
                    node.arguments[0].type === "Literal"
                ) {
                    const dep = node.arguments[0].value;
                    // Only add non-relative module names
                    if (typeof dep === "string" && dep[0] !== "." && dep[0] !== "/") {
                        dependencies.add(dep);
                    }
                }
            },
        });

        const depsArray = Array.from(dependencies);
        console.log(`Dependencies found in ${filePath}:`, depsArray);
        return depsArray;
    } catch (error) {
        console.error(`Parsing error in ${filePath}:`, error.message);
        return [];
    }
}

module.exports = { analyzeFile };
