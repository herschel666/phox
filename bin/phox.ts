#!/usr/bin/env node

import * as path from 'path';
import { readFileSync } from 'fs';
import { spawn, exec, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as rimraf from 'rimraf';
import * as delay from 'delay';
import * as globby from 'globby';
import * as prettyMs from 'pretty-ms';
import * as minimist from 'minimist';
import imagemin = require('imagemin');
import imageminJpegtran = require('imagemin-jpegtran');
import imageminPngquant = require('imagemin-pngquant');
import getConfig from '../lib/config';
import writeApiData from '../lib/write-api-data';
import { log } from '../lib/util';

interface Main {
  server: ChildProcess | null;
  error?:
    | Error
    | {
        message: string;
        stack: string;
      };
}

interface CheckResult {
  server: ChildProcess | null;
  exitCode: 0 | 1;
}

const CWD = process.cwd();

const { version } = (() => {
  try {
    return JSON.parse(readFileSync('../package.json', 'utf8'));
  } catch (e) {
    return { version: 'unknown' };
  }
})();

const argv = minimist(process.argv.slice(2), {
  boolean: ['h', 'help', 'V', 'version'],
  alias: {
    h: 'help',
    V: 'version',
  },
});

const resolve = Promise.resolve.bind(Promise);

if (argv.help) {
  process.stdout.write(`
🦊  Build & export your awesome photo site! 🦊

Usage
  $ npx phox

Options
  --help, -h         Show this Help section
  --version, -V      Displays the phox version you're currently using

To configure the build, add a phox.config.js to the root of your
project and put the desired options into it.

Version: ${version}
`);
  process.exit();
}

if (argv.version) {
  log(`v${version}`);
  process.exit();
}

const config = getConfig();
const outDir = path.join(CWD, config.outDir);
const pExec = promisify(exec);
const now = Date.now();

const minifyImages = async () => {
  const plugins = [imageminJpegtran(), imageminPngquant({ quality: '65-80' })];
  const folder = path.join(outDir, 'static', config.albumsDir);
  const albums = await globby(path.join(folder, '*'));
  await Promise.all(
    albums.map(async (album: string): Promise<void> =>
      imagemin([path.join(album, '*.{jpg,png}')], album, {
        plugins,
      })
    )
  );
};

process.env.NODE_ENV = 'production';

const main = async (): Promise<Main> => {
  let server = null;
  try {
    log('Cleaning up ...');
    rimraf.sync(outDir);

    log('Building the site ...');
    await pExec('npx next build');

    log('Starting the dev-server ...');
    server = spawn('node', ['server.js']);

    // Otherwise the TSC doesn't recognize it
    // as a promise ... #FML
    await delay(1000).then(resolve);

    log('Exporting the site ...');
    await pExec(`npx next export -o ${outDir}`);
    await writeApiData(config);

    log('Minifying the images ...');
    await minifyImages();
  } catch (error) {
    return { server, error };
  }
  return { server };
};

const checkResult = ({ server, error }: Main): CheckResult => {
  const exitCode = error ? 1 : 0;
  if (error) {
    log('Something went wrong while phoxing ...');
    console.error('  ', error.message);
    // tslint:disable-next-line:no-console
    console.log('  ', error.stack);
  } else {
    const ms = Date.now() - now;
    const duration = prettyMs(ms);
    log(`Successfully built your site in ${duration}.`);
  }
  return { server, exitCode };
};

const killServer = async ({ server, exitCode }: CheckResult): Promise<void> => {
  if (server) {
    process.kill(server.pid);
    await new Promise(innerResolve => server.on('close', innerResolve));
  }
  process.exit(exitCode);
};

main()
  .then(checkResult)
  .then(killServer)
  .catch(console.error);
