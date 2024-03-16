import { type DefaultTheme } from 'vitepress';

const effectiveCppSidebar: DefaultTheme.SidebarItem[] = [
  { text: '简介', link: 'index.html' },
  { text: '视 C++ 为一个语言联邦', link: '01-federation.html' },
  { text: '避免使用 #define', link: '02-avoid-define.html' },
  { text: '尽量使用 const', link: '03-use-const.html' },
  { text: '确定对象被初始化', link: '04-init-obj.html' },
  { text: 'C++ 默认提供和调用的函数', link: '05-default-fun.html' }
];

export default effectiveCppSidebar;
