import effectiveCpp from './effective-cpp';

export const nav = [
  {
    text: '专栏',
    items: [
      {
        text: 'Effective C++',
        link: '/effective-cpp/',
        activeMatch: '/effective-cpp/'
      }
    ]
  },
  {
    text: '笔记',
    link: 'https://dongwanhong.gitee.io/notebook/',
    target: '_blank'
  },
  {
    text: '掘金',
    link: 'https://juejin.cn/user/870468942050759',
    target: '_blank'
  },
  {
    text: '思否',
    link: 'https://segmentfault.com/u/dongwanhong/',
    target: '_blank'
  }
  // {
  //   text: '简历',
  //   link: 'https://dongwanhong.gitee.io/resume/',
  //   target: '_blank',
  //   rel: 'noopener noreferrer',
  // },
];

export const sidebar = {
  '/effective-cpp/': { base: '/effective-cpp/', items: effectiveCpp }
};
