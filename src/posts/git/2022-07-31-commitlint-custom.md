---
thumbnail: /images/git/git-lint-custom.png
title: 如何定制化提交信息
summary: 友好的提交信息对于团队协作而言非常重要，在实际的使用当中，各个团体的提交规范很可能存在差异，为了适应不同场景需要对规范进行一些定制化处理。
author: Kisstar
location: 北京
date: 2022-07-31
tags:
  - Git
---

<img
  style="width: 100%; height: 350px; box-shadow: rgba(0, 0, 0, 0.1) -4px 9px 25px -6px;"
  src="/images/git/git-lint-custom.png"
  alt="git"
/>

友好的提交信息对于团队协作而言非常重要，开源社区已经为我们总结出了一种用于给提交信息增加人机可读含义的 [Conventional Commits][conventional_commits] 规范，同时配套有交互式提交工具 [commitizen][commitizen] 和校验工具 [commitlint][commitlint]。

在实际的使用当中，各个团体的提交规范很可能存在差异，所以为了适应不同的需要我们需要针对交互式提交和校验规则进行一定程度的定制，好在二者都提供了相应的支持。

## 扩展 Adapter

社区中已经提供了一些 Adapter，如果你没有找到合适的，那么就可以通过其中的 [cz-customizable][cz-customizable] 来自定义交互时的行为。

```bash
# 安装
yarn add -D cz-customizable
# Peer Dependencies: commitizen
```

安装好模块后，通过配置告诉 [commitizen][commitizen] 使用 [cz-customizable][cz-customizable] 适配器：

```json
// package.json
{
  "config": {
    "commitizen": {
      "path": "node_modules/cz-customizable"
    }
  }
}
```

最后在项目根目录下创建交互内容的配置文件（.cz-config.js 或 .config/cz-config.js）或在包文件指定配置文件所在：

```json
// package.json
{
  "config": {
    "cz-customizable": {
      "config": "config/path/to/my/config.js"
    }
  }
}
```

然后就可以在配置文件中进行具体的配置了，官方也提供了[配置示例][cz-config-example]，可以参考示例进行更改，更多详情见[官方介绍][cz-customizable-options]。

### 校验自定义的提交信息

当我们使用 [cz-customizable][cz-customizable] 更改了交互式提交的内容后，就需要使用 [commitlint-config-cz][commitlint-config-cz] 对其进行校验了。

```bash
# 安装
yarn add -D commitlint-config-cz
# Peer Dependencies: commitizen, cz-customizable
```

然后扩展 [commitlint][commitlint] 配置文件中的配置：

```js
// commitlint.config.js
module.exports = {
  extends: ['other-config', 'cz']
};
```

现在，您可以在一个位置（上述 cz-customizable 的配置文件）统一管理 [cz-customizable][cz-customizable] 和 [commitlint][commitlint] 的提交类型/范围了。

## 扩展 Rules

对于 [commitlint][commitlint] 默认支持的规则，可以根据团队要求在相应配置文件的 `rules` 字段进行配置。

```js
module.exports = {
  rules: {
    'body-max-line-length': [2, 'always', 100]
  }
};
```

另外，为它提供的每个插件也可以导出一个包含额外规则的 `rules` 对象，其中 `key` 为规则的名称、值为校验函数。

```js
module.exports = {
  rules: {
    'dollar-sign': function(parsed, when, value) {
      // rule implementation ...
    }
  }
};
```

通过本地插件的方式可以很方便的添加额外的规则：

```js
// commitlint.config.js
module.exports = {
  rules: {
    'hello-world-rule': [2, 'always']
  },
  plugins: [
    {
      rules: {
        'hello-world-rule': ({ subject }) => {
          const HELLO_WORLD = 'Hello World';
          return [
            subject.includes(HELLO_WORLD),
            `Your subject should contain ${HELLO_WORLD} message`
          ];
        }
      }
    }
  ]
};
```

更多信息可以参考[官方介绍][reference-plugins]。

### 配套的 Adapter

除了可以通过插件扩展校验规则外，[commitlint][commitlint] 针对 [commitizen][commitizen] 提供的 [@commitlint/cz-commitlint][cz-commitlint] 适配器也支持对交互内容进行定制。

```bash
# 安装
yarn add -D @commitlint/cz-commitlint
# Peer Dependencies: @commitlint/cli, commitizen
```

配置 [commitizen][commitizen] 使用 [@commitlint/cz-commitlint][cz-commitlint] 适配器：

```json
// package.json
{
  "config": {
    "commitizen": {
      "path": "@commitlint/cz-commitlint"
    }
  }
}
```

然后就是在配置文件中进行具体的配置了，具体可参考[官方介绍][reference-prompt]。

## Adapters 本质

使用 [commitizen][commitizen] 提交时，系统会提示您在提交时填写任何必需的提交字段，避免等到 Git 提交钩子运行时拒绝您的提交。

在[commitizen][commitizen]的内部运行时会进行一些初始化工作，然后加载相应的配置文件，如果没有加载到将会使用普通的 Git 命令进行提交。

![adapter-flow](/images/git/adapter-flow.png" height="410)

否则，将会调用指定 Adapter 的 `prompter()` 方法，从而获取到用户的提交信息，在钩子模式下会将其写入到工作目录下 `.git/COMMIT_EDITMSG` 文件中。

所以，要创建一个自定义的适配器也很方便，调用`prompter()` 方法时 [commitizen][commitizen] 向 Adapters 提供了一个 [Inquirer.js][inquirer] 实例，以此来获取用户的输入，然后调用 `commit` 回调。

```js
module.exports = {
  // When a user runs `git cz`, prompter will be executed.
  // We pass you cz, which currently is just an instance of inquirer.js.
  // Using this you can ask questions and get answers.
  //
  // The commit callback should be executed when you're ready to
  // send back a commit template to git.
  //
  // By default, we'll de-indent your commit template and
  // will keep empty lines.
  prompter: function(inquirer, commit) {
    commit('chore: comit message');
  }
};
```

至于如何使用 [Inquirer.js][inquirer] 获取信息则可以参考它的官方介绍。

事实上，我们完全可以使用任何必要的手段捕获输入，最终只要用字符串调用 `commit` 回调就可以了。

## 校验流程

校验工具 [commitlint][commitlint] 是一个基于 [Yargs][yargs] 实现的一个命令行工具，它的核心流程主要包括获取提交信息-校验信息-输出报告：

![lint-flw](/images/git/lint-flow.png)

几乎每个步骤都对应了一个相应的 NPM 模块：

![lint-cli](/images/git/lint-cli.png)

在获取提交信息时，来源可以是从标准输入或者是从指定范围/上次编辑中读取提交消息：

![lint-message](/images/git/get-lint-message.png" height="350)

获取到提交信息后，在校验之前还会进行一次解析，将提交消息解析为结构化数据，默认使用的是 [conventional-commits-parser][conventional-commits-parser] 模块中的 `sync()` 函数。

```js
// 提交信息为 test: test message
// 解析后，它的输出结果大致如下所示
{
  type: 'test',
  scope: null,
  subject: 'test message',
  merge: null,
  header: 'test: test message',
  body: null,
  footer: null,
  notes: [],
  references: [],
  mentions: [],
  revert: null,
  raw: 'test: test message\n'
}
```

回到上面规则扩展的部分，每个规则的第一个参数其实拿到的就是这里解析出来的结果，这样就可以很方便地针对提交信息的每个部分做出校验，结果返回一个数组。

```js
module.exports = {
  rules: {
    'dollar-sign': function(parsed, when, value) {
      return [true /* 是否通过校验 */, '错误后的提示信息'];
    }
  }
};
```

当然具体的解析方式官方也提供了自定义的能力，你可以通过在配置文件中添加 `parserPreset` 字段进行配置。

最后，会将校验的结果整理起来并进行格式化的输出，格式化的方式也可以通过 `formatter` 字段进行配置。

## 总结

让 [commitizen][commitizen] 和 [commitlint][commitlint] 相互配合，同时运用其高度可配的特性，可以很方便的制定出符合团队要求的提交规范，这对于团队来说是有益的，希望可以在工作中落地，规范研发流程。

## 参考

- [Commitizen by commitizen](http://commitizen.github.io/cz-cli/)
- [commitlint - Lint commit messages](https://commitlint.js.org/)
- [Inquirer.js][inquirer]

[conventional_commits]: https://www.conventionalcommits.org/en/v1.0.0/
[commitizen]: https://github.com/commitizen/cz-cli
[commitlint]: https://github.com/conventional-changelog/commitlint
[cz-customizable]: https://github.com/leoforfree/cz-customizable
[cz-customizable-options]: https://github.com/leoforfree/cz-customizable#options
[cz-config-example]: https://github.com/leoforfree/cz-customizable/blob/master/cz-config-EXAMPLE.js
[commitlint-config-cz]: https://github.com/whizark/commitlint-config-cz
[reference-plugins]: https://commitlint.js.org/#/reference-plugins
[cz-commitlint]: https://www.npmjs.com/package/@commitlint/cz-commitlint
[reference-prompt]: https://commitlint.js.org/#/reference-prompt
[inquirer]: https://github.com/sboudrias/inquirer.js/
[yargs]: https://github.com/yargs/yargs
[conventional-commits-parser]: https://github.com/conventional-changelog/conventional-changelog
