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
};

export default (): Config => ({
  ...defaultConfig,
  ...userConfig,
});
