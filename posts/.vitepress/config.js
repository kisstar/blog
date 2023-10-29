export default {
  title: "Kisstar's 博客",
  locales: {
    '/': {
      lang: 'zh-CN'
    }
  },
  // 主题配置
  themeConfig: {
    // 导航栏的配置
    nav: [
      {
        text: '掘金',
        link: 'https://juejin.cn/user/870468942050759',
        target: '_blank',
        rel: 'noopener noreferrer'
      },
      {
        text: '思否',
        link: 'https://segmentfault.com/u/dongwanhong/',
        target: '_blank',
        rel: 'noopener noreferrer'
      },
      {
        text: '笔记',
        link: 'https://dongwanhong.gitee.io/notebook/',
        target: '_blank',
        rel: 'noopener noreferrer'
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
        rel: 'noopener noreferrer'
      }
    ],
    // 获取在原文编辑地址
    editLink: {
      pattern: 'https://github.com/kisstar/blog/edit/master/posts/:path',
      text: '在 GitHub 上编辑此页'
    },
    // 最近更新
    lastUpdated: {
      text: '最近更新'
    },
    footer: {
      message: 'Developed by Kisstar & Powered by VitePress.',
      copyright: 'Copyright © 2023-present Kisstar'
    }
  },
  markdown: {
    math: true
  }
};
