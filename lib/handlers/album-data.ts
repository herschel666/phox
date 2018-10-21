import * as debug from 'debug';
import { getPageContent, getImages } from '../get-data';
import { RequestHandler, Config, AlbumApiData } from '../definitions/global';

const log = debug('phox:handlers:album');

export const getAlbumApiData = async (
  config: Config,
  albumName: string
): Promise<AlbumApiData | null> => {
  log('Get data for album "%s".', albumName);

  const albumDir = `${config.contentDir}/${config.albumsDir}/${albumName}/`;
  const albumFile = `${albumDir}index.md`;
  const [content, images] = await Promise.all([
    getPageContent(albumFile, `${config.albumsDir}/`),
    getImages(config.albumsDir, albumName),
  ]);
  return { content, images };
};

export default (config: Config): RequestHandler => async (req, res) => {
  log('Render album "%s" for request %O', req.path, req.params);

  const album = await getAlbumApiData(config, req.params.album);
  if (!album) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json(album);
};
