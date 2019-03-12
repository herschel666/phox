import * as express from 'express';
import * as debug from 'debug';
import { getPageContent } from '../get-data';
import { Config, PageApiData, RequestHandler } from '../definitions/global';

const log = debug('phox:handlers:page');

export const getPageApiData = async (
  config: Config,
  page: string
): Promise<PageApiData | void> => {
  const filePath = `${config.contentDir}/${page}/index.md`;
  try {
    return getPageContent(filePath);
  } catch {
    return;
  }
};

export default (config: Config): RequestHandler => async (
  req: express.Request,
  res: express.Response
) => {
  log('Render page "%s" for request %O', req.path, req.params);

  const content = await getPageApiData(config, req.params.page);
  if (content) {
    res.json(content);
    return;
  }
  res.status(404).send('Nothing found');
};
