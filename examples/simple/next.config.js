const getPathMap = require('phox/export');

module.exports = {
  async exportPathMap() {
    return await getPathMap();
  },
};
