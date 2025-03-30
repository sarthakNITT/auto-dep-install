const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const path = require("path");

const IGNORED_PATHS = new Set([
  "node_modules", "dist", "build", ".git", ".github", ".vscode", ".idea", ".expo",
  ".expo-shared", "coverage", "test-results", "logs", "Pods", "ios", "android",
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", ".env", ".DS_Store",
  ".eslintcache", ".prettierignore", ".prettierrc", ".babelrc", ".editorconfig",
  "metro.config.js", "babel.config.js", "jest.config.js", "tsconfig.json",
  "webpack.config.js, App.test.tsx"
]);

function shouldIgnore(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  return IGNORED_PATHS.has(path.basename(filePath)) || relativePath.split(path.sep).some(segment => IGNORED_PATHS.has(segment));
}

function analyzeFile(filePath) {
  if (shouldIgnore(filePath)) {
    console.log(`Skipping ignored file: ${filePath}`);
    return [];
  }
  
  try {
    const code = fs.readFileSync(filePath, "utf-8");

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    const dependencies = new Set();
    // *****----->>>>>OLD CODE<<<<<-----*****
    // traverse(ast, {
    //   ImportDeclaration({ node }) {
    //     const dep = node.source.value;
        
    //     // Ignore internal React Native modules
    //     // if (
    //     //   !dep.startsWith("react-native/Libraries/") &&
    //     //   !dep.startsWith(".") &&
    //     //   !dep.startsWith("/")
    //     // ) {
    //     //   dependencies.add(dep);
    //     // }
    //     if (dep.startsWith("./") || dep.startsWith("../")) return; // Ignore relative imports

    //     const parentPackage = dep.includes("/") ? dep.split("/")[0] : dep;
    //     dependencies.add(parentPackage);
    //   },
    //   CallExpression({ node }) {
    //     // if (
    //     //   node.callee &&
    //     //   node.callee.name === "require" &&
    //     //   node.arguments &&
    //     //   node.arguments.length === 1 &&
    //     //   node.arguments[0].type === "StringLiteral"
    //     // ) {
    //     //   const dep = node.arguments[0].value;
          
    //     //   // Ignore internal React Native modules
    //     //   if (
    //     //     typeof dep === "string" &&
    //     //     !dep.startsWith("react-native/Libraries/") &&
    //     //     !dep.startsWith(".") &&
    //     //     !dep.startsWith("/")
    //     //   ) {
    //     //     dependencies.add(dep);
    //     //   }
    //     // }
    //     if (
    //       node.callee?.name === "require" &&
    //       node.arguments?.length === 1 &&
    //       node.arguments[0].type === "StringLiteral"
    //     ) {
    //         const dep = node.arguments[0].value;
            
    //         if (dep.startsWith("./") || dep.startsWith("../")) return; // Ignore relative imports
    
    //         const parentPackage = dep.includes("/") ? dep.split("/")[0] : dep;
    //         dependencies.add(parentPackage);
    //     }
    //   },
    // });

    traverse(ast, {
      ImportDeclaration({ node }) {
        const dep = node.source.value;
        if (dep.startsWith("./") || dep.startsWith("../")) return; 
        
        let parentPackage;
        if (dep.startsWith("@")) {
          parentPackage = dep.split("/").slice(0, 2).join("/");
        } else {
          parentPackage = dep.split("/")[0];
        }
        dependencies.add(parentPackage);
      },
      CallExpression({ node }) {
        if (
          node.callee?.name === "require" &&
          node.arguments?.length === 1 &&
          node.arguments[0].type === "StringLiteral"
        ) {
            const dep = node.arguments[0].value;
            if (dep.startsWith("./") || dep.startsWith("../")) return; 
            
            let parentPackage;
            if (dep.startsWith("@")) {
              parentPackage = dep.split("/").slice(0, 2).join("/");
            } else {
              parentPackage = dep.split("/")[0];
            }
            dependencies.add(parentPackage);
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
