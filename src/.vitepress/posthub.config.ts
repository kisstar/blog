import { defineConfigWithTheme } from 'vitepress';
import type { Config as PosthubThemeConfig } from 'posthub-vitepress-theme';
import posthubThemeConfig from 'posthub-vitepress-theme/config';
import { nav, sidebar } from './nav';
import categoryInfo from './categoryInfo';
import tagInfo from './tagInfo';

export default defineConfigWithTheme<PosthubThemeConfig>({
  extends: posthubThemeConfig,
  lang: 'zh-CN',
  title: "Kisstar's 博客",
  description: "Kisstar's 的个人博客站点。",
  // 主题配置
  themeConfig: {
    // 导航栏的配置
    nav,
    sidebar,
    socialLinks: [{ icon: 'github', link: 'https://github.com/kisstar' }],
    // 分类和标签配置
    categoryInfo,
    tagInfo,
    postInfo: {
      '2023-11-05-vite': {
        hot: true
      },
      '2023-04-16-electron-events': {
        hot: true
      },
      '2021-05-09-egg': {
        hot: true
      },
      '2019-12-16-promise': {
        hot: true
      },
    },
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
  markdown: {
    math: true
  },
  vite: {
    optimizeDeps: {
      exclude: ['posthub-vitepress-theme']
    }
  }
});
