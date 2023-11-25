---
thumbnail: /images/video/videojs/videojs-logger.png
title: Video.js 日志管理
summary: 在 Video.js 中，日志管理主要是提供了前缀和等级配置功能，利用前缀可以很方便的识别日志来源，等级则便于针对不同的环境进行管理。
author: Kisstar
location: 北京
date: 2022-04-28
categoryKeys:
  - av
tagKeys:
  - video
  - videojs
outline: deep
---

<img style="width: 100%; height: 350px;" src="/images/video/videojs/videojs-logger.png" alt="Videojs Logger">

在 Video.js 中，日志管理主要是提供了前缀和等级配置功能，利用前缀可以很方便的识别日志来源，等级则便于针对不同的环境进行管理。

要获取日志打印器可以通过 `createLogger()` 方法进行创建，它接受一个字符串作为参数（该字符串将会作为打印内容的前缀），最后返回打印器。

```js
function createLogger(name) {
  let level = 'info'; // 当前等级
  let logByType;

  const log = function(...args) {
    logByType('log', level, args);
  };

  logByType = LogByTypeFactory(name, log);

  return log;
}
```

可见 `log()` 函数内部其实是调用了由工厂函数 `LogByTypeFactory()` 常见的 `logByType()` 函数，等级管理就是在其中实现的。

## 等级管理

首先，在 `log()` 函数中预设了各种等级对应的类型：

```js
log.levels = {
  all: 'debug|log|warn|error',
  off: '',
  debug: 'debug|log|warn|error',
  info: 'log|warn|error',
  warn: 'warn|error',
  error: 'error',
  DEFAULT: level,
};
```

然后，在工厂创建的函数中会根据传递的等级获取到预设配置中的类型，通过正则匹配的方式判断当前的类型是否在支持列表中，由此完成了等级上的管理。

```js
const LogByTypeFactory = (name, log) => (type, level, args) => {
  const lvl = log.levels[level];
  const lvlRegExp = new RegExp(`^(${lvl})$`);
  let fn = window.console[type];

  if (!fn && type === 'debug') {
    // 某些浏览器不支持 console.debug，在做下降级
    fn = window.console.info || window.console.log;
  }

  // 如果没有对应的方法或当前日志记录级别不允许使用此类型，则退出
  if (!fn || !lvl || !lvlRegExp.test(type)) {
    return;
  }

  fn[Array.isArray(args) ? 'apply' : 'call'](window.console, args);
};
```

## 添加前缀

在打印内容之前，内部会针对日志类型添加前缀，同时也会把创建日志打印器时传递的名称作为前缀。

```js
const LogByTypeFactory = (name, log) => (type, level, args) => {
  // ...

  if (type !== 'log') {
    // Add the type to the front of the message when it's not "log".
    args.unshift(type.toUpperCase() + ':');
  }

  // Add console prefix after adding to history.
  args.unshift(name + ':');

  // ...

  fn[Array.isArray(args) ? 'apply' : 'call'](window.console, args);
};
```

除此之外，`createLogger()` 函数还会被挂在打印器上，当通过该方法来创建新的打印器时，前缀将会进行拼接。

```js
log.createLogger = (subname) => createLogger(name + ': ' + subname);
```

## 日志记录

除了前缀和等级管理外，Video.js 还会对每次的打印内容进行记录，目前会存储 1000 条记录，超出时之前的记录将会被删除。

```js
let history = []; // 单例，所有打印器公用
const LogByTypeFactory = (name, log) => (type, level, args) => {
  // ...

  if (history) {
    history.push([].concat(args));

    // only store 1000 history entries
    const splice = history.length - 1000;

    history.splice(0, splice > 0 ? splice : 0);
  }

  // ...
};
```

同时还配套了一系列针对日志记录的管理方法。

```js
log.history = () => (history ? [].concat(history) : []);

log.history.filter = (fname) => {
  return (history || []).filter((historyItem) => {
    // if the first item in each historyItem includes `fname`, then it's a match
    return new RegExp(`.*${fname}.*`).test(historyItem[0]);
  });
};

log.history.clear = () => {
  if (history) {
    history.length = 0;
  }
};

log.history.disable = () => {
  if (history !== null) {
    history.length = 0;
    history = null;
  }
};

log.history.enable = () => {
  if (history === null) {
    history = [];
  }
};
```

## 其它

为了让外部可以切换打印级别，打印器提供了一个方法来进行处理。

```js
log.level = (lvl) => {
  if (typeof lvl === 'string') {
    if (!log.levels.hasOwnProperty(lvl)) {
      throw new Error(`"${lvl}" in not a valid log level`);
    }
    level = lvl;
  }
  return level;
};
```

此外，针对每个打印类型还提供了对应的方法，这样在使用时就不需要传递类型，语义化也更好。

```js
log.error = (...args) => logByType('error', level, args);

log.warn = (...args) => logByType('warn', level, args);

log.debug = (...args) => logByType('debug', level, args);
```

## 总结

规范清晰的日志可以帮助开发和运维人员快速定位问题，继而决定采取何种方案进行止损，所以一个良好的日志管理系统是至关重要的。
