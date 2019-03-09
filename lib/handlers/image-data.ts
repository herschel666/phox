import * as path from 'path';
import * as debug from 'debug';
import { getDetailLinkProps, getAlbumLinkProps } from '../util';
import { getPageContent, getImages } from '../get-data';
import {
  Config,
  Image,
  RequestHandler,
  ImageApiData,
  PageRef,
} from '../definitions/global';

const log = debug('phox:handlers:image');

export const getImageSibling = (
  albumsDir: string,
  albumName: string,
  images: Image[],
  imageIndex: number,
  direction: number
): PageRef | void => {
  const siblingIndex = imageIndex + direction;
  if (siblingIndex === -1 || siblingIndex === images.length) {
    return;
  }
  const sibling = images[siblingIndex];
  return {
    title: sibling.meta.title || '',
    linkProps: getDetailLinkProps(albumsDir, albumName, sibling.filePath),
  };
};

export const getImageApiData = async (
  config: Config,
  albumName: string,
  imageName: string
): Promise<ImageApiData | void> => {
  const albumDir = path.join(config.contentDir, config.albumsDir, albumName);
  const album = await getPageContent(
    `${albumDir}/index.md`,
    `${config.albumsDir}/`
  );
  if (!album) {
    return;
  }
  const images = await getImages(config.albumsDir, albumName);
  const image = images.find(
    ({ fileName }: Image) => fileName.split('.').shift() === imageName
  );
  if (!image) {
    return;
  }
  const imageIndex = images.indexOf(image);
  const prev = getImageSibling(
    config.albumsDir,
    albumName,
    images,
    imageIndex,
    -1
  );
  const next = getImageSibling(
    config.albumsDir,
    albumName,
    images,
    imageIndex,
    1
  );
  const back = {
    title: album && album.meta.title,
    linkProps: getAlbumLinkProps(config.albumsDir, album.name),
  };
  return { image, next, prev, back };
};

export default (config: Config): RequestHandler => async (req, res) => {
  log('Render image "%s" for request %O', req.path, req.params);

  const imageApiData = await getImageApiData(
    config,
    req.params.album,
    req.params.image
  );

  if (!imageApiData) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  res.json(imageApiData);
};
