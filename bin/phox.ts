#!/usr/bin/env node

import * as path from 'path';
import { readFileSync, stat } from 'fs';
import { spawn, exec, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as rimraf from 'rimraf';
import * as prettyMs from 'pretty-ms';
import * as minimist from 'minimist';
import imagemin = require('imagemin');
import imageminJpegtran = require('imagemin-jpegtran');
import imageminPngquant = require('imagemin-pngquant');
import getConfig from '../lib/config';
import writeApiData from '../lib/write-api-data';
import { log } from '../lib/util';

// TOOD: use ESModule syntax
const globby = require('globby');
const wait = require('waait');

interface Main {
  server?: ChildProcess | null;
  error?:
    | Error
    | {
        message: string;
        stack?: string;
      };
}

interface CheckResult {
  server: ChildProcess | null;
  exitCode: 0 | 1;
}

const CWD = process.cwd();

const { version } = (() => {
  const fileName = path.join(__dirname, '..', 'package.json');
  try {
    return JSON.parse(readFileSync(fileName, 'utf8'));
  } catch {
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

if (argv.help) {
  process.stdout.write(`
🦊  Build & export your awesome photo site! 🦊

Usage
  $ npx phox

Options
  --help, -h     Show this Help section
  --version, -V  Displays the phox version you're currently using

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
const pStat = promisify(stat);
const now = Date.now();

const NO_SERVER_JS_ERR = `
./${config.server} is missing.

Visit https://github.com/herschel666/phox#setup
to learn how to set up the local dev-server.
`;

const minifyImages = async () => {
  const { progressive, quality } = config.imageOptimization;
  const plugins = [
    imageminJpegtran({ progressive }),
    imageminPngquant({ quality }),
  ];
  const folder = path.join(outDir, 'static', config.albumsDir);
  const albums = await globby(path.join(folder, '*'));
  await Promise.all(
    albums.map(
      async (album: string): Promise<void> =>
        imagemin([path.join(album, '*.{jpg,png}')], album, {
          plugins,
        })
    )
  );
};

const serverJsExists = async (): Promise<boolean> => {
  try {
    await pStat(config.server);
    return true;
  } catch {
    return false;
  }
};

process.env.NODE_ENV = 'production';

const main = async (): Promise<Main> => {
  let server;
  try {
    const hasServerJs = await serverJsExists();
    if (!hasServerJs) {
      return {
        error: { message: NO_SERVER_JS_ERR },
      };
    }

    log('Cleaning up ...');
    rimraf.sync(outDir);

    log('Building the site ...');
    await pExec('npx next build');

    log('Starting the dev-server ...');
    server = spawn('node', [config.server]);

    await wait(1000);

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
    if (error.stack) {
      // tslint:disable-next-line:no-console
      console.log('  ', error.stack);
    }
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
    await new Promise((innerResolve) => server.on('close', innerResolve));
  }
  process.exit(exitCode);
};

main()
  .then(checkResult)
  .then(killServer)
  .catch(console.error);
