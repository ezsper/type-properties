import * as path from 'path';
import * as fs from 'fs';
import * as ChildProcess from 'child_process';

const exec = ((command: string, options: ChildProcess.ExecOptions, ...args: any[]) => {
  const child = ChildProcess.exec(command, {
    cwd: process.cwd(),
    env: process.env,
    ...options,
  });
  if (child.stdout) {
    child.stdout.on('data', function (data) {
      process.stdout.write(data);
    });
  }
  if (child.stderr) {
    child.stderr.on('data', function (data) {
      process.stderr.write(data);
    });
  }
  return child;
}) as typeof ChildProcess.exec;

exec('npm run test');
exec('npm run build');
exec('npm run packages:release');

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