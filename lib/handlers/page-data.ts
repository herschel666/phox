import * as express from 'express';
import { getPageContent } from '../get-data';
import { Config, PageApiData, RequestHandler } from '../definitions/global';

export const getPageApiData = async (
  config: Config,
  page: string
): Promise<PageApiData | null> => {
  const filePath = `${config.contentDir}/${page}/index.md`;
  try {
    return getPageContent(filePath);
  } catch {
    return null;
  }
};

export default (config: Config): RequestHandler => async (
  req: express.Request,
  res: express.Response
) => {
  const content = await getPageApiData(config, req.params.page);
  if (content) {
    res.json(content);
    return;
  }
  res.status(404).send('Nothing found');
};
