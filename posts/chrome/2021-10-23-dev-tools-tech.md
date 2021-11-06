---
thumbnail: /images/chrome/chrome-dev-tools-tech.png
title: Chrome DevTools 的常用小技巧
summary: 作为 Chrome 浏览器中的 Web 开发工具，Chrome DevTools 提供了许多功能，在这里我们列举了其中一些比较优秀和比较常用的点。
author: Kisstar
location: 北京
date: 2021-10-23
tags:
  - Chrome
  - DevTools
---

<img :src="$withBase('/images/chrome/chrome-dev-tools-tech.png')" alt="Chrome DevTools Tech">

调试是开发人员工作的重要组成部分，因此知道如何调试是至关重要的。有时调试可能会很困难，为了使每个开发人员都能更轻松地进行调试，以下是收集的一些在 Chrome 开发工具中使用的技巧和窍门。

## 特殊变量

当你在元素面板点击一个元素后，你可以使用 `$0` 来引用当前节点。

<img :src="$withBase('/images/chrome/dev-tools/$0.png')" alt="$0 variable">

而且你还可以使用 `$_` 来获取最近计算的表达式的值，或者通过右击输出将其存储为一个临时的全局变量。

## 对象数组打印

<img :src="$withBase('/images/chrome/dev-tools/console-table.png')" alt="console table">

对象数组是在前后端交互中是一种比较常用的数据格式，通过将表格数据显示为表格可以很方便地查看每项中包含的属性。

## 异常断点

当您想在引发异常的代码行上暂停时，可以使用异常断点。

<img :src="$withBase('/images/chrome/dev-tools/debug-on-error.png')" alt="Pause on exceptions">

另外，如果想针对请求做调试可以使用 XHR/Fetch 断点，各种事件也包含有对应的断点设置，包括针对 HTML 的修改也可以添加断点，它们都集中在 Sources 面板的右侧菜单中。

除此之外，你还可以直接在需要调试的地方使用 `debugger` 关键字，或者使用 `debug()` 函数。条件断点也是一个不错的选择，当程序运行到指定地方满足条件时则会停住。

## 查看事件

查看一个元素绑定了什么事件和对应的处理函数。

<img :src="$withBase('/images/chrome/dev-tools/event-listeners.png')" alt="Event Listeners">

## 更改 CSS 单位和值

将鼠标悬停在长度单位上，会出现一条下划线来标明它。点击它即可在弹出的下拉列表中选择新的长度单位。

<img :src="$withBase('/images/chrome/dev-tools/unit.gif')" alt="Unit">

将鼠标悬停在长度数值上，就会发现您的鼠标指针变成了可横向移动的光标。横向拖拽光标即可加减长度数值。如果想以 10 来调整长度数值，可以在拖拽的同时按下 Shift 键。

<img :src="$withBase('/images/chrome/dev-tools/value.gif')" alt="CSS Value">

## 调试伪状态

<img :src="$withBase('/images/chrome/dev-tools/pseudostate.png')" alt="pseudostate">

就在临近的位置，你也可以很方便的为当前元素添加或移除类，当然直接添加相应的样式规则也是可以的。

## 复制请求的相关信息

<img :src="$withBase('/images/chrome/dev-tools/request-info.png')" alt="Request info">

可以看到右键一个请求之后可以很方便的复制该请求的相关信息，想要找到某个请求则可以通过上方的类型选择或者使用关键字搜索，其旁边的搜索更能在响应内容中进行查找。

## 添加数据到剪贴板

<img :src="$withBase('/images/chrome/dev-tools/copy.png')" alt="Copy">

如果你想复制一个很长的对象，你必须选中对象的所有内容，但这很难，因为你必须滚动，或者你很容易就错过了一行。现在通过复制功能可以很方便的将数据复制到剪贴板。

## 截图

<img :src="$withBase('/images/chrome/dev-tools/screenshot.png')" alt="Screenshot">

通过提供的截图功能，可以很方便对节点、屏幕进行截图，而且选区截图也是支持的，这在和其它人交流时的确很方便。

## 远程网络资源映射到本地文件

<img :src="$withBase('/images/chrome/dev-tools/overrides.png')" alt="overrides">

在 Sources 面板下有一个叫做 Overrides 的标签，当你为覆盖功能选择一个目录后就可以在 Page 标签中对网络内容进行更改，当你刷新时请求返回的将是你更改后的内容。

使用这个可能可以很方便的对本地文件进行调试，当然你也可以通过代理实现这一点，不过这样更加方便。

## 运行预定义的代码片段

<img :src="$withBase('/images/chrome/dev-tools/snippets.png')" alt="snippets">

在 DevTools 中有一个名为 Snippets 的功能，它允许您编辑、保存和在网页上运行 JavaScript 代码，而不用每次复制粘贴到控制台中运行。

当你在 Sources 面板下的 Snippets 标签中添加好代码片段后，后续想要运行只需要通过按下快捷键 `Command+P` 输入感叹号来选择你想要运行的片段就可以了。

## 命令菜单

<img :src="$withBase('/images/chrome/dev-tools/command-menu.png')" alt="command-menu">

通过命令行菜单（Command+Shift+P）可以很快的改变浏览器的配置（如切换主题），或是使用一些提供的功能（如屏幕截图）等等等等。

## 参考链接

- [Web 开发工具 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/Web%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7)
- [10 tips using Chrome DevTools](https://www.talentoso.pro/insights/tips-tricks/10-tips-using-chrome-devtools/)
- [chrome 开发者工具的 11 个骚技巧](https://mp.weixin.qq.com/s/v4lrOk1tSHksxTLZjeYLJg)
- [Chrome DevTools - Chrome Developers](https://developer.chrome.com/docs/devtools/)
