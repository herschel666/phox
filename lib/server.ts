import * as express from 'express';
import * as next from 'next';
import getConfig from './config';
import getData, { initCachePurger } from './get-data';
import commonHandler from './handlers/common';
import pageHandler from './handlers/page';
import pageDataHandler from './handlers/page-data';
import frontpageDataHandler from './handlers/frontpage-data';
import albumDataHandler from './handlers/album-data';
import tagDataHandler from './handlers/tag-data';
import imageDataHandler from './handlers/image-data';
import { Server } from './definitions/global';
import * as debug from 'debug';

const log = debug('phox:server');

log('Starting phox server.');

export default async (router?: express.Router): Promise<Server> => {
  const config = getConfig();
  const quiet = true;
  const dev = process.env.NODE_ENV !== 'production';
  const app = next({ dev, quiet });
  const handle = app.getRequestHandler();

  initCachePurger(config);

  await Promise.all([app.prepare(), getData(config)]);
  const server = express();

  log('Seting up routes.');

  server.get('/', commonHandler(app, '/index'));

  server.get(
    `/${config.albumsDir}/`,
    (req: express.Request, res: express.Response) => res.redirect(301, '/')
  );

  server.get(`/${config.albumsDir}/:album/`, commonHandler(app, '/album'));

  server.get(
    `/${config.albumsDir}/:album/:image/`,
    commonHandler(app, '/image')
  );

  server.get('/tag/:tag/', commonHandler(app, '/tag'));

  server.get('/:page/', pageHandler(config, app, '/default'));

  server.get('/data/index.json', frontpageDataHandler(config));

  server.get(
    `/data/${config.albumsDir}/(:album).json`,
    albumDataHandler(config)
  );

  server.get(
    `/data/${config.albumsDir}/(:album)/(:image).json`,
    imageDataHandler(config)
  );

  server.get('/data/tag/(:tag).json', tagDataHandler);

  server.get('/data/(:page).json', pageDataHandler(config));

  if (router) {
    server.use('/', router);
  }

  // tslint:disable-next-line no-unnecessary-callback-wrapper
  server.get('*', async (req: express.Request, res: express.Response) =>
    handle(req, res)
  );

  return { server, app };
};
