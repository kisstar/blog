---
thumbnail: /images/vscode/extensions.png
title: VS Code 开发扩展集
summary: Visual Studio Code 在构建时考虑到了可扩展性。从 UI 到编辑体验，几乎 VS Code 的每一部分都可以通过扩展 API 进行定制和增强。事实上，VS Code 的许多核心特性都是作为扩展构建的。
author: Kisstar
location: 北京
date: 2021-12-18
categoryKeys:
  - freebie
tagKeys:
  - vscode
outline: deep
---

<img style="width: 100%; height: 300px; box-shadow: rgba(0, 0, 0, 0.1) -4px 9px 25px -6px;" src="/images/vscode/extensions.png" alt="VSCode Extensions">

Visual Studio Code 在构建时考虑到了可扩展性。从 UI 到编辑体验，几乎 VS Code 的每一部分都可以通过扩展 API 进行定制和增强。事实上，VS Code 的许多核心特性都是作为扩展构建的。

在这里列举了一些在开发中经常会使用的扩展，通过它们可以让编码变得更加高效和快乐。

## 项目管理

### [Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager)

平时在开发的过程中免不了会在多个项目之间进行切换，要么是通过最近打开的文件，要么就需要在文件系统中选择要打开的目标，现在通过 Project Manager 可以快速的在多个项目之间进行切换。

![VSCode Project Manager Extensions](/images/vscode/extensions/project-manager.png)

安装之后会在侧边栏上添加一个 ICON，点击后通过顶部提供的操作按钮可以快速的操作（添加、修改和打开等）相应的项目。

## 主题

### [Dracula Official](https://marketplace.visualstudio.com/items?itemName=dracula-theme.theme-dracula)

Dracula Official 是一个暗黑主题。

![VSCode Dracula Official Extensions](/images/vscode/extensions/dracula-official.png)

除了可以在 VS Code 使用外，官方针对众多主流 Shell 和编辑器提供了相应的程序，可以让你在多个场景中使用一致的主题。

## Git 管理

### [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

增强 Visual Studio 代码中内置的 Git 功能。GitLens 可以帮助您更好地理解代码，快速查看每行或代码块更改的对象、原因和时间。回顾历史，进一步了解代码的演变过程和原因。毫不费力地探索代码库的历史和演变。

![VSCode GitLens Extensions](/images/vscode/extensions/gitlens.png)

GitLens 还可以高度定制以满足您的需求。有关高级自定义，请参阅 GitLens 文档并编辑用户设置。

## 效率工具

### [Vim](http://aka.ms/vscodevim)

Vim 本身是一个从 [vi][vi] 发展出来的文本编辑器，和 Emacs 并列成为类 Unix 系统用户最喜欢的编辑器。如果你喜欢 Vim 编辑器的话，那么这个插件会很适合你。

![VSCode Vim Extensions](/images/vscode/extensions/vim.png)

在其 [GitHub 主页][vscode_vim_github] 上可以查看更多详细信息。

### [Code Runner](https://marketplace.visualstudio.com/items?itemName=formulahendry.code-runner)

通过 Code Runner 可以一键运行当前编辑的代码。该插件几乎支持所有的主流语言，目前已拥有超千万下载量。

![VSCode Code Runner Extensions](/images/vscode/extensions/code-reunner.png)

需要注意的是相应语言的编译器或者解释器需要自行安装，并且把路径添加到 PATH 环境变量中。

### [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

按照该插件后，可以通过右键启动具有静态和动态页面实时重新加载功能的开发本地服务器。

![VSCode Live Server Extensions](/images/vscode/extensions/live-server.png)

注意如果你的工作空间下没有任何 `.html` 或 `.htm` 文件的话需要通过特点的方式进行启动，详细信息可以参考[文档][vscode_live_server]介绍。

## 代码质量

### [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Prettier 是一个代码格式化程序。它通过解析代码并使用自己的规则重新打印代码（考虑最大行长）来强制执行一致的样式，必要时包装代码。

![VSCode Prettier Extensions](/images/vscode/extensions/prettier.png)

支持 HTML、JavaScript、TypeScript、JSON、CSS、SCSS、Less、Vue、Markdown 等多种语言。

### [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

ESLint 是一个插件化并且可配置的 JavaScript 语法规则和代码风格的检查工具。通过该插件将 ESLint 集成到 VS Code 中。

![VSCode ESLint Extensions](/images/vscode/extensions/eslint.png)

扩展使用安装在打开的工作区文件夹中的 ESLint 库。如果文件夹没有提供，扩展将查找全局安装版本。

### [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)

Markdown 标记语言具有很强的灵活性，所以许多样式都是可能的，因此格式可能不一致。有些构造在所有解析器中都不能很好地工作，应该避免使用。通过该插件可以对编写的内容进行校验。

![VSCode Markdownlint Extensions](/images/vscode/extensions/md-lint.png)

在安装了 markdownlint 的代码中编辑标记文件时，任何违反 markdownlint 规则之一的行都将在编辑器中触发警告。

## 编程语言

### [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

Volar 是专为 Vue 3 构建的语言支持插件。它基于 `@vue/reactivity` 来按需计算所有内容，以实现本机 TypeScript 语言服务级别性能。

![VSCode Volar Extensions](/images/vscode/extensions/volar.png)

如果你在使用 Vue2 的话，可以考虑使用 Vetur 插件。

### [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)

包含你所有在 Markdown 中的需求（包括键盘快捷键、自动预览等）。

![VSCode Markdown Extensions](/images/vscode/extensions/md-in-one.png)

在 [GitHub 主页][vscode_md] 上查看更多信息。

## 参考

[vi]: http://aka.ms/vscodevim
[vscode_vim_github]: https://github.com/VSCodeVim/Vim
[vscode_live_server]: https://github.com/ritwickdey/vscode-live-server
[vscode_md]: https://github.com/yzhang-gh/vscode-markdown
