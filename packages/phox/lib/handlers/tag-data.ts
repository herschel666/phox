import * as express from 'express';
import { getDataforTag } from '../get-data';
import { RequestHandler, Config } from '../definitions/global';

const noResult = (res: express.Response): void => {
  res.status(404).json({ message: 'Not found' });
};

export default (config: Config): RequestHandler => async (req, res) => {
  const tagSlug = req.params.tag;

  if (!tagSlug) {
    return noResult(res);
  }

  const data = await getDataforTag(config, tagSlug);

  if (!data) {
    return noResult(res);
  }

  res.json(data);
};
