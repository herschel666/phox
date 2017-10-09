import { getImagesforTag } from '../get-data';
import { RequestHandler, Config } from '../definitions/global';

export default (config: Config): RequestHandler => async (req, res) => {
  const title = req.params.tag;
  const images = await getImagesforTag(config, title);
  res.json({ title, images });
};
