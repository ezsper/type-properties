import * as path from 'path';
import * as fs from 'fs';
import { execSync, ExecSyncOptions } from 'child_process';

const execSyncOptions: ExecSyncOptions = {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
};

execSync('npm run build', execSyncOptions);
execSync('npm run test', execSyncOptions);

const packageJSON = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json')).toString()
);

delete packageJSON.devDependencies;
delete packageJSON.scripts;
delete packageJSON.private;

fs.writeFileSync(
  path.resolve(__dirname, '../dist/package.json'),
  JSON.stringify(packageJSON, null, 2),
);

fs.copyFileSync(
  path.resolve(__dirname, '../LICENSE'),
  path.resolve(__dirname, '../dist/LICENSE'),
);

fs.copyFileSync(
  path.resolve(__dirname, '../../../README.md'),
  path.resolve(__dirname, '../dist/README.md'),
);