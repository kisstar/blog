import { nav,sidebar } from './nav'
import categoryInfo from './categoryInfo';
import tagInfo from './tagInfo';

export default {
  title: "Kisstar's 博客",
  description: "Kisstar's 的个人博客站点。",
  locales: {
    '/': {
      lang: 'zh-CN'
    }
  },
  // 主题配置
  themeConfig: {
    // 导航栏的配置
    nav,
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kisstar' }
    ],
    // 分类和标签配置
    categoryInfo,
    tagInfo,
    // 获取在原文编辑地址
    editLink: {
      pattern: 'https://github.com/kisstar/blog/edit/next/src/:path',
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
  rewrites: {
    '(.*)/:year-:month-:day-:name(.*).md': ':year/:month/:day/:name.md'
  },
  ignoreDeadLinks: [
    // ignore all localhost links
    /^https?:\/\/localhost/,
  ],
  markdown: {
    math: true
  }
};
