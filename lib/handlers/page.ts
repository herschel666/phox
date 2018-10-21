import * as globby from 'globby';
import * as debug from 'debug';
import { getGlobPatterns } from '../util';
import { Config, App, RequestHandler } from '../definitions/global';

const log = debug('phox:handlers:page-view');

export default (
  config: Config,
  app: App,
  view: string
): RequestHandler => async (req, res, next) => {
  log('Render page view "%s" for request %O', req.path, req.params);

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

  return app.render(req, res, view, req.params);
};
