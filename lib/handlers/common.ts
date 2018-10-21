import * as express from 'express';
import * as debug from 'debug';
import { App, RequestHandler } from '../definitions/global';

const log = debug('phox:handlers:common');

export default (app: App, view: string): RequestHandler => async (
  req: express.Request,
  res: express.Response
) => {
  log('Render view "%s" for request %O', req.path, req.params);

  return app.render(req, res, view, req.params);
};
