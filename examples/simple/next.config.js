// eslint-disable-next-line import/no-unresolved
const { getPathMap } = require('phox');

module.exports = {
  async exportPathMap() {
    return getPathMap();
  },
};
