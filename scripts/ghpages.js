const path = require('path');
const fs = require('fs');
const ghpages = require('gh-pages');

const config = {
  dir: '.vuepress/dist',
  cname: 'CNAME',
};
const logger = {
  log: console.log,
  error: console.error,
};
const options = {
  repo: 'https://github.com/kisstar/kisstar.github.io.git',
  branch: 'master',
};
const resolve = (...args) => path.resolve(__dirname, '../', ...args);

fs.writeFileSync(
  resolve(config.dir, config.cname),
  fs.readFileSync(config.cname)
);
ghpages.publish(config.dir, options, function(err) {
  if (err) {
    logger.error('============ 发布失败 ============\n');
    logger.error(err);
    return;
  }

  logger.log('============ 发布成功 ============');
});
