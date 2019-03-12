import * as debug from 'debug';
import { getFrontpageApiData } from '../get-data';
import { Config, RequestHandler } from '../definitions/global';

const log = debug('phox:handlers:frontpage');

export default (config: Config): RequestHandler => async (_, res) => {
  log('Render frontpage view.');

  const data = await getFrontpageApiData(config);
  res.json(data);
};
