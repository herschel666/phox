import { App, RequestHandler } from '../definitions/global';

export default (app: App, view: string): RequestHandler => (req, res) => {
  // tslint:disable-next-line:no-floating-promises
  app.render(req, res, view, req.params);
};
