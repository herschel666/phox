import { getAlbumLinkProps } from '../util';
import { App, RequestHandler, Page, Album } from '../definitions/global';

export default (
  content: Page,
  albumsDir: string,
  albums: Album[],
  app: App
): RequestHandler => (req, res) => {
  const albumList = albums.map((album: Album) => ({
    linkProps: getAlbumLinkProps(albumsDir, album.content.name),
    title: album.content.meta.title,
  }));
  res.json({ albums: albumList, content });
};
