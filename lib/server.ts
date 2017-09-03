import * as express from 'express';
import * as next from 'next';
import getConfig from './config';
import getData from './get-data';
import commonRoute from './routes/common';
import frontpageDataRoute from './routes/frontpage-data';
import albumDataRoute from './routes/album-data';
import imageDataRoute from './routes/image-data';
import { Data } from './definitions/global';

export type Handle = (
  req: express.Request,
  res: express.Response,
  parsedUrl?: next.UrlLike
) => Promise<void>;

export default async (app: next.Server, handle: Handle) => {
  const conf = getConfig();
  return getData(conf).then(({ albums, pages }: Data) => {
    const server = express();

    server.get('/', commonRoute(app, '/index'));

    server.get(`/${conf.albumsDir}/:album/`, commonRoute(app, '/album'));

    server.get(`/${conf.albumsDir}/:album/:image/`, commonRoute(app, '/image'));

    server.get('/:page/', commonRoute(app, '/default'));

    server.get(
      '/data/index.json',
      frontpageDataRoute(pages.index, conf.albumsDir, albums, app)
    );

    server.get(
      `/data/${conf.albumsDir}/(:album).json`,
      albumDataRoute(albums, app)
    );

    server.get(
      `/data/${conf.albumsDir}/(:album)/(:image).json`,
      imageDataRoute(conf.albumsDir, albums, app)
    );

    server.get('/data/(:page).json', (req, res) =>
      res.json(pages[req.params.page])
    );

    server.get('*', handle);

    return server;
  });
};
