import * as deepmerge from 'deepmerge';
import { Config } from './definitions/global';

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

export default (): Config => deepmerge({}, defaultConfig, userConfig);
