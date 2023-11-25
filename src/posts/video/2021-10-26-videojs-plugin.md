---
thumbnail: /images/video/videojs/videojs-plugin.png
title: Videojs 插件
summary: 作为被广泛使用的 HTML5 视频播放器，Videojs 除了提供基本的播放器功能外，同时扩展性极高，拥有许多第三方开源插件，比如支持 FLV 播放的插件。
author: Kisstar
location: 北京
date: 2021-10-26
categoryKeys:
  - av
tagKeys:
  - video
  - videojs
outline: deep
---

![videojs-plugin](/images/video/videojs/videojs-plugin.png)

插件是一种遵循一定规范的应用程序接口编写出来的程序，它允许开发者根据自己的需要对框架的功能进行补充和延伸。

Video.js 的一个巨大优势就是它的插件生态系统，在 Videojs 中插件主要分为基础插件和高级插件。

## 加载插件

在 Player 组件的构造函数中，会对配置中的插件进行加载：

```js
class Player extends Component {
  constructor(tag, options, ready) {
    // ...

    if (options.plugins) {
      Object.keys(options.plugins).forEach((name) => {
        this[name](options.plugins[name]);
      });
    }
  }
}
```

可见，插件会预先作为方法放置到播放器实例（实际上是原型）上，在运行时将会收到来自用户的配置参数。

除了通过配置的方式告诉播放器加载插件外，同时也可以自主加载相应的插件，以名为 examplePlugin 的插件为例：

```js
var player = videojs('example-player');

player.examplePlugin({ customClass: 'example-class' });
```

因为插件本质上就是一个函数，所以这样的加载方式也是可行的。

## 基础插件

基础插件其实就是一个纯 JavaScript 函数，它的执行上下文被绑定到了播放器实例上，所以我们借此对播放器进行操作：

```js
function examplePlugin(options) {
  if (options.customClass) {
    this.addClass(options.customClass);
  }

  this.on('playing', function() {
    videojs.log('playback began!');
  });
}
```

当然，为了让程序知道我们的插件，我们需要对创建的插件进行注册：

```js
videojs.registerPlugin('examplePlugin', examplePlugin); // 注册
```

插件名称的唯一规定是它不能与任何现有的插件或播放器方法冲突，因为会将插件写入到播放器的原型：

```js
const createBasicPlugin = function(name, plugin) {
  const basicPluginWrapper = function() {
    // 绑定了插件执行时的上下文
    const instance = plugin.apply(this, arguments);

    return instance;
  };

  return basicPluginWrapper;
};

videojs.registerPlugin = Plugin.registerPlugin = registerPlugin(name, plugin) {
  if (Plugin.isBasic(plugin)) { // 判断是否继承了 Plugin 的实例
    Player.prototype[name] = createBasicPlugin(name, plugin); // 写入到播放器组件的原型
  }

  return plugin;
}
```

也就是说，加载插件时执行的实际上是 `basicPluginWrapper()` 函数，由于它被作为播放器的方法进行调用，所以它的执行上下文指向的是播放器。

## 高阶插件

注册一个高阶插件的方式和基础插件一致，只不过高价插件应该是一个继承了 Plugin 类的子类：

```js
const Plugin = videojs.getPlugin('plugin');

class ExamplePlugin extends Plugin {
  constructor(player, options) {
    super(player, options);

    if (options.customClass) {
      player.addClass(options.customClass);
    }

    player.on('playing', function() {
      videojs.log('playback began!');
    });
  }
}

videojs.registerPlugin('examplePlugin', ExamplePlugin); // 注册
```

内部注册时同样会对传递的插件进行包装，将播放器实例和其它配置项作为参数，并且仅会被实例化一次，以后会直接返回之前得到的实例：

```js
const createPluginFactory = (name, PluginSubClass) => {
  PluginSubClass.prototype.name = name;

  return function(...args) {
    const instance = new PluginSubClass(...[this, ...args]);

    // 插件被返回当前实例的函数所取代
    this[name] = () => instance;

    return instance;
  };
};

videojs.registerPlugin = Plugin.registerPlugin = registerPlugin(name, plugin) {
  if (Plugin.isBasic(plugin)) {
  } else {
    Player.prototype[name] = createPluginFactory(name, plugin);
  }

  return plugin;
}
```

与基础插件不同的是高阶插件内部的 `this` 指向的其实是插件实例。另外，高阶插件第一次运行前是一个工厂函数，之后会被更换为一个返回插件实例的函数。

### 生命周期

和组件一样，每个高阶插件拥有一个生命周期，它们由工厂函数创建，同时也可以使用 `dispose()` 方法进行销毁：

```js
// set up a example plugin instance
player.examplePlugin();

// dispose of it anytime thereafter
player.examplePlugin().dispose();
```

当 `dispose()` 方法执行时具有以下几种效果：

- 在插件实例上触发“dispose”事件。
- 清理插件实例上的所有事件侦听器，这有助于避免在清理对象后触发事件所导致的错误。
- 删除插件状态和对播放器的引用以避免内存泄漏。
- 将播放器的命名属性（例如 player.examplePlugin）恢复为原始工厂函数，以便重新设置插件。

此外，如果播放器被销毁，所有高级插件实例的释放也会被触发。

有时，会出现一些代码需要在插件相应周期执行的案列，此时就可以通过注册生命周期函数来实现：

- `beforepluginsetup`：在任何插件初始化之前立即触发。
- `beforepluginsetup:examplePlugin`：在初始化 examplePlugin 插件之前。
- `pluginsetup`：任何插件初始化后触发。
- `pluginsetup:examplePlugin`：在 examplePlugin 初始化后触发。

这些事件适用于基本插件和高级插件。它们在播放器上被触发，每个都包含一个额外事件数据的对象作为侦听器的第二个参数。

```js
const triggerSetupEvent = (player, hash, before) => {
  const eventName = (before ? 'before' : '') + 'pluginsetup';

  player.trigger(eventName, hash);
  player.trigger(eventName + ':' + hash.name, hash);
};
```

### 其它

除了生命周期外，更重要的是由于高阶插件继承了 Plugin 类，所以还具备了事件系统、状态管理和专属日志打印器等。

事件系统、状态管理在 Video.js 中都以 Mixin 的方式进行提供，在 Plugin 构造函数中会自动调用进行混合：

```js
class Plugin {
  constructor(player) {
    // ...

    // Make this object evented, but remove the added `trigger` method so we
    // use the prototype version instead.
    evented(this);
    delete this.trigger;

    stateful(this, this.constructor.defaultState);

    // ...
  }
}
```

日志管理同样也以单独的模块存在，在初始化时会为每个插件创建独立的日志打印器：

```js
class Plugin {
  constructor(player) {
    // ...

    if (!this.log) {
      this.log = this.player.log.createLogger(this.name);
    }

    // ...
  }
}
```

日志消息将以播放器 ID 和插件名称作为前缀：

```js
player.examplePlugin().log('hello world!');
// VIDEOJS: $PLAYER_ID: examplePlugin: hello world!
```

## 总结

插件生态系统允许来自世界各地的作者分享他们的视频播放器定制，包括从最简单的 UI 调整到新的播放技术和源处理程序的所有内容。

由于我们将插件视为 Video.js 的重要组成部分，因此该组织致力于维护一套强大的插件作者工具：[generator-videojs-plugin][1]，你还可以在 <https://videojs.com/plugins/> 找到业界现有的优秀插件。

## 参考

- [Tutorial: plugins | Video.js Documentation](https://docs.videojs.com/tutorial-plugins.html)

[1]: https://github.com/videojs/generator-videojs-plugin
