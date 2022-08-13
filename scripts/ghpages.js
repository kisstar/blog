const path = require('path');
const fs = require('fs');
const minimist = require('minimist');
const ghpages = require('gh-pages');

const argv = minimist(process.argv.slice(2));
const config = {
  dir: '.vuepress/dist',
  cname: 'CNAME',
};
const logger = {
  log: console.log,
  error: console.error,
};
const options = {
  repo: argv.r || 'https://github.com/kisstar/kisstar.github.io.git',
  branch: 'master',
};
const resolve = (...args) => path.resolve(__dirname, '../', ...args);

fs.writeFileSync(
  resolve(config.dir, config.cname),
  fs.readFileSync(config.cname)
);
ghpages.publish(config.dir, options, function(err) {
  if (err) {
    logger.error('============ 发布 GitHub 失败 ============\n');
    logger.error(err);
    return;
  }

  logger.log('============ 发布 GitHub 成功 ============');
});
