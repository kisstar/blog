const ghpages = require('gh-pages');

const logger = {
    log: console.log,
    error: console.error,
}
const options = {
    repo: 'https://github.com/kisstar/kisstar.github.io.git',
    branch: 'master',
    dir: '.vuepress/dist'
}

ghpages.publish(options.dir, options, function(err) {
    if (err) {
        logger.error('============ 发布失败 ============\n');
        logger.error(err);
        return
    }

    logger.log('============ 发布成功 ============');
});
