import * as deepmerge from 'deepmerge';
import * as debug from 'debug';
import { Config } from './definitions/global';

const log = debug('phox:config');
const userConfig = (() => {
  try {
    // tslint:disable-next-line:non-literal-require
    return require(`${process.cwd()}/phox.config.js`);
  } catch (e) {
    return {};
  }
})();

export const defaultConfig = {
  contentDir: 'content',
  albumsDir: 'albums',
  outDir: 'out',
  port: 3000,
  hostname: 'localhost',
  server: 'server.js',
  imageOptimization: {
    progressive: true,
    quality: '65-80',
  },
};
const config = deepmerge(defaultConfig, userConfig);

log('Using config: %O', config);

export default (): Config => config;
