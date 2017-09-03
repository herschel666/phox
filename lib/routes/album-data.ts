import { App, RequestHandler, Album } from '../definitions/global';

export default (albums: Album[], app: App): RequestHandler => (req, res) => {
  const album = albums.find(({ content }) => content.name === req.params.album);
  if (!album) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json(album);
};
