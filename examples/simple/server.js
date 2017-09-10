const createServer = require('phox/server');
const { port } = require('./phox.config');

createServer().then(({ server }) =>
  // prettier-ignore
  server.listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log('🦊');
  })
);
