import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

const version = Date.now().toString();

const envPath = path.join(__dirname, '.env');
const versionJsonPath = path.join(__dirname, './public/version.json');
const versionJsPath = path.join(__dirname, './src/Version.js');

// 1. Write to .env
// fs.writeFileSync(envPath, `REACT_APP_VERSION=${version}\n`, 'utf8');

// 2. Write to public/version.json
fs.writeFileSync(versionJsonPath, JSON.stringify({ version }), 'utf8');

// 3. Write to src/components/Version.ts
const versionJsContent = `const APP_VERSION = '${version}';\nexport default APP_VERSION;\n`;
fs.writeFileSync(versionJsPath, versionJsContent, 'utf8');

console.log(`✅ Version ${version} written to:
- .env
- public/version.json
- src/components/Version.ts`);