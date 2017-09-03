const createServer = require('phox/server');
const next = require('next');

const quiet = true;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, quiet });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => createServer(app, handle))
  .then(server =>
    server.listen(3000, err => {
      if (err) throw err;
      console.log('🦊');
    })
  );
