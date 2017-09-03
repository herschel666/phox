import { getDetailLinkProps } from '../util';
import {
  App,
  Image,
  Album,
  RequestHandler,
  LinkProps,
} from '../definitions/global';

interface Sibling {
  title: string;
  linkProps: LinkProps;
}

const getImageSibling = (
  albumsDir: string,
  album: Album,
  image: Image,
  dir: number
): Sibling | null => {
  const imageIndex = album.images.indexOf(image);
  const siblingIndex = imageIndex + dir;
  if (siblingIndex === -1 || siblingIndex === album.images.length) {
    return null;
  }
  const sibling = album.images[siblingIndex];
  return {
    title: sibling.meta.title || '',
    linkProps: getDetailLinkProps(
      albumsDir,
      album.content.name,
      sibling.filePath
    ),
  };
};

export default (
  albumsDir: string,
  albums: Album[],
  app: App
): RequestHandler => (req, res) => {
  const notFound = { message: 'Not found' };
  const album = albums.find(({ content }) => content.name === req.params.album);

  if (!album) {
    res.status(404).json(notFound);
    return;
  }

  const image = album.images.find(
    ({ fileName }: Image) => fileName.split('.').shift() === req.params.image
  );

  if (!image) {
    res.status(404).json(notFound);
    return;
  }

  const prev = getImageSibling(albumsDir, album, image, -1);
  const next = getImageSibling(albumsDir, album, image, 1);

  res.json({ ...image, next, prev });
};
