# Auto-Dep-Install

[![npm version](https://img.shields.io/npm/v/auto-dep-install)](https://www.npmjs.com/package/auto-dep-install)
[![npm downloads](https://img.shields.io/npm/dw/auto-dep-install)](https://www.npmjs.com/package/auto-dep-install)
[![License](https://img.shields.io/npm/l/auto-dep-install)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/your-github-username/auto-dep-install?style=social)](https://github.com/your-github-username/auto-dep-install)
[![Sponsor](https://img.shields.io/badge/Sponsor-❤-ff69b4)](https://github.com/sponsors/your-github-username)

**Auto-Dep-Install** is a Node.js CLI tool designed to streamline dependency management, making it easier for developers to focus on coding without being interrupted by the need to manually run `npm install package` or `npm update package`. This tool automatically installs missing packages, updates outdated ones, and removes unused dependencies—without any manual intervention required.

By monitoring your project’s codebase for `import` (ES6) and `require` (commonJS) statements, Auto-Dep-Install ensures that only the packages actively used in your code are installed. When you add an `import`, it automatically installs the required package. When you remove an import, it will uninstall the package if it's no longer being used elsewhere in your project. It also handles peer dependency errors, ensuring that your project environment stays in sync with compatible package versions.

This tool works seamlessly in Node.js, React, and React Native projects.

---

## Features

- **Real-Time File Monitoring:**  
  Continuously watches your project files for any additions, modifications, or deletions, utilizing [chokidar](https://www.npmjs.com/package/chokidar) to automatically trigger dependency updates when changes are detected.
- **Automated Dependency Management:**  
  Seamlessly handles the installation and uninstallation of dependencies by scanning your code for `import` and `require` statements. It automatically installs missing packages and removes unused ones, eliminating the need for manual dependency management through `npm install package` or `npm uninstall package`.
- **Support for Modern JavaScript, JSX, and TypeScript:**  
  Leverages [@babel/parser](https://www.npmjs.com/package/@babel/parser) to effectively parse and analyze modern JavaScript, JSX, and TypeScript files, ensuring full compatibility across various project setups.
- **Framework Agnostic Compatibility:**  
  Designed to work flawlessly with Node.js, React, and React Native projects, making it a versatile tool for a wide range of applications.
- **Intelligent Peer Dependency Resolution:**  
  Automatically handles peer dependency conflicts by resolving and installing the most compatible versions, ensuring that all dependencies work harmoniously within your project environment without the need for manual conflict resolution.
- **Automatic Dependency Updates:**  
  Keeps your dependencies up to date by automatically updating them to the latest compatible versions, based on your project's requirements. This ensures your project stays current without the need for manual version management.
- **Automatic Cleanup of Unused Packages:**  
  If a package is no longer referenced in your code, **Auto-Dep-Install** will automatically uninstall it from your `node_modules` and remove it from your `package.json`, helping to maintain a lean and clean project environment.

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
npx auto-install --help
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
npx auto-install --install
```

### Help Command
For available options and usage details, run:
```sh
npx auto-install --help
```

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
DEBUG=auto-dep-install:* npx auto-install
```

---

## Contributing

Contributions are welcome! If you have improvements or bug fixes, please fork the repository and submit a pull request.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact

If you have any questions or issues, please open an issue in the repository.
