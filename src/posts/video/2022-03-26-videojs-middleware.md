---
thumbnail: /images/video/videojs/videojs-middleware.png
title: Video.js 中间件
summary: 中间件作为 Video.js 的一个特性，它允许 Player 和 Tech 进行交互并修改它们之间的通信方式。
author: Kisstar
location: 北京
date: 2022-03-26
categoryKeys:
  - av
tagKeys:
  - video
  - videojs
outline: deep
---

<img style="width: 100%; height: 350px;" src="/images/video/videojs/videojs-middleware.png" alt="Videojs Middleware">

中间件作为 Video.js 的一个特性，它允许 Player 和 Tech 进行交互并修改它们之间的通信方式。

本质上 Video.js 中间件是一个返回对象或类实例的函数，方法与 Tech 上的方法相匹配。目前，中间件可以理解的方法集合还比较有限。

## setSource/setTech

在 Video.js 7.0.5 及更老的版本中，所有中间件都需要有 `setSource()` 方法：

```js
var myMiddleware = function(player) {
  return {
    setSource: function(srcObj, next) {
      // pass null as the first argument to indicate that the source is not rejected
      next(null, srcObj);
    },
  };
};
```

如果您的中间件没有操作、重定向或拒绝播放源，则可以在新版本的 Video.js 中忽略此方法。这样做会隐式地选择中间件。

`setTech()` 也是一个方法，在中间件决定设置哪个播放源之后，一旦播放器选择了某个特定的技术，就将其与中间件关联起来。

## Getters/Setters

```bash
+----------+                      +----------+
|          |  setter middleware   |          |
|          +---------------------->          |
|  Player  |                      |   Tech   |
|          <----------------------+          |
|          |  getter middleware   |          |
+----------+                      +----------+
```

Setters 首先在 Player 上被调用，并按照它们注册的顺序（在图中从左到右）运行中间件，然后在 Tech 上调用带有参数的方法。

Getters 首先在 Tech 上被调用，在将结果返回给播放器之前，按照注册的顺序（从图中的右到左）通过中间件运行。

## Middleware Mediators

Mediators 是一种方法，不仅可以改变 Tech 的状态，还可以将一些值返回给 Player。目前，支持播放和暂停。

Mediators 首先在播放器上被调用，按照注册的顺序运行中间件（在下图中从左到右），然后被调用到 Tech 上。结果会原封不动地返回给播放器，以注册中间件的相反顺序调用中间件（在下图中从右到左）。

```bash
+----------+                      +----------+
|          |                      |          |
|          +---mediate-to-tech---->          |
|  Player  |                      |   Tech   |
|          <--mediate-to-player---+          |
|          |                      |          |
+----------+                      +----------+
```

Mediators 做一次往返：从 Player 开始，向 Tech 进行调用，然后将结果再次返回给 Player。调用 `{method}` 方法必须由中间件提供，该中间件在向 Tech 进行中介时使用。

```bash
+----------+                      +----------+
|          |                      |          |
|          +----+call{method}+---->          |
|  Player  |                      |   Tech   |
|          <------+{method}+------+          |
|          |                      |          |
+----------+                      +----------+
```

调用 `{method}` 方法时带有两个参数：`terminated`，一个布尔值，指示中间件是否在向 Tech 部分进行中介期间终止；`value`，是 Tech 返回的值。

## Demo

你的中间件应该是一个作用域为 Player 的函数，下面是一个返回对象的中间件示例：

```js
var myMiddleware = function(player) {
  return {
    currentTime: function(ct) {
      return ct / 2;
    },
    setCurrentTime: function(time) {
      return time * 2;
    },
  };
};
```

此中间件使视频源以双倍的速度播放，将我们从 Tech 获得的时间减半，并将我们在 Tech 上设置的时间加倍。另外，还可以使用 Mediator 方法：

```js
var myMiddleware = function(player) {
  return {
    callPlay: function() {
      // Terminate by returning the middleware terminator
      return videojs.middleware.TERMINATOR;
    },
    /**
     * 在返回播放器的过程中，将调用 `{method}`，并带有两个参数
     * @param {boolean} terminated 指示中间件是否在向 Tech 部分进行中介期间终止
     * @param {any} value，是 Tech 返回的值。
     */
    play: function(terminated, value) {
      // the terminated argument should be true here.
      if (terminated) {
        console.log('The play was middleware terminated.');
      }
    },
  };
};
```

示例中的中间件总是通过在 `callPlay()` 中返回终止符来终止对 `play()` 的调用。在 Player 中，我们可以看到对 `play()` 的调用被终止，并且从未在 Tech 上被调用。

## 基础实现

中间件以视频 MIME 类型为维度进行存储，并将针对具有该类型的任何播放源运行：

```js
const middlewares = {};

videojs.use = middlewares.use = function use(type, middleware) {
  middlewares[type] = middlewares[type] || [];
  middlewares[type].push(middleware);
};

videojs.use('video/mp4', myMiddleware);
```

您还可以通过在 `*` 上注册中间件，这些中间件将在所有播放源上应用：

```js
videojs.use('*', myMiddleware);
```

调用 `player.src()` 时，Video.js 会通过调用 `setSource()` 和 `setTech()` 方法来让中间件开始工作：

```js
middleware.setSource(this, sources[0], (middlewareSource, mws) => {
  // ...

  middleware.setTech(mws, this.tech_);
});
```

在 `setSource()` 方法中会调用 `setSourceHelper()` 函数，它会递归的运行中间件：

```js
function setSourceHelper(
  src = {},
  middleware = [],
  next,
  player,
  acc = [],
  lastRun = false
) {
  const [mwFactory, ...mwrest] = middleware;

  if (typeof mwFactory === 'string') {
    setSourceHelper(src, middlewares[mwFactory], next, player, acc, lastRun);
  } else if (mwFactory) {
    // ...
  } else if (mwrest.length) {
    setSourceHelper(src, mwrest, next, player, acc, lastRun);
  } else if (lastRun) {
    next(src, acc);
  } else {
    setSourceHelper(src, middlewares['*'], next, player, acc, true);
  }
}
```

如果我们找到了一个 mwFactory，就用播放器调用它来获取 mw，然后调用 mw 的 `setSource()` 方法：

```js
const mw = getOrCreateFactory(player, mwFactory);

// 如果 setSource 不存在，则隐式选择此中间件
if (!mw.setSource) {
  acc.push(mw);
  return setSourceHelper(src, mwrest, next, player, acc, lastRun);
}

mw.setSource(assign({}, src), function(err, _src) {
  // 如果出现问题，请尝试当前级别上的下一个中间件确保使用旧的 src
  if (err) {
    return setSourceHelper(src, mwrest, next, player, acc, lastRun);
  }

  acc.push(mw);
  // 如果是同一类型，则继续当前链。否则，我们就要走新的链路
  setSourceHelper(
    _src,
    src.type === _src.type ? mwrest : middlewares[_src.type],
    next,
    player,
    acc,
    lastRun
  );
});
```

这里的 `getOrCreateFactory()` 函数主要是对执行过的中间件进行一个缓存，下次调用的时候就会返回之前的结果：

```js
function getOrCreateFactory(player, mwFactory) {
  const mws = middlewareInstances[player.id()];
  let mw = null;

  if (mws === undefined || mws === null) {
    mw = mwFactory(player);
    middlewareInstances[player.id()] = [[mwFactory, mw]];
    return mw;
  }

  for (let i = 0; i < mws.length; i++) {
    const [mwf, mwi] = mws[i];

    if (mwf !== mwFactory) {
      continue;
    }

    mw = mwi;
  }

  if (mw === null) {
    mw = mwFactory(player);
    mws.push([mwFactory, mw]);
  }

  return mw;
}
```

在处理完播放源之后，就会开始陆续调用中间件的 `setTech()` 方法：

```js
middleware.setTech = function setTech(middleware, tech) {
  middleware.forEach((mw) => mw.setTech && mw.setTech(tech));
};
```

在播放器实例上的一些 Getters 会通过 `techGet_()` 方法进行处理，它会判断对应的调用是否在 Getters Map 中存在：

```js
class Player extends Component {
  techGet_(method) {
    // ...

    // this.middleware_ 即上面在 acc 中的中间件列表
    // this.tech_ 当前加载的播放技术
    if (method in middleware.allowedGetters) {
      return middleware.get(this.middleware_, this.tech_, method);
    } else if (method in middleware.allowedMediators) {
      return middleware.mediate(this.middleware_, this.tech_, method);
    }

    try {
      return this.tech_[method]();
    } catch (e) {
      // ...
    }
  }
}
```

目前所支持的 Getters 包括：

```js
const allowedGetters = {
  buffered: 1,
  currentTime: 1,
  duration: 1,
  muted: 1,
  played: 1,
  paused: 1,
  seekable: 1,
  volume: 1,
};
```

对于这些 Getter 会优先执行 Tech 上的，然后依次从右向左依次执行，最后返回中间件处理后的结果：

```js
function get(middleware, tech, method) {
  return middleware.reduceRight(middlewareIterator(method), tech[method]());
}

function middlewareIterator(method) {
  return (value, mw) => {
    // 如果先前的中间件终止，后续的中间件将不会被调用
    if (value === TERMINATOR) {
      return TERMINATOR;
    }

    if (mw[method]) {
      return mw[method](value);
    }

    return value;
  };
}
```

类似的一些 Setters 也会调用中间件去处理，只不过调起的方式变成了 `techCall_()` 方法：

```js
class Player extends Component {
  techCall_(method, arg) {
    // If it's not ready yet, call method when it is
    this.ready(function() {
      if (method in middleware.allowedSetters) {
        return middleware.set(this.middleware_, this.tech_, method, arg);
      } else if (method in middleware.allowedMediators) {
        return middleware.mediate(this.middleware_, this.tech_, method, arg);
      }

      try {
        if (this.tech_) {
          this.tech_[method](arg);
        }
      } catch (e) {}
    }, true);
  }
}
```

目前所支持的 Setters 包括：

```js
export const allowedSetters = {
  setCurrentTime: 1,
  setMuted: 1,
  setVolume: 1,
};
```

对于这些 Setter 会先调用中间件上的方法进行处理，最后把处理后的值交给 Tech 进行处理：

```js
function set(middleware, tech, method, arg) {
  return tech[method](middleware.reduce(middlewareIterator(method), arg));
}
```

正如上面所看到的，无论是 Getter 还是 Setter，还会判断如果它存在 Mediators 中时会调用 `mediate()` 方法进行处理：

```js
function mediate(middleware, tech, method, arg = null) {
  const callMethod = 'call' + toTitleCase(method);
  const middlewareValue = middleware.reduce(
    middlewareIterator(callMethod),
    arg
  );
  const terminated = middlewareValue === TERMINATOR;
  // deprecated. The `null` return value should instead return TERMINATOR to
  // prevent confusion if a techs method actually returns null.
  const returnValue = terminated ? null : tech[method](middlewareValue);

  executeRight(middleware, method, returnValue, terminated);

  return returnValue;
}

function executeRight(mws, method, value, terminated) {
  for (let i = mws.length - 1; i >= 0; i--) {
    const mw = mws[i];

    if (mw[method]) {
      mw[method](terminated, value);
    }
  }
}
```

内部会先遍历中间件从左到右执行 `call{method}` 方法，如果期间没有传递终止的信号，那么将调用 Tech 上的方法，最后再从右到左的执行中间件上的 `{method}` 方法。

## 参考

- [Tutorial: middleware | Video.js Documentation](https://docs.videojs.com/tutorial-middleware.html)
