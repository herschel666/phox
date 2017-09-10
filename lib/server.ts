import * as express from 'express';
import * as next from 'next';
import getConfig from './config';
import getData from './get-data';
import commonHandler from './handlers/common';
import frontpageDataHandler from './handlers/frontpage-data';
import albumDataHandler from './handlers/album-data';
import imageDataHandler from './handlers/image-data';
import { Server, Page } from './definitions/global';

export type Handle = (
  req: express.Request,
  res: express.Response,
  parsedUrl?: next.UrlLike
) => Promise<void>;

const config = getConfig();
const quiet = true;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, quiet });
const handle = app.getRequestHandler();

export default async (): Promise<Server> => {
  await app.prepare();
  const { albums, pages } = await getData(config);
  const server = express();

  server.get('/', commonHandler(app, '/index'));

  server.get(`/${config.albumsDir}/:album/`, commonHandler(app, '/album'));

  server.get(
    `/${config.albumsDir}/:album/:image/`,
    commonHandler(app, '/image')
  );

  server.get('/:page/', commonHandler(app, '/default'));

  server.get(
    '/data/index.json',
    frontpageDataHandler(pages, albums, config.albumsDir)
  );

  server.get(
    `/data/${config.albumsDir}/(:album).json`,
    albumDataHandler(albums)
  );

  server.get(
    `/data/${config.albumsDir}/(:album)/(:image).json`,
    imageDataHandler(config.albumsDir, albums, app)
  );

  server.get(
    '/data/(:page).json',
    (req: express.Request, res: express.Response) =>
      res.json(pages.find((page: Page) => page.name === req.params.page))
  );

  // tslint:disable-next-line:no-unnecessary-callback-wrapper
  server.get('*', (req: express.Request, res: express.Response) => {
    // tslint:disable-next-line:no-floating-promises
    handle(req, res);
  });

  return { server, app };
};
