import { type DefaultTheme } from 'vitepress';

const demo: DefaultTheme.SidebarItem[] = [
  {
    text: 'CSS',
    items: [
      {
        text: '【视差滚动】通过固定背景实现视差滚动',
        link: 'css/parallax-bg.html'
      },
      {
        text: '【视差滚动】通过监听 Scroll 事件实现视差滚动',
        link: 'css/parallax-event.html'
      },
      {
        text: '【视差滚动】通过固定定位实现视差滚动',
        link: 'css/parallax-fixed.html'
      },
      {
        text: '【视差滚动】通过 3D 转换实现视差滚动',
        link: 'css/parallax-transform.html'
      },
      {
        text: '【Flex 多列布局】通过 Flex 实现多列布局，并使用负外边距（margin）解决首列多余的边距',
        link: 'css/flex-margin-list.html'
      },
      {
        text: '【Flex 多列布局】通过 Flex 实现多列布局，并使用 gap 设置边距',
        link: 'css/flex-gap-list.html'
      }
    ]
  }
];

export default demo;
