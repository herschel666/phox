import { getAlbumLinkProps } from '../util';
import {
  RequestHandler,
  Page,
  Album,
  FrontpageApiData,
} from '../definitions/global';

export const getFrontpageApiData = (
  pages: Page[],
  albumsDir: string,
  albums: Album[]
): FrontpageApiData => {
  const albumList = albums.map((album: Album) => ({
    linkProps: getAlbumLinkProps(albumsDir, album.content.name),
    meta: {
      ...album.content.meta,
      name: album.content.name,
    },
  }));
  const content = pages.find((page: Page) => page.name === 'frontpage');
  return { albums: albumList, content };
};

export default (
  pages: Page[],
  albums: Album[],
  albumsDir: string
): RequestHandler => (_, res) => {
  res.json(getFrontpageApiData(pages, albumsDir, albums));
};
