import * as globby from 'globby';
import { getGlobPatterns } from '../util';
import { Config, App, RequestHandler } from '../definitions/global';

export default (
  config: Config,
  app: App,
  view: string
): RequestHandler => async (req, res, next) => {
  const globPatterns = getGlobPatterns(config);
  const pages = await globby(globPatterns.pages, {
    ignore: globPatterns.albums,
  });
  const pageNames: string[] = pages
    .map((pathname: string): string =>
      pathname.replace(`${config.contentDir}/`, '').replace(/\/?index\.md$/, '')
    )
    .filter(Boolean);
  if (!pageNames.includes(req.params.page)) {
    next();
    return;
  }
  // tslint:disable-next-line:no-floating-promises
  app.render(req, res, view, req.params);
};
