import { type DefaultTheme } from 'vitepress';

const computerGraphics: DefaultTheme.SidebarItem[] = [
  { text: '计算机图形学', link: 'index.html' },
  { text: '图形硬件', link: 'hardware.html' },
  { text: '图形软件', link: 'software.html' },
  { text: '图像是如何渲染到屏幕的', link: 'render2screen.html' },
  { text: '图形渲染管线', link: 'pipeline.html' },
  { text: 'OpenGL 的图形渲染管线', link: 'opengl-pipeline.html' },
  { text: '绘制两个三角形', link: 'triangle.html' },
  { text: '纹理', link: 'texture.html' },
  { text: '变换', link: 'transformations.html' },
  { text: '坐标系统', link: 'coordinate.html' }
];

export default computerGraphics;
