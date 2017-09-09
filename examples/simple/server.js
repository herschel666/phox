// eslint-disable-next-line import/no-unresolved
const createServer = require('phox/server');
const next = require('next');
const { port } = require('./phox.config');

const quiet = true;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, quiet });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => createServer(app, handle))
  .then(server =>
    // prettier-ignore
    server.listen(port, (err) => {
      if (err) {
        throw err;
      }
      console.log('🦊');
    })
  );
