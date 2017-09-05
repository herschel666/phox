import { RequestHandler, Album } from '../definitions/global';

const getAlbumApiData = (albums: Album[], name: string): Album =>
  albums.find(({ content }: Album) => content.name === name);

export default (albums: Album[]): RequestHandler => (req, res) => {
  const album = getAlbumApiData(albums, req.params.album);
  if (!album) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json(album);
};
