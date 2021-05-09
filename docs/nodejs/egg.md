# Egg.js 的启动流程

Egg.js 为企业级框架和应用而生，其奉行『约定优于配置』，按照一套统一的约定进行应用开发，团队内部采用这种方式可以减少开发人员的学习成本。

<img :src="$withBase('/images/nodejs/eggjs.png')" alt="egg.js">

在使用的过程中你是否有如下的疑惑：

- 项目中没有入口文件，服务是如何启动的？
- 控制器和服务都在各自的目录下声明，最终是如何出现在 `app` 对象上的？

带着上面的问题我们来看一下 Egg.js 的启动流程。

## egg-bin

根据官方文档[快速入门](https://eggjs.org/zh-cn/intro/quickstart.html)中的介绍，我们可以通过命令快速创建一个 Egg 项目：

```bash
mkdir egg-example && cd egg-example
npm init egg --type=simple
npm i
```

然后运行 `npm run debug` 命令就可以启动项目了，那么这个启动命令到底做了什么？

查看项目根目录下的 package.json 文件中，我们可以看到该命令最终执行的是 `egg-bin debug`，[egg-bin][egg-bin] 是基于 [common-bin][common-bin]（封装的 CLI 开发工具）开发的。

CommonBin 则又是在 [yargs][yargs]、[co][co] 等模块的基础上，抽象封装了一个命令行工具，提供了对 async/generator 特性的支持。

<img style="height: 300px;" :src="$withBase('/images/nodejs/egg-bin.png')" alt="egg-bin">

### common-bin

CommonBin 的核心包括 `load()` 和 `start()` 方法，前者会加载指定目录下 JavaScript 文件，并将各个文件暴露的 Class 以文件名作为属性名存储在一个 Map 中。

```js
// @file: common-bin/lib/command.js
const COMMANDS = Symbol('Command#commands');

class CommonBin {
  load(fullPath) {
    // load entire directory
    const files = fs.readdirSync(fullPath);
    const names = [];
    for (const file of files) {
      if (path.extname(file) === '.js') {
        const name = path.basename(file).replace(/\.js$/, '');
        names.push(name);
        this.add(name, path.join(fullPath, file));
      }
    }
  }

  add(name, target) {
    if (!(target.prototype instanceof CommonBin)) {
      target = require(target);
      // try to require es module
      if (target && target.__esModule && target.default) {
        target = target.default;
      }
    }
    this[COMMANDS].set(name, target);
  }
}
```

当调用 `start()` 方法时，会执行实例上面的“DISPATCH”方法去处理，处理过程中根据情况会调用实例上的 `run()` 方法。

```js
const DISPATCH = Symbol('Command#dispatch');

class CommonBin {
  start() {
    co(
      function*() {
        yield this[DISPATCH]();
      }.bind(this)
    );
  }

  *[DISPATCH]() {
    // 判断是否存在 Map 中
    if (this[COMMANDS].has(commandName)) {
      const Command = this[COMMANDS].get(commandName);
      const rawArgv = this.rawArgv.slice();

      rawArgv.splice(rawArgv.indexOf(commandName), 1); // 处理参数，以便获取子命令

      // 如果存在就获取对应的值进行实例化
      const command = this.getSubCommandInstance(Command, rawArgv);
      // 调用实例上的 “DISPATCH” 方法，由于获取的值继承了 CommonBin，所以还会走到该方法
      // 由于参数在第一次处理时做了改变，所以会依次递归查找子命令
      yield command[DISPATCH]();
      return;
    }

    // 此处会定义实例上 Map 中的命令
    // 同时也会判断是否是自动补全的操作，不是的话就会调用实例上的 run 方法进行处理

    yield this.helper.callFn(this.run, [context], this);
  }
}
```

我们的处理逻辑会通过 `run()` 方法来实现，而参数就是实例上的 `context` 属性的值。另外，还可以重写 `errorHandler()` 方法来处理期间发生的错误。

### egg-bin debug

回到 egg-bin，通过查看 package.json 文件，可以发现当我们执行 `egg-bin debug` 命令时就会执行 `bin/egg-bin.js` 文件。

```json
{
  "bin": {
    "egg-bin": "bin/egg-bin.js",
    "mocha": "bin/mocha.js",
    "ets": "bin/ets.js"
  },
  "main": "index.js"
}
```

该文件的内容比较简单，主要是执行入口文件，此时会实例化 egg-bin 扩展的类，然后调用实例的 `start()` 方法。

实例化时会用到我们上面提到的 `load()` 方法将 `lib/cmd` 文件夹下的命令自动挂载到实例对象下面：

```js
// @file: egg-bin/index.js
const path = require('path');
const Command = require('./lib/command'); // 继承了 CommonBin 并重写了上下文 和 errorHandler() 方法

class EggBin extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin [command] [options]';

    // load directory
    this.load(path.join(__dirname, 'lib/cmd'));
  }
}
```

所以，后续在调用 `start()` 方法时，根据传递的参数会找到子命令 debug 对应的 `run()` 方法，其中最重要的就是使用子进程运行了“serverBin”文件：

```js
// @file: egg-bin/lib/cmd/debug.js
const cp = require('child_process');

class DebugCommand {
  *run(context) {
    const eggArgs = yield this.formatArgs(context);
    const options = {
      /* ... */
    };

    // start egg
    const child = cp.fork(this.serverBin, eggArgs, options);
  }
}
```

事实上，debug 命令继承了 dev 命令，其中“serverBin”就是在 dev 命令对应的文件中指定的，它指向的是 `../start-cluster` 文件。

在 `../start-cluster` 文件会加载有 `framework` 参数指定目录下的框架，并执行它暴露出来的 `startCluster()` 方法。

```js
// @file: egg-bin/lib/start-cluster
const options = JSON.parse(process.argv[2]); // 参数在 debug 命令中执行该文件时已经处理好了，默认为 egg
require(options.framework).startCluster(options);
```

egg 模块暴露的 `startCluster()` 方法实际上是在 egg-cluster 模块中暴露的：

```js
// @file: egg/index.js
exports.startCluster = require('egg-cluster').startCluster;
```

## egg-cluster

egg-cluster 模块专门为 Egg 提供集群管理，它会在服务器上同时启动多个进程，每个进程里都跑的是同一份源代码，并且同时监听一个端口。

```bash
├── index.js
├── lib
│   ├── agent_worker.js # Agent Worker
│   ├── app_worker.js # App Worker
│   ├── master.js # Master 进程
│   └── utils
│       ├── manager.js # 进程的记录和获取
│       ├── messenger.js # 进程间通讯
│       ├── options.js # 配置处理
│       └── terminate.js # 杀死进程
└── package.json
```

在 `startCluster` 方法中会实例化 Master 来创建一个 Master 进程：

```js
// @file: egg-cluster/index.js
const Master = require('./lib/master');

exports.startCluster = function(options, callback) {
  new Master(options).ready(callback);
};
```

Master 进程主要负责进程管理的工作（类似 pm2），它不做具体的工作，只负责启动其他进程，下面是所有进程的一个创建过程：

```bash
+---------+           +---------+          +---------+
|  Master |           |  Agent  |          |  Worker |
+---------+           +----+----+          +----+----+
     |      fork agent     |                    |
     +-------------------->|                    |
     |      agent ready    |                    |
     |<--------------------+                    |
     |                     |     fork worker    |
     +----------------------------------------->|
     |     worker ready    |                    |
     |<-----------------------------------------+
     |      Egg ready      |                    |
     +-------------------->|                    |
     |      Egg ready      |                    |
     +----------------------------------------->|
```

在创建过程中 Master 和 Worker 通过事件进行通信，各个 Worker 在准备好之后都会通知 Master，等到所有所有的进程初始化成功后，Master 通知 Agent 和 Worker 应用启动成功。

```js
// @file: egg-cluster/lib/master.js
class Master extends EventEmitter {
  constructor() {
    // fork app workers after agent started
    this.once('agent-start', this.forkAppWorkers.bind(this));

    // start fork agent worker
    this.detectPorts().then(() => {
      this.forkAgentWorker();
    });
  }

  forkAgentWorker() {
    // 创建 Agent Worker 并监听它的 message 事件，当 Agent Worker 内准备好后会发送 agent-start 事件
    // new Agent(options).ready(() => process.send({ action: 'agent-start', to: 'master' }));
  }

  forkAppWorkers() {
    // 在 Worker 中的服务就绪时就会发送 app-start 通知 Maser 进程
    // cluster.on('listening', (worker, address) => { /* emit app-start */ });
  }
}
```

其中，Worker 运行的是业务代码，负责处理真正的用户请求和定时任务的处理。
