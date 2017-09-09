// eslint-disable-next-line import/no-unresolved
const getPathMap = require('phox/export');

module.exports = {
  async exportPathMap() {
    return getPathMap();
  },
};
