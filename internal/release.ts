import * as path from 'path';
import * as fs from 'fs';
import { execSync, ExecSyncOptions } from 'child_process';

const execSyncOptions: ExecSyncOptions = {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
};

execSync('npm run test', execSyncOptions);
execSync('npm run packages:release', execSyncOptions);

const packageJSON = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json')).toString(),
);

delete packageJSON.devDependencies;
delete packageJSON.scripts;
delete packageJSON.private;

packageJSON.scripts = {
  'postinstall' : '>&2 echo "\n\nYou must use \"@type-properties/core\" instead of \"type-properties\"\n\n";'
};

fs.writeFileSync(
  path.resolve(__dirname, '../dist/package.json'),
  JSON.stringify(packageJSON, null, 2),
);

fs.copyFileSync(
  path.resolve(__dirname, '../LICENSE'),
  path.resolve(__dirname, '../dist/LICENSE'),
);

let  readme = fs.readFileSync(path.resolve(__dirname, '../README.md')).toString();
readme = `> **This project was moved to [\`@type-properties/core\`](https://www.npmjs.com/package/@type-properties/core).**
${readme}`;
fs.writeFileSync(path.resolve(__dirname, '../dist/README.md'), readme);
