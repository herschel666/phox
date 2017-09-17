import * as express from 'express';
import * as next from 'next';
import getConfig from './config';
import commonHandler from './handlers/common';
import pageDataHandler from './handlers/page-data';
import frontpageDataHandler from './handlers/frontpage-data';
import albumDataHandler from './handlers/album-data';
import imageDataHandler from './handlers/image-data';
import { Server } from './definitions/global';

export default async (): Promise<Server> => {
  const config = getConfig();
  const quiet = true;
  const dev = process.env.NODE_ENV !== 'production';
  const app = next({ dev, quiet });
  const handle = app.getRequestHandler();

  await app.prepare();
  const server = express();

  server.get('/', commonHandler(app, '/index'));

  server.get(`/${config.albumsDir}/:album/`, commonHandler(app, '/album'));

  server.get(
    `/${config.albumsDir}/:album/:image/`,
    commonHandler(app, '/image')
  );

  server.get('/:page/', commonHandler(app, '/default'));

  server.get('/data/index.json', frontpageDataHandler(config));

  server.get(
    `/data/${config.albumsDir}/(:album).json`,
    albumDataHandler(config)
  );

  server.get(
    `/data/${config.albumsDir}/(:album)/(:image).json`,
    imageDataHandler(config)
  );

  server.get('/data/(:page).json', pageDataHandler(config));

  // tslint:disable-next-line:no-unnecessary-callback-wrapper
  server.get('*', (req: express.Request, res: express.Response) => {
    // tslint:disable-next-line:no-floating-promises
    handle(req, res);
  });

  return { server, app };
};
