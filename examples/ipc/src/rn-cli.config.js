const path = require('path');
const blacklist = require('metro-bundler/src/blacklist'); // eslint-disable-line

module.exports = {
  getProjectRoots() {
    return [__dirname];
  },
  getBlacklistRE() {
    return blacklist([
      // you can disable conflicted modules here
      // new RegExp(
      //   `^${escape(path.resolve(__dirname, 'some-module-name'))}\\/.*$`
      // ),
    ]);
  },
};
