const { getPathMap } = require('phox');

module.exports = {
  async exportPathMap() {
    return getPathMap();
  },
};
