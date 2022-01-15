const { resolve } = require('path');

module.exports = {
  name: 'vuepress-plugin-mathjax',

  enhanceAppFiles: resolve(__dirname, 'enhanceApp.js'),
};
