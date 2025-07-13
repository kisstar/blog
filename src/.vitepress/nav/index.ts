import designPattern from './design-pattern';
import effectiveCpp from './effective-cpp';
import computerGraphics from './computer-graphics';
import CSSSidebar from './css';
import demoSidebar from './demo';

export const nav = [
  {
    text: '博文',
    link: '/posts',
    activeMatch: '/posts'
  },
  {
    text: '专栏',
    items: [
      {
        text: '设计模式',
        link: '/design-pattern/',
        activeMatch: '/design-pattern/'
      },
      {
        text: 'Effective C++',
        link: '/effective-cpp/',
        activeMatch: '/effective-cpp/'
      },
      {
        text: '计算机图形学',
        link: '/computer-graphics/',
        activeMatch: '/computer-graphics/'
      }
    ]
  },
  {
    text: 'Crash Course',
    items: [
      {
        text: 'CSS',
        link: '/css/',
        activeMatch: '/css/'
      }
    ]
  },
  {
    text: '其它',
    items: [
      {
        text: 'Demo',
        link: '/demo/',
        activeMatch: '/demo/'
      },
      {
        text: '笔记',
        link: 'https://kisstar.github.io/notebook/',
        target: '_blank'
      }
    ]
  }

  // {
  //   text: '思否',
  //   link: 'https://segmentfault.com/u/dongwanhong/',
  //   target: '_blank'
  // },
  // {
  //   text: '掘金',
  //   link: 'https://juejin.cn/user/870468942050759',
  //   target: '_blank'
  // },
  // {
  //   text: '简历',
  //   link: 'https://dongwanhong.gitee.io/resume/',
  //   target: '_blank',
  //   rel: 'noopener noreferrer',
  // },
];

export const sidebar = {
  '/design-pattern/': { base: '/design-pattern/', items: designPattern },
  '/effective-cpp/': { base: '/effective-cpp/', items: effectiveCpp },
  '/css/': { base: '/css/', items: CSSSidebar },
  '/demo/': { base: '/demo/', items: demoSidebar },
  '/computer-graphics/': {
    base: '/computer-graphics/',
    items: computerGraphics
  }
};
