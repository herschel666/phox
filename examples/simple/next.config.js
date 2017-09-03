const { getPathMap, writeData } = require('phox/export');

module.exports = {
  async exportPathMap() {
    const paths = await getPathMap();
    await writeData(paths);
    return paths;
  },
};
