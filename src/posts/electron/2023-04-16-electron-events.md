---
thumbnail: /images/electron/electron-events.png
title: electron-events，为 Electron 而生的事件模块
summary: 在大型复杂应用中 Electron 内部提供的 IPC 通信方案存在一定的局限性，本文主要讨论通过事件通信机制结合 IPC 模块实现更灵活的通信机制。
author: Kisstar
location: 北京
date: 2023-04-16
categoryKeys:
  - frontend
tagKeys:
  - electron
outline: deep
---

<img style="width: 100%; height: 300px;" src="/images/electron/electron-events.png" alt="Electron events">

Electron 是一个使用 JavaScript、HTML 和 CSS 构建桌面应用程序的框架。在 Electron 中，进程使用 ipcMain 和 ipcRenderer 模块，通过开发人员定义的“通道”传递消息来进行进程间通信。

然而，内部提供的进程通信模块在复杂应用中会存在一些使用上的缺陷，比如渲染进程间通信时必须借助主进程来“搭桥”，下面我们就来具体了解下 Electron 中的进程通信，以及如何封装基础通信模块来提高易用性。

> 注意：文中示例代码主要是为了表达核心思路而提供的代码片段，并不代表源码或者能够运行。

## 进程间通信

进程间通信 (IPC) 是在 Electron 中构建功能丰富的桌面应用程序的关键部分之一，官方先后提供了多种通信模式。

- 渲染器进程到主进程

如果想要将 IPC 消息从渲染器进程发送到主进程，可以通过 ipcRenderer.send API 发送消息，然后使用 ipcMain.on API 进行接收。

![Renderer to Main](/images/electron/renderer2main.png)

```javascript
// 主进程监听消息
ipcMain.on('channel-name', (event, ...params) => {});

// 渲染进程中通过相同的频道发送消息
ipcRenderer.send('channel-name', ...params);
```

- 主进程到渲染器进程

将消息从主进程发送到渲染器进程时，需要指定由哪一个渲染器接收消息。

当我们通过 BrowserWindow 创建新的窗口时会返回对应的窗口实例，具体消息可以通过该实例上的 WebContents.send API 进行发送，其使用方式与 ipcRenderer.send API 相同。

![Main to Renderer](/images/electron/main2renderer.png)

```javascript
// 渲染进程中监听
ipcRenderer.on('channel-name', (event, ...params) => {});

// 在主进程中发送消息
const mainWindow = new BrowserWindow();
mainWindow.webContents.send('channel-name', ...params);
```

- 渲染器进程到主进程（双向）

双向 IPC 的一个常见应用是从渲染器进程代码调用主进程模块并等待结果。 这可以通过搭配使用 ipcRenderer.invoke API 与 ipcMain.handle API 来完成。

![two-way](/images/electron/mr2rm.png)

```javascript
// 在主进程添加处理器
ipcMain.handle('channel-name', (event, ...params) => {
  return result; // 返回的内容将在触发器的处理结果中
});

// 渲染进程中通过相同的频道触发消息
const result = await ipcRenderer.invoke('channel-name', ...params);
```

当然，通过单向的通信方式进行配合也可以实现主进程和渲染进程之间的双向通信。

- 渲染器进程到渲染器进程

框架中并没有提供直接的方法在渲染器进程之间发送消息，最简单的方式就是将主进程作为渲染器之间的消息代理。

![Proxy](/images/electron/main-proxy.png)

## 原生方式的缺陷

对于一些中小型的应用而言，进程间的通信方式相对比较简单，所以通过使用框架本身提供的通信方式进行通信并可以满足需求。

随着应用越来越复杂，Electron 本身提供进程通信方式并存在一定的局限性。比如，原生的事件通信仅支持一对一的通信，而且必须指定消息发送的目的地。

更为麻烦的是，如果想要在渲染进程之间进行通信时，必须通过主进程做通信媒介，这将会使事件通信变得复杂而又难以理解、维护。

![Uncomfortable](/images/common/uncomfortable.gif)

那么，是否有更简单的方式来在 Electron 中进行进程间通信呢？

## 解决思路

为了简化事件通信的操作，[electron-events](https://github.com/kisstar/electron-events) 基于 IpcMain 和 IpcRenderer 两个模块进行了封装，同时配合窗口管理机制提供了事件广播和事件响应两种模式。

### 使用方式

为了后续更方便地通过名称来指定事件的监听来源和触发目标，在创建新的窗口时我们需要使用 [electron-events](https://github.com/kisstar/electron-events) 提供的 API 来将其存储起来：

```javascript
import { useEvents } from 'electron-events';

const mainWindow = new BrowserWindow();
const events = useEvents();

events.addWindow('app' /* window name */, mainWindow);
```

然后，你就可以通过 [electron-events](https://github.com/kisstar/electron-events) 模块来进行事件通信了：

```javascript
// Renderer process
import { useEvents } from 'electron-events';

const events = useEvents();

// 监听主进程的 say_hi 事件
events.on('main' /* 默认的主进程名称 */, 'say_hi', text => {
  console.log(text);
});

// Main process
import { useEvents } from 'electron-events';

const events = useEvents();

// 触发 app 窗口的 say_hi 事件
events.emitTo('app', 'say_hi', 'Hello World!');
```

如你所见，现在我们不需要关心当前或者目标是主进程还是渲染进程，只需要通过之前指定的名称来进行通信。

另外，如果你想监听当前窗口的事件，可以省略指定窗口的参数。同时，在触发时也可以直接使用 events.emit API 进行触发：

```javascript
// Renderer process
import { useEvents } from 'electron-events';

const events = useEvents();

events.on('say_hi', text => {
  console.log(text);
});

events.emit('say_hi', 'Hello World!');
```

以上，我们介绍了事件广播模式的基础使用方式，事件响应模式的使用方式大同小异，下面我们通过简单描述下整体的一个实现思路再来进一步了解。

### 窗口管理

窗口管理是在创建窗口时通过传入一个唯一的标识来标记窗口实例进行管理的方案，在后续发送和接受事件时可以通过标识来指定监听事件的来源或触发事件的目标。

除了上面示例中直接使用事件模块的 API 外，还可以通过单独的窗口管理 API 进行控制，其内部是主要通过 Map 进行来存储：

```typescript
import { useWindowPool } from 'electron-events';

const windowPool = useWindowPool();
```

窗口管理池基于此提供了窗口相关的 CRUD 等基础操作。

```javascript
windowPool.add('app' /* window name */, mainWindow);
windowPool.remove('app' /* window name */);
```

事实上，events.addWindow API 内部调用的就是 windowPool.add API。

### 广播模式

对事件总线 EventBus 大家都比较了解，EventBus 通常作为多个模块间的通信机制，相当于一个事件管理中心，一个模块发送消息，其它模块并可以接受消息。

![Event Bus](/images/electron/event-bus.png)

electron-events 提供的广播模式和 EventBus 非常类似，在该模式中主要包含消息订阅者和发布者两个角色，它们可以是主进程或者是任意一个渲染进程。

其中，消息订阅者可以根据需要订阅自己关心的某个窗口的事件，当发布者发布该事件时，所有订阅都将受到消息。发布者并不关心消息的接受者是谁，也不关系对应处理器的执行结果：

```javascript
// Main process
import { useEvents } from 'electron-events';

const mainWindow = new BrowserWindow();
const secondWindow = new BrowserWindow();
const events = useEvents();

events.addWindow('app' /* window name */, mainWindow);
events.addWindow('second', secondWindow);

// mainWindow
import { useEvents } from 'electron-events';

const events = useEvents();
events.on('second', 'test', (...params) => {}); // 监听来自 second 窗口的 test 事件

// secondWindow
import { useEvents } from 'electron-events';

const events = useEvents();
events.emitTo('app', 'test', ...params); // 向 app 窗口发送 test 事件
```

在实现上，内部使用了 Electron 提供的 IPC 和 Node.js 中 events 模块的 EventEmitter 类。核心思路就是重写了后者添加、移除、触发等核心方法，以便能够指定监听和触发的对象（窗口），以监听函数为例：

```javascript
class IpcEvents {
  protected eventMap = new EventEmitter();

  on(
    windowName: string,
    eventName: string,
    listener: Function
  ): this {
    this.eventMap.on(`${windowName}-${eventName}`, listener);

    return this;
  }
}
```

原先，我们只需要指定监听的事件和对应的处理函数，现在我们还可以指定想要订阅的窗口。

触发事件则相对要复杂些，因为我们需要让主进程和其它渲染进程也能收到通知。当在主进程中时，我们需要获取并遍历所有已知的窗口，然后将触发事件的来源窗口的具体触发的事件、参数传递过去：

```javascript
BrowserWindow.getAllWindows().forEach(toWindow => {
  toWindow.webContents.send(EVENT_CENTER, {
    fromName: 'app' /* 触发事件的窗口名称 */,
    eventName: 'test' /* 触发的事件名 */,
    payload: [] /* 参数列表 */
  });
});
```

接着在渲染进程里会监听 EVENT_CENTER 事件，根据来源和事件名触发之前添加的监听器：

```javascript
ipcRenderer.on(EVENT_CENTER, (_, { fromName, eventName, payload }) => {
  this.eventMap.emit(`${fromName}-${eventName}`, ...payload);
});
```

若是触发事件时是在渲染进程，那么我们则需要以主进程为桥梁，先将事件发送至主进程然后再进行分发。

### 响应模式

响应模式其实是一种应答模式。顾名思义，就是在发出事件之后可以得到对方的响应结果。对应的使用方式和框架提供的 ipcRenderer.invoke API 与 ipcMain.handle API 非常类似。

![Reponse](/images/electron/reponse.png)

通过 electron-events 提供的响应试 API 进行通信时同样不必关系进程类型，你完全可以在主进程中发送事件并等待渲染进程的处理结果：

```javascript
// Main process
import { useEvents } from 'electron-events';

const events = useEvents();
const result = await events.invokeTo('second', 'test', ...params); // 向 second 窗口的 test 通道发起请求

// secondWindow
import { useEvents } from 'electron-events';

const events = useEvents();
// 处理来自主进程的 test 事件
events.handle('main', 'test', (...params) => {
  return result;
});
```

与广播模式类似，内部基于 IPC 提供了 events.handle API 和 events.invokeTo API 来添加处理函数和触发事件。添加处理函数时与之前添加监听器类似，只是单个事件只能监听一次：

```javascript
class IpcEvents {
  protected responsiveEventMap = new Map<string, Function>();

  handle(windowName: string, eventName: string, listener: Function): this {
    // if (this.responsiveEventMap.get(`${windowName}-${eventName}`)) { throw error }
    this.responsiveEventMap.set(`${windowName}-${eventName}`, listener);

    return this;
  }
}
```

而在具体处理函数部分，同样需要区分主进程和渲染进程，如果触发时所处主进程，则需要将所有事件发送给渲染进程并监听对应的处理结果，由于 Electron 并没有提供对应的等待渲染进程处理结果的 API，所以我们需要通过 IPC 来获取。

此处大致的思路就是针对每个窗口创建一个唯一的事件名，然后将事件触发的来源、事件名和相应的参数一起发送给渲染进程：

```javascript
BrowserWindow.getAllWindows().map(toWindow => {
  const handlerName = getUUID();

  toWindow.webContents.send(EVENT_CENTER, {
    handlerName, // 唯一的事件名
    fromName: 'app' /* 触发事件的窗口名称 */,
    eventName: 'test' /* 触发的事件名 */,
    payload: [] /* 参数列表 */
  });

  // 在主进程中针对唯一的事件名添加处理函数以接受处理结果
  return ipcMain.handleOnce(handlerName, (_, result) => {
    return result;
  });
});
```

然后在渲染进程中处理完成后再通过刚刚生成的唯一的事件名将处理结果返回：

```javascript
ipcRenderer.on(
  EVENT_CENTER,
  async (_, { handlerName, fromName, eventName, payload }) => {
    const handler = this.responsiveEventMap.get(`${fromName}-${eventName}`);
    const result = await handler(...payload);

    // 通过传递过来的事件名返回执行结果
    ipcRenderer.invoke(handlerName, result);
  }
);
```

类似的，若是触发事件时是在渲染进程，那么我们则需要以主进程为桥梁，先将事件发送至主进程然后再进行分发并等待结果。

## 总结

如你所见，当你使用 [electron-events](https://github.com/kisstar/electron-events) 进行事件通信时，你不关系进程相关的概念，只需要通过名称来进行指定触发和接受的对象，好比是在同一个进程中进行通信一样。

![Electron events](/images/electron/electron-events-round.png" height="300)

目前，[electron-events](https://github.com/kisstar/electron-events) 模块的源码提供在 GitHub，可以当做是一种参考，欢迎大家优化使用。

## 参考

- [进程间通信 | Electron](https://www.electronjs.org/zh/docs/latest/tutorial/ipc)
- [基于 Electorn 的轻量级开发框架](https://github.com/SugarTurboS/Sugar-Electron)
