const acorn = require("acorn");
const jsx = require("acorn-jsx");
const walk = require("acorn-walk");
const fs = require("fs");

// Extend acorn parser with JSX support
const Parser = acorn.Parser.extend(jsx());

function analyzeFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf-8");
    // Use the extended parser to handle JSX syntax
    const ast = Parser.parse(code, {
      ecmaVersion: "latest",
      sourceType: "module",
    });

    const dependencies = new Set();

    // Define the visitors for the node types you care about
    const visitors = {
      ImportDeclaration(node) {
        // Only include external modules (skip relative paths)
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
          if (typeof dep === "string" && dep[0] !== "." && dep[0] !== "/") {
            dependencies.add(dep);
          }
        }
      },
    };

    // Build a custom base that adds empty functions for JSX node types
    const customBase = Object.assign({}, walk.base, {
      JSXElement: () => {},
      JSXFragment: () => {},
      JSXOpeningElement: () => {},
      JSXClosingElement: () => {},
      JSXAttribute: () => {},
      JSXIdentifier: () => {},
      JSXText: () => {},
      JSXExpressionContainer: () => {},
    });

    walk.simple(ast, visitors, customBase);

    const depsArray = Array.from(dependencies);
    console.log(`Dependencies found in ${filePath}:`, depsArray);
    return depsArray;
  } catch (error) {
    console.error(`Parsing error in ${filePath}:`, error.message);
    return [];
  }
}

module.exports = { analyzeFile };
