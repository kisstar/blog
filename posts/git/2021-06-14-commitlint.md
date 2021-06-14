---
thumbnail: /images/git/git.png
title: Git Commit 规范
summary: 每一条提交信息都应该是有意义的，遵循规范的友好提交信息更能体现出它的价值，包括但不仅包括高可读性、方便分类和利于问题追溯。
author: Kisstar
location: 北京
date: 2021-06-14
tags:
  - Git
---

<img
  style="width: 100%; height: 350px; box-shadow: rgba(0, 0, 0, 0.1) -4px 9px 25px -6px;"
  :src="$withBase('/images/git/git.png')"
  alt="git"
/>

每一条提交信息都应该是有意义的，遵循规范的友好提交信息更能体现出它的价值。

- 高可读性: 利于 CR，Reviewer 可以明确本次提交的目的。
- 方便分类: 自动生成变更日志。对于一些 SDK 而言，可以查看每次版本升级的改动点。
- 利于追溯: 定位问题时可以快速确定范围（代码、影响）。

## Conventional Commits

社区有多种 Commit message 的写法规范，其中 [Conventional Commits 规范][1] 是目前使用比较广的，其中各项规定也比较合理和系统化。

在该规范下，提交消息的结构应如下所示：

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

`type` 是必须的，指定了本次提交的类型，用于向库的使用者传达意图：

- feat: 添加新功能。
- fix: 修复问题。
- docs: 更新文档。
- style: 代码格式化相关，与功能无关的改动。
- chore: 改变构建流程，依赖库，工具等。
- build：构建项目。
- perf：性能优化。
- refactor：重构代码。
- ci：CI 相关修改。
- test：测试用例相关修改。

`scope` 是可选的，用以描述本次修改涉及的范围。范围必须由一个名词组成。

`description` 是必须的，而且必须紧跟在冒号后面，并在类型/作用域前缀后面加空格，作为代码更改的简短摘要。

`body` 是可选的，由任意数量的换行分隔段落组成，提供有关代码更改的附加上下文信息。

`footer` 也是可选的，通常用来关联 ISSUE 和描述是否是 Break Chage 等。

## Commitlint

现在规范已经有了，接下来需要保证大家能够遵守规范。和 ESLint 一样，Commitlint 自身提供了检测的功能和一些最基础的规则。

按照官网的介绍，Commitlint 会检查提交消息是否符合上面我们介绍的规范。要在项目中使用 Commitlint 需要先按照相关的依赖：

```bash
# @commitlint/config-conventional 遵循了 Conventional Commits 规范
yarn add -D @commitlint/cli @commitlint/config-conventional
```

然后，进行简单的配置：

```bash
echo "module.exports = {extends: ['@commitlint/config-conventional']};" > commitlint.config.js
```

更进一步，我们还可以配合 Git 的钩子进行自动校验：

```bash
# Install Husky v6
yarn add husky --dev

# Activate hooks
yarn husky install

# Add hook
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

现在，规范终于落地了。

## Adapter

刚开始使用的时候，我们对提交规范可能会比较陌生，不知道存在哪些选项，又或者需要怎样选择，因此交互式的提交方式是有必要的。

官方提供了 `@commitlint/prompt-cli` 来帮助快速编写提交消息，并确保它们遵守在配置文件中配置的提交约定。

由于其交互模式差强人意，人们使用更多的提交工具是 Commitizen，当你使用它进行提交时系统也将提示你需要填写的所有必需提交字段。

```bash
yarn add -D commitizen
```

它提供了一个 `git-cz` 命令，用于代替 `git commit` 进行提交：

```json
{
  "scripts": {
    "commit": "git-cz"
  }
}
```

如果你没有任何配置那么它和普通的提交方式一样，而当你通过配置指定 Adapter 后就可以进行交互式的提交。

适配器 `@commitlint/cz-commitlint` 可以让 Commitizen 和 Commitizen 协同工作，将提交交给前者处理，后者负责进行校验。

```bash
yarn add -D @commitlint/cz-commitlint
```

```json
{
  "config": {
    "commitizen": {
      "path": "@commitlint/cz-commitlint"
    }
  }
}
```

目前，应该已经满足我们在个人开发时的需要了。

## 自定义规范

如果你觉得其中一些规则并不合需求，你也可以根据需要进行自定义，在一些团队协同中，这可能是比较常见的需求。

对于默认支持的规则，你可以在配置文件（./commitlint.config.js）的 `rules` 字段进行配置。配置项由名称和配置数组组成，配置数组的项包含：

- Level: 0 - 禁用，1 - 警告，2 - 错误。
- Applicable: always|never，never 表示反转规则。
- Value: 用于此规则的值。

具体在配置时支持以下几种方式：

```js
// Plain array
{
  rules: {
    'header-max-length': [0, 'always', 72],
  },
}

// Function returning array
{
  rules: {
    'header-max-length': () => [0, 'always', 72],
  },
}

// Async function returning array
{
  rules: {
    'header-max-length': async () => [0, 'always', 72],
  },
}

// Function returning a promise resolving to array
{
  rules: {
    'header-max-length': () => Promise.resolve([0, 'always', 72]),
  },
}
```

你可以在[这里][2]看到所有默认支持的配置项。

另外，每个插件可以导出一个包含额外规则的 `rules` 对象，其中 `key` 为规则的名称、值为校验函数。

```js
module.exports = {
  rules: {
    'dollar-sign': function(parsed, when, value) {
      // rule implementation ...
    },
  },
};
```

使用时，在配置文件中通过 `extends` 字段进行引用，然后同样按照上面的配置方式进行配置。

## 自定义 Adapter

当你的规范改变后，之前的 Adapter 可能就无法适配了。此时你可以通过 `prompt` 字段对交互提示的内容进行调整。

在该字段中主要包括 `messages` 和 `questions` 两部分，前者主要是一些提示信息，包括最大和最小长度的限制。

```js
module.exports = {
  prompt: {
    messages: {
      skip: '(press enter to skip)', // 提示如何跳过
      max: 'upper %d chars', // 提示最大字符数
      min: '%d chars at least', // 提示最小字符数
      emptyWarning: 'can not be empty', // 字段不能为空
      upperLimitWarning: 'over limit', // 超过字符限制
      lowerLimitWarning: 'below limit', // 字符数小于下限
    },
  },
};
```

后者则是针对各个块的问题描述，通过 `enum` 字段还可以设置可选列表：

```js
module.exports = {
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
        },
      },
      scope: {
        description:
          'What is the scope of this change (e.g. component or file name)',
      },
    },
  },
};
```

你可以在[这里][3]查看到更多相关信息。

## 其它配置

除了上面提到了一些配置项外，你还可以针对解析器等做进一步的配置：

```js
const Configuration = {
  /*
   * Resolve and load @commitlint/config-conventional from node_modules.
   * Referenced packages must be installed
   */
  extends: ['@commitlint/config-conventional'],
  /*
   * Resolve and load conventional-changelog-atom from node_modules.
   * Referenced packages must be installed
   */
  parserPreset: 'conventional-changelog-atom',
  /*
   * Resolve and load @commitlint/format from node_modules.
   * Referenced package must be installed
   */
  formatter: '@commitlint/format',
  /*
   * Functions that return true if commitlint should ignore the given message.
   */
  ignores: [(commit) => commit === ''],
  /*
   * Whether commitlint uses the default ignore rules.
   */
  defaultIgnores: true,
  /*
   * Custom URL to show upon failure
   */
  helpUrl:
    'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
};

module.exports = Configuration;
```

除了对 Commitlint 进行配置外，你还可以自定义符合 Commitizen 规范的 Adapter，定制方式可以参考现有的[列表][4]。

## 总结

在一个全新的项目中，如果你们没有特殊要求，使用 Conventional Commits 规范你只需要安装一下依赖，添加钩子校验：

```bash
yarn add -D @commitlint/cli @commitlint/config-conventional

# Install Husky v6
yarn add husky --dev

# Activate hooks
yarn husky install

# Add hook
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'

yarn add -D @commitlint/cz-commitlint commitizen
```

然后，再添加上命令和交互式配置就可以了：

```json
// package.json
{
  "scripts": {
    "commit": "git-cz"
  },
  "config": {
    "commitizen": {
      "path": "@commitlint/cz-commitlint"
    }
  }
}
```

## 建议

- 勤于提交：方便 CR，及时发现问题，同时也能避免代码丢失。
- 能 Rebase 就不要 Merge：清晰的提交历史便于大家追溯问题，回滚代码。

## 参考

- [commitlint - Lint commit messages](https://commitlint.js.org/#/)
- [书写友好的提交信息 | notes | Kisstar](https://kisstar.github.io/notebook/project/basis/commit-lint.html)
- [commitlint 落地推广 · 语雀](https://www.yuque.com/iyum9i/uur0qi/gg4kt7#BTuyT)
- [streamich/git-cz: Semantic Git commits](https://github.com/streamich/git-cz)

[1]: https://conventionalcommits.org/
[2]: https://commitlint.js.org/#/reference-rules
[3]: https://commitlint.js.org/#/reference-prompt
[4]: https://github.com/commitizen/cz-cli#adapters
