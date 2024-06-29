import { defineConfigWithTheme } from 'vitepress';

export default defineConfigWithTheme({
  lang: 'zh-CN',
  title: "Kisstar's 博客",
  description: "Kisstar's 的个人博客站点。",
  // 主题配置
  themeConfig: {
    // 导航栏的配置
    socialLinks: [{ icon: 'github', link: 'https://github.com/kisstar' }],
    footer: {
      message: 'Developed by Kisstar & Powered by VitePress.',
      copyright: 'Copyright © 2023-present Kisstar'
    }
  },
  ignoreDeadLinks: [
    // ignore exact url "/playground"
    '/playground',
    // ignore all localhost links
    /^https?:\/\/localhost/,
    // ignore all links include "/repl/""
    /\/repl\//,
    // custom function, ignore all links include "ignore"
    (url) => {
      return url.toLowerCase().includes('ignore');
    }
  ]
});
