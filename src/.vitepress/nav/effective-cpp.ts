import { type DefaultTheme } from 'vitepress';

const effectiveCppSidebar: DefaultTheme.SidebarItem[] = [
  { text: '简介', link: 'index.html' },
  { text: '视 C++ 为一个语言联邦', link: '01-federation.html' },
  { text: '避免使用 #define', link: '02-avoid-define.html' },
  { text: '尽量使用 const', link: '03-use-const.html' },
  { text: '确定对象被初始化', link: '04-init-obj.html' },
  { text: 'C++ 默认提供和调用的函数', link: '05-default-fun.html' },
  { text: '明确拒绝生成不需要的函数', link: '06-refuse-explicitly.html' },
  { text: '为基态类声明 virtual 析构函数', link: '07-virtual-destructor.html' },
  { text: '别让异常逃离析构函数', link: '08-destructor-exception.html' }
];

export default effectiveCppSidebar;
