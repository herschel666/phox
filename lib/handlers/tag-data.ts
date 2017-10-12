import { getImagesforTag } from '../get-data';
import { RequestHandler, Config } from '../definitions/global';

export default (config: Config): RequestHandler => async (req, res) => {
  const title = req.params.tag;
  if (!title) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  const images = await getImagesforTag(config, title);
  res.json({ title, images });
};
