require('dotenv').config();
const tagInfo = require('./tagInfo');

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

module.exports = () => ({
  theme: '@kisstar/vuepress-theme-extreme',
  title: "Kisstar's 博客",
  locales: {
    '/': {
      lang: 'zh-CN',
    },
  },
  // 主题配置
  themeConfig: {
    banner: 'banner.png',
    knownTitle: 'Kisstar',
    subTitle:
      "If you can't explain it simply, you don't understand it well enough.",
    // 导航栏的配置
    nav: [
      {
        text: '掘金',
        link: 'https://juejin.cn/user/870468942050759',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      {
        text: '思否',
        link: 'https://segmentfault.com/u/dongwanhong/',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      {
        text: '笔记',
        link: 'https://dongwanhong.gitee.io/notebook/',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      {
        text: '案列',
        link: 'https://dongwanhong.gitee.io/source-code/',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      // {
      //   text: '简历',
      //   link: 'https://dongwanhong.gitee.io/resume/',
      //   target: '_blank',
      //   rel: 'noopener noreferrer',
      // },
      {
        text: 'GitHub',
        link: 'https://github.com/kisstar',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    ],
    // 目录分类配置
    directories: [
      {
        id: 'post',
        dirname: 'posts',
        path: '/',
      },
    ],
    // 标签的描述信息
    tags: tagInfo,
    // 获取在原文编辑地址
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    repo: 'kisstar/blog',
    docsDir: 'packages/docs/posts',
    lastUpdated: '最近更新',
    // 评论
    comment: {
      service: 'vssue',
      owner: 'kisstar',
      repo: 'kisstar.github.io',
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      // Optional
      state: 'Comment',
      labels: ['Comment'],
      prefix: ['[Comment] '],
    },
    // 搜索
    searchPlaceholder: 'What are you looking for?',
  },
  markdown: {
    extendMarkdown: (md) => {
      const mathjax3 = require('markdown-it-mathjax3');

      md.use(mathjax3);
    },
  },
  plugins: [require('../plugins/mathjax')],
});
