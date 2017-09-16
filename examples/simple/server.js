// eslint-disable-next-line import/no-unresolved
const { createServer } = require('phox');
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
