const { getPathMap } = require('phox');

module.exports = {
  generateBuildId: async () => {
    if (process.env.PHOX_BUILD_ID) {
      return process.env.PHOX_BUILD_ID;
    }

    return null;
  },
  async exportPathMap() {
    return getPathMap();
  },
};
