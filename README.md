# Auto-Dep-Install

**Auto-Dep-Install** is a Node.js CLI tool designed to reduce the extra effort developers face by having to repeatedly run `npm install`. It automatically monitors your codebase for external dependencies (through `import` or `require` statements) and ensures that only the packages actually used in your code are installed. When you add an import, it installs the package; when you remove it, the package is uninstalled automatically.

This tool works seamlessly in Node.js, React, and React Native projects.

---

## Features
- **Real-Time Monitoring:** Watches your project for file changes (additions, modifications, and deletions) using [chokidar](https://www.npmjs.com/package/chokidar).
- **Automatic Dependency Management:** Scans your code for external imports and automatically installs missing packages or uninstalls unused ones, eliminating the need to manually run `npm install` or `npm uninstall`.
- **JSX/TSX Support:** Uses [@babel/parser](https://www.npmjs.com/package/@babel/parser) to parse modern JavaScript, JSX, and TypeScript files.
- **Framework Agnostic:** Works for Node.js, React, and React Native projects.

---

## Installation

Since this package is now published, install it globally via npm:
```sh
npm install -g auto-dep-install
```

Or install it as a dev dependency in your project:
```sh
npm install --save-dev auto-dep-install
```

To verify the installation, run:
```sh
auto-install --help
```

---

## Usage

### Watch Mode (Recommended)
Start monitoring your project with:
```sh
npx auto-install
```
The tool will watch for changes in your project files (e.g., `.js`, `.jsx`, `.ts`, `.tsx`) and update dependencies automatically.

### One-Time Full Scan
To perform a full scan (install missing dependencies and uninstall unused ones) without entering watch mode, run:
```sh
auto-install --install
```

### Help Command
For available options and usage details, run:
```sh
auto-install --help
```

---

## How It Works

1. **File Watching:** Uses [chokidar](https://www.npmjs.com/package/chokidar) to watch your project directory. It triggers a scan whenever files are added, modified, or deleted.
2. **Dependency Analysis:** Parses project files using [@babel/parser](https://www.npmjs.com/package/@babel/parser) and [@babel/traverse](https://www.npmjs.com/package/@babel/traverse) to extract dependencies from `import` and `require` statements. Relative imports (those starting with `.` or `/`) are ignored.
3. **Installation & Uninstallation:** The tool compares detected dependencies with those listed in `package.json`:
   - **Installation:** Missing packages are installed via `npm install`.
   - **Uninstallation:** Unused packages (present in `package.json` but not referenced in your code) are removed using `npm uninstall`.

---

## Example
The following simple Node.js code demonstrates the core functionality:

### Version 1: With External Dependency
In this version, `example.js` imports `lodash`. When you save this file, Auto-Dep-Install detects the `require('lodash')` call and runs `npm install lodash` if it isn’t installed.

```javascript
// example.js (Version 1)
const _ = require('lodash');
console.log('Lodash is available:', _.isEmpty({}));
```

### Version 2: Without External Dependency
If `lodash` is removed, Auto-Dep-Install scans your project and, if no file references `lodash`, it runs `npm uninstall lodash` to remove it.

```javascript
// example.js (Version 2)
console.log('No external dependencies are required.');
```

---

## Debugging & Troubleshooting

If you encounter issues, enable debug mode:
```sh
DEBUG=auto-install:* auto-install
```

### Common Issues
- **Package not installing?** Ensure `package.json` exists and has valid JSON syntax.
- **Tool not detecting dependencies?** Check if your imports are correctly formatted.
- **Unexpected behavior?** Restart the tool or run `auto-install --install` to force a full scan.

---

## Contributing

Contributions are welcome! If you have improvements or bug fixes, please fork the repository and submit a pull request.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact

If you have any questions or issues, please open an issue in the repository.