const { createServer, Router } = require('phox');
const { port } = require('./phox.config');

const router = Router();

router.get('/api/:text/', (req, res) =>
  res.json({
    text: decodeURIComponent(req.params.text),
  })
);

createServer(router).then(({ server }) =>
  // prettier-ignore
  server.listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log('🦊');
  })
);
