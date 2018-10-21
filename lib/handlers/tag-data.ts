import * as express from 'express';
import { getDataforTag } from '../get-data';

const noResult = (res: express.Response): void => {
  res.status(404).json({ message: 'Not found' });
};

export default async (req: express.Request, res: express.Response) => {
  const tagSlug = req.params.tag;

  if (!tagSlug) {
    return noResult(res);
  }

  const data = await getDataforTag(tagSlug);

  if (!data) {
    return noResult(res);
  }

  res.json(data);
};
