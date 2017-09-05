import * as express from 'express';
import * as next from 'next';
import getConfig from './config';
import getData from './get-data';
import commonHandler from './handlers/common';
import frontpageDataHandler from './handlers/frontpage-data';
import albumDataHandler from './handlers/album-data';
import imageDataHandler from './handlers/image-data';
import { Data, Page } from './definitions/global';

export type Handle = (
  req: express.Request,
  res: express.Response,
  parsedUrl?: next.UrlLike
) => Promise<void>;

export default async (app: next.Server, handle: Handle) => {
  const conf = getConfig();
  return getData(conf).then(({ albums, pages }: Data) => {
    const server = express();

    server.get('/', commonHandler(app, '/index'));

    server.get(`/${conf.albumsDir}/:album/`, commonHandler(app, '/album'));

    server.get(
      `/${conf.albumsDir}/:album/:image/`,
      commonHandler(app, '/image')
    );

    server.get('/:page/', commonHandler(app, '/default'));

    server.get(
      '/data/index.json',
      frontpageDataHandler(pages, albums, conf.albumsDir)
    );

    server.get(
      `/data/${conf.albumsDir}/(:album).json`,
      albumDataHandler(albums)
    );

    server.get(
      `/data/${conf.albumsDir}/(:album)/(:image).json`,
      imageDataHandler(conf.albumsDir, albums, app)
    );

    server.get('/data/(:page).json', (req, res) =>
      res.json(pages.find((page: Page) => page.name === req.params.page))
    );

    server.get('*', handle);

    return server;
  });
};
