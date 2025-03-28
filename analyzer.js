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

        // Use acorn-walk to traverse the AST
        walk.simple(ast, {
            ImportDeclaration(node) {
                dependencies.add(node.source.value);
            },
            CallExpression(node) {
                if (
                    node.callee &&
                    node.callee.name === "require" &&
                    node.arguments &&
                    node.arguments.length === 1 &&
                    node.arguments[0].type === "Literal"
                ) {
                    dependencies.add(node.arguments[0].value);
                }
            },
        });

        const depsArray = Array.from(dependencies);
        console.log("Dependencies found in", filePath, ":", depsArray);
        return depsArray;
    } catch (error) {
        console.error("Parsing error in", filePath, ":", error.message);
        return [];
    }
}

module.exports = { analyzeFile };
